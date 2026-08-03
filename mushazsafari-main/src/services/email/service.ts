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
   * Loads credentials from Firestore (Priority) or Env Variables (Fallback)
   */
  private async getConfig() {
    const { firestore } = initializeFirebase();
    const configDoc = await getDoc(doc(firestore, 'system', 'config'));
    const data = configDoc.exists() ? configDoc.data() : {};

    const host = data.emailHost || process.env.SMTP_HOST || "mialesafari.com";
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

  public async sendBookingRequest(data: any, signature?: string) {
    const config = await this.getConfig();
    const transporter = this.createTransporter(config);
    return transporter.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: config.adminEmail,
      subject: `Expedition Inquiry: ${data.fullName}`,
      html: templates.bookingRequest(data, signature || "MIALE • ARUSHA"),
    });
  }

  public async sendContactInquiry(data: any, signature?: string) {
    const config = await this.getConfig();
    const transporter = this.createTransporter(config);
    return transporter.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: config.adminEmail,
      subject: `Website Inquiry from ${data.fullName}`,
      html: templates.contactInquiry(data, signature || "MIALE • ARUSHA"),
    });
  }

  public async sendOrderNotification(order: any, signature?: string) {
    const config = await this.getConfig();
    const transporter = this.createTransporter(config);
    
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: config.adminEmail,
      subject: `New Booking Ticket — ${order.customerName}`,
      html: templates.orderTicket(order, signature || "MIALE • ARUSHA"),
    });

    if (order.email) {
      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromAddress}>`,
        to: order.email,
        subject: `Your Miale booking request has been received!`,
        html: templates.orderTicket(order, signature || "MIALE • ARUSHA"),
      });
    }
  }

  public async sendDiagnostic(recipient: string) {
    const config = await this.getConfig();
    const transporter = this.createTransporter(config);
    return transporter.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: recipient,
      subject: `SMTP Diagnostic: Connection Active`,
      html: templates.test(recipient),
    });
  }
}

export const emailService = EmailService.getInstance();
