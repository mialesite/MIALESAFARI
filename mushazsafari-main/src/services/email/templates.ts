/**
 * @fileOverview Miale Email Templates
 * Centralized registry of high-end HTML email layouts.
 */

const STYLES = `
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f7f3; color: #1e1e1e; }
  .wrapper { padding: 40px 20px; }
  .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #e8ddc4; }
  .header { background: #23412e; padding: 50px 30px; text-align: center; }
  .header h1 { margin: 0; color: #b68d40; font-size: 24px; text-transform: uppercase; letter-spacing: 5px; font-weight: 300; }
  .content { padding: 40px; }
  .section-title { font-size: 11px; font-weight: 900; color: #b68d40; text-transform: uppercase; margin-bottom: 25px; border-bottom: 1px solid #f0eee8; padding-bottom: 10px; letter-spacing: 3px; }
  .label { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; font-weight: bold; }
  .value { font-size: 16px; color: #1e1e1e; font-weight: 500; margin-bottom: 15px; }
  .footer { background: #23412e; padding: 30px; text-align: center; color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; line-height: 1.6; }
  .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .table td, .table th { padding: 15px; border-bottom: 1px solid #f0eee8; font-size: 14px; }
  .price { color: #b68d40; font-weight: bold; }
`;

const layout = (title: string, content: string, signature: string) => `
  <!DOCTYPE html>
  <html>
  <head><style>${STYLES}</style></head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header"><h1>${title}</h1></div>
        <div class="content">${content}</div>
        <div class="footer">${signature || 'MIALE • ARUSHA, TANZANIA'}</div>
      </div>
    </div>
  </body>
  </html>
`;

export const templates = {
  test: (recipient: string) => layout(
    'SYSTEM DIAGNOSTIC',
    `
    <div class="section-title">Connectivity Verified</div>
    <p>Your SMTP relay is correctly authorized and operational.</p>
    <div class="label">Recipient</div>
    <div class="value">${recipient}</div>
    <div class="label">Timestamp</div>
    <div class="value">${new Date().toLocaleString()}</div>
    `,
    'Miale Infrastructure Core'
  ),

  bookingRequest: (data: any, signature: string) => layout(
    'BESPOKE EXPEDITION REQUEST',
    `
    <div class="section-title">Client Identity</div>
    <div class="label">Full Name</div><div class="value">${data.fullName}</div>
    <div class="label">Email Address</div><div class="value">${data.email}</div>
    <div class="label">Nationality</div><div class="value">${data.nationality || 'Not specified'}</div>

    <div class="section-title">Journey Metrics</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div><div class="label">Start Date</div><div class="value">${data.startDate || 'TBD'}</div></div>
      <div><div class="label">Departure</div><div class="value">${data.endDate || 'TBD'}</div></div>
      <div><div class="label">Party Size</div><div class="value">${data.adults} Adults / ${data.children} Children</div></div>
      <div><div class="label">Tier</div><div class="value" style="text-transform: capitalize;">${data.tier}</div></div>
    </div>

    <div style="margin-top: 20px; padding: 20px; background: #23412e; border-radius: 15px; text-align: center;">
      <div class="label" style="color: rgba(255,255,255,0.5);">Target Budget</div>
      <div class="value" style="color: #b68d40; font-size: 24px;">${data.budget ? `$${data.budget}` : "Not stated"}</div>
    </div>

    <div class="section-title" style="margin-top: 40px;">The Brief</div>
    <div style="background: #fcfbf9; padding: 25px; border-radius: 20px; border: 1px solid #f0eee8; font-style: italic; font-size: 14px; line-height: 1.6; color: #555;">
      "${data.requests || 'No specific requests provided.'}"
    </div>
    `,
    signature
  ),

  contactInquiry: (data: any, signature: string) => layout(
    'NEW WEBSITE INQUIRY',
    `
    <div class="section-title">Sender Details</div>
    <div class="label">Name</div><div class="value">${data.fullName}</div>
    <div class="label">Email</div><div class="value">${data.email}</div>
    <div class="label">Phone</div><div class="value">${data.phone || 'N/A'}</div>
    <div class="label">Travel Window</div><div class="value">${data.travelWindow || 'N/A'}</div>
    <div class="label">Party Size</div><div class="value">${data.partySize || 'N/A'}</div>
    
    <div class="section-title" style="margin-top: 30px;">Message</div>
    <div style="background: #fcfbf9; padding: 25px; border-radius: 20px; border: 1px solid #f0eee8; font-style: italic; font-size: 14px; line-height: 1.6; color: #555;">
      "${data.message}"
    </div>
    `,
    signature
  ),

  orderTicket: (order: any, signature: string) => {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;" class="price">${item.price}</td>
      </tr>
    `).join('');

    return layout(
      'EXPERIENCE TICKET',
      `
      <div class="section-title">Client Profile</div>
      <div class="label">Name</div><div class="value">${order.customerName}</div>
      <div class="label">Contact</div><div class="value">${order.email} / ${order.phone}</div>
      <div class="label">Logistics Hub</div><div class="value">${order.address}</div>

      <div class="section-title" style="margin-top: 30px;">Expedition Summary</div>
      <table class="table">
        <thead>
          <tr style="text-align: left; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
            <th>Selection</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="text-align: right; border-bottom: none; padding-top: 20px;"><strong>ESTIMATED TOTAL</strong></td>
            <td style="text-align: right; border-bottom: none; padding-top: 20px; font-size: 20px;" class="price">
              ${order.totalPrice?.toLocaleString()} ${order.currency || 'TZS'}
            </td>
          </tr>
        </tbody>
      </table>
      `,
      signature
    );
  }
};
