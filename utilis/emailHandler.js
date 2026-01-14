import nodemailer from "nodemailer";
import ejs from "ejs";
import { convert } from "html-to-text";
const _dirname = import.meta.dirname;

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `mohamed eldawi <${process.env.Email_from}>`;
  }
  newTransporter() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SEND_GRID_USER,
          pass: process.env.SEND_GRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  // general mail
  async send(template, subject) {
    const content = await ejs.renderFile(
      `${_dirname}/../views/email/${template}.ejs`,
      {
        firstName: this.firstName,
        url: this.url,
      }
    );
    const html = await ejs.renderFile(
      `${_dirname}/../views/email/baseEmail.ejs`,
      {
        body: content,
        subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      html,
      subject,
      text: convert(html),
    };
    await this.newTransporter().sendMail(mailOptions);
  }
  // specific mails
  async sendWelcome() {
    await this.send("welcome", "Welcome to Natours Family!");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (Valid for 10 minutes)"
    );
  }
}
