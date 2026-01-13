import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { env } from '../config/env.js';

let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!sesClient) {
    if (!env.awsAccessKeyId || !env.awsSecretAccessKey) {
      throw new Error('AWS credentials are not configured');
    }
    
    sesClient = new SESClient({
      region: env.awsRegion,
      credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      },
    });
  }
  return sesClient;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const client = getSESClient();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .code { 
            font-size: 48px; 
            font-weight: bold; 
            text-align: center; 
            letter-spacing: 8px;
            color: #FF6B9D;
            margin: 40px 0;
          }
          .message { 
            font-size: 16px; 
            line-height: 1.6; 
            color: #333;
            text-align: center;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #FF6B9D;">WithYou</h1>
          </div>
          <div class="message">
            <p>Your verification code is:</p>
          </div>
          <div class="code">${code}</div>
          <div class="message">
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} WithYou. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
Your WithYou verification code is: ${code}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} WithYou. All rights reserved.
  `;

  const command = new SendEmailCommand({
    Source: env.sesFromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Your WithYou verification code',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error('SES send error:', error);
    throw new Error('Failed to send verification email');
  }
}
