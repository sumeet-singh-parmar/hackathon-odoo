import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/core/config/env";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface IMailer {
  send(msg: MailMessage): Promise<void>;
}

class SmtpMailer implements IMailer {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
    });
  }

  async send(msg: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    });
  }
}

export const mailer: IMailer = new SmtpMailer();
