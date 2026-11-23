/**
 * @fileOverview Production-grade Email Service for Miale.
 * Handles dynamic SMTP configuration, Port 465 -> 587 auto-fallback, 
 * and detailed diagnostic reporting.
 */

import nodemailer from 'nodemailer';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { templates } from './templates';

export type SMTPDiagnosticResult = {
  success: boolean;
  verified: boolean;
  smtpHost: string;
  port: number;
  secure: boolean;
  responseTime?: string;
  message: string;
  errorDetail?: string;
  suggestedFix?: string;
};

class EmailService {
  private static instance: EmailService;
  
  private readonly DEFAULT_TIMEOUTS = {
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  };

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Reads the admin-authored settings document.
   * firestore.rules restricts /system/{id} to signed-in staff, so an anonymous
   * request from a public form endpoint gets permission-denied rather than an
   * empty snapshot. Falling back to environment settings keeps mail flowing.
   */
  private async readConfigDoc(): Promise<Record<string, any>> {
    try {
      const { firestore } = initializeFirebase();
      const configDoc = await getDoc(doc(firestore, 'system', 'config'));
      return configDoc.exists() ? configDoc.data() : {};
    } catch (error: any) {
      console.warn('[SMTP] system/config unavailable, using environment settings:', error?.code || error?.message);
      return {};
    }
  }

  public async getCompanySignature(): Promise<string> {
    const data = await this.readConfigDoc();
    return data.companySignature || "MIALE • ARUSHA";
  }

  /**
   * Loads credentials from Firestore (Priority) or Env Variables (Fallback)
   */
  private async getConfig() {
    const data = await this.readConfigDoc();

    // The bare domain no longer routes to the mail server (its DNS record
    // moved off Hostinger), so Hostinger's SMTP hostname is the default.
    const host = data.emailHost || process.env.SMTP_HOST || "smtp.hostinger.com";
    const port = Number(data.emailPort || process.env.SMTP_PORT || 465);
    const user = data.emailUser || process.env.SMTP_USER || "info@mialesafari.com";
    const pass = data.emailPass || process.env.SMTP_PASS;
    const fromName = process.env.EMAIL_FROM_NAME || "Miale";
    const fromAddress = data.emailUser || process.env.EMAIL_FROM_ADDRESS || "info@mialesafari.com";
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "info@mialesafari.com";

    if (!pass) {
      throw new Error("SMTP Credentials (Password) missing in settings and environment.");
    }

    return { host, port, user, pass, fromName, fromAddress, adminEmail };
  }

