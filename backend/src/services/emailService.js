const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Platform Email Service (Resend Integration)
 */
class EmailService {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.EMAIL_FROM || 'FitSpace <team@fitspace.app>';
  }

  /**
   * Send a verification code
   */
  async sendVerificationCode(email, name, code) {
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
        <h2 style="color: #333;">Welcome to FitSpace, ${name}!</h2>
        <p>Use the code below to verify your email address:</p>
        <div style="font-size: 32px; font-weight: bold; padding: 10px; background: #f4f4f4; text-align: center; border-radius: 4px;">
          ${code}
        </div>
        <p style="color: #777; font-size: 14px; margin-top: 20px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.sendRawEmail({
      to: email,
      subject: 'Verify your FitSpace Account',
      html,
    });
  }

  /**
   * Generic send method
   */
  async sendRawEmail({ to, subject, html, text }) {
    if (!this.apiKey) {
      console.warn('RESEND_API_KEY not set, skipping email.');
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}

module.exports = new EmailService();
