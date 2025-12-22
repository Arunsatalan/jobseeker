const nodemailer = require('nodemailer');
const config = require('../config/environment');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: config.SMTP_USER || config.EMAIL_USER,
    pass: config.SMTP_PASS || config.EMAIL_PASS,
  },
});

class EmailService {
  async sendVerificationEmail(email, verificationLink) {
    try {
      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <h2>Welcome to CanadaJobs!</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}: ${error.message}`);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, resetLink) {
    try {
      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
      throw error;
    }
  }

  async sendApplicationNotification(email, jobTitle, companyName) {
    try {
      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: `Application Received for ${jobTitle}`,
        html: `
          <h2>Application Received</h2>
          <p>You have received a new application for the position: <strong>${jobTitle}</strong></p>
          <p>Company: <strong>${companyName}</strong></p>
          <p>Log in to your dashboard to review the application.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Application notification sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send application notification: ${error.message}`);
      throw error;
    }
  }

  async sendJobAlert(email, jobs) {
    try {
      const jobList = jobs.map(job => `
        <li>
          <strong>${job.title}</strong> at ${job.company}
          <br>Location: ${job.location}
          <br>Salary: ${job.salaryMin} - ${job.salaryMax}
        </li>
      `).join('');

      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: 'New Job Matches Found',
        html: `
          <h2>Job Alerts</h2>
          <p>We found matching jobs based on your preferences:</p>
          <ul>${jobList}</ul>
          <p>Visit the platform to apply now!</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Job alert sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send job alert: ${error.message}`);
      throw error;
    }
  }

  async sendOTP(email, otp) {
    try {
      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        html: `
          <h2>Verification Code</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`OTP sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send OTP to ${email}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService();