  /**
   * Creates a transporter with specific security logic
   */
  private createTransporter(config: any, portOverride?: number, secureOverride?: boolean) {
    const port = portOverride || config.port;
    const secure = secureOverride !== undefined ? secureOverride : (port === 465);

    return nodemailer.createTransport({
      host: config.host,
      port: port,
      secure: secure,
      requireTLS: port === 587,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false, // Essential for domain-specific private certificates
        minVersion: 'TLSv1.2'
      },
      ...this.DEFAULT_TIMEOUTS,
    });
  }

  /**
   * Diagnostic verification with Port 465 -> 587 fallback
   */
  public async verifyConnection(): Promise<SMTPDiagnosticResult> {
    const startTime = Date.now();
    let config;
    
    try {
      config = await this.getConfig();
    } catch (e: any) {
      return {
        success: false,
        verified: false,
        smtpHost: 'N/A',
        port: 0,
        secure: false,
        message: "Configuration Error",
        errorDetail: e.message,
        suggestedFix: "Ensure SMTP_PASS is set in environment or saved in Admin Settings."
      };
    }

    console.log(`[SMTP] Diagnostic initiated for ${config.host} on Port ${config.port}`);

    // Attempt 1: Configured Port (Usually 465)
    try {
      const transporter = this.createTransporter(config);
      await transporter.verify();
      const responseTime = `${Date.now() - startTime}ms`;
      
      return {
        success: true,
        verified: true,
        smtpHost: config.host,
        port: config.port,
        secure: config.port === 465,
        responseTime,
        message: "SMTP connection successful via primary port."
      };
    } catch (primaryError: any) {
      console.warn(`[SMTP] Primary attempt (Port ${config.port}) failed:`, primaryError.code);

      // If it's a timeout and we tried 465, try fallback to 587
      if ((primaryError.code === 'ETIMEDOUT' || primaryError.code === 'ECONNREFUSED') && config.port === 465) {
        console.log("[SMTP] Retrying via Port 587 STARTTLS fallback...");
        try {
          const fallbackTransporter = this.createTransporter(config, 587, false);
          await fallbackTransporter.verify();
          const responseTime = `${Date.now() - startTime}ms`;
          
          return {
            success: true,
            verified: true,
            smtpHost: config.host,
            port: 587,
            secure: false,
            responseTime,
            message: "Success via fallback. Note: Your server prefers Port 587 STARTTLS."
          };
        } catch (fallbackError: any) {
          return this.mapErrorToDiagnostic(fallbackError, config.host, 587);
        }
      }

      return this.mapErrorToDiagnostic(primaryError, config.host, config.port);
    }
  }

  private mapErrorToDiagnostic(error: any, host: string, port: number): SMTPDiagnosticResult {
    let message = "SMTP connection failed.";
    let detail = error.message;
    let fix = "Check your SMTP host and firewall settings.";

    if (error.code === 'ETIMEDOUT') {
      message = "Connection Timed Out.";
      detail = `Port ${port} is likely blocked by your cloud host or firewall.`;
      fix = "Try switching to Port 587 in settings, or check your mail server's allowed IP list.";
    } else if (error.code === 'EAUTH') {
      message = "Authentication Failed.";
      detail = "The SMTP server rejected your username or password.";
      fix = "Verify info@mialesafari.com credentials. If using Gmail/Outlook, use an 'App Password'.";
    } else if (error.code === 'ESOCKET') {
      message = "TLS Handshake Failed.";
      detail = "The server rejected the SSL/TLS security certificate.";
      fix = "Ensure you are using the correct port for the selected security mode.";
    } else if (error.code === 'ENOTFOUND') {
      message = "DNS Lookup Failed.";
      detail = `Could not resolve host ${host}.`;
      fix = "Check the SMTP Host spelling (e.g., mialesafari.com).";
    }

    return {
      success: false,
      verified: false,
      smtpHost: host,
      port: port,
      secure: port === 465,
      message,
      errorDetail: detail,
      suggestedFix: fix
    };
  }

  /**
   * Sends one message, retrying over port 587 STARTTLS when the configured
   * 465 socket is unreachable. Cloud hosts commonly block 465 egress, and the
   * verify path already treated 587 as the fallback, so sending must too.
   */
  private async dispatch(config: Awaited<ReturnType<EmailService['getConfig']>>, mail: nodemailer.SendMailOptions) {
    const attempts: Array<[number, boolean]> = [[config.port, config.port === 465]];
    if (config.port === 465) attempts.push([587, false]);

    let lastError: any;
    for (const [port, secure] of attempts) {
      try {
        await this.createTransporter(config, port, secure).sendMail(mail);
        return { port };
      } catch (error: any) {
        lastError = error;
        console.warn(`[SMTP] Send failed on port ${port}:`, error.code || error.message);
        const retryable = ['ETIMEDOUT', 'ECONNREFUSED', 'ECONERROR', 'ESOCKET'].includes(error.code);
        if (!retryable) break;
      }
    }
    throw lastError;
  }

  /**
   * Non-throwing notification send for visitor-facing forms: the caller needs to
   * know whether the office was told, not to surface a mail-server fault.
   */
  public async trySendContactInquiry(
    data: any,
    signature?: string,
  ): Promise<{ sent: boolean; detail?: string }> {
    try {
      const config = await this.getConfig();
      await this.dispatch(config, {
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to: config.adminEmail,
        replyTo: data.email,
        subject: `Website Inquiry from ${data.fullName}`,
        html: templates.contactInquiry(data, signature || "MIALE • ARUSHA"),
      });
      return { sent: true };
    } catch (error: any) {
      console.error('[SMTP] Contact inquiry not delivered:', error?.code || error?.message);
      return { sent: false, detail: error?.message };
    }
  }

  public async sendBookingRequest(data: any, signature?: string) {
    const config = await this.getConfig();
    return this.dispatch(config, {
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: config.adminEmail,
      subject: `Expedition Inquiry: ${data.fullName}`,
      html: templates.bookingRequest(data, signature || "MIALE • ARUSHA"),
    });
  }

  public async sendContactInquiry(data: any, signature?: string) {
    const config = await this.getConfig();
    return this.dispatch(config, {
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: config.adminEmail,
      replyTo: data.email,
      subject: `Website Inquiry from ${data.fullName}`,
      html: templates.contactInquiry(data, signature || "MIALE • ARUSHA"),
    });
  }

  public async sendOrderNotification(order: any, signature?: string) {
    const config = await this.getConfig();

    await this.dispatch(config, {
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: config.adminEmail,
      subject: `New Booking Ticket — ${order.customerName}`,
      html: templates.orderTicket(order, signature || "MIALE • ARUSHA"),
    });

    if (order.email) {
      await this.dispatch(config, {
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to: order.email,
        subject: `Your Miale booking request has been received!`,
        html: templates.orderTicket(order, signature || "MIALE • ARUSHA"),
      });
    }
  }

  public async sendDiagnostic(recipient: string) {
    const config = await this.getConfig();
    return this.dispatch(config, {
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: recipient,
      subject: `SMTP Diagnostic: Connection Active`,
      html: templates.test(recipient),
    });
  }
}

export const emailService = EmailService.getInstance();
