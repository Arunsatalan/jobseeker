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

  async sendInterviewProposalEmail(email, jobTitle, slotCount, deadline) {
    try {
      const deadlineDate = new Date(deadline).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: `Interview Time Slots Available - ${jobTitle}`,
        html: `
          <h2>Interview Time Slots Available</h2>
          <p>Great news! Interview time slots have been proposed for the position: <strong>${jobTitle}</strong></p>
          <p><strong>${slotCount}</strong> time slot${slotCount > 1 ? 's' : ''} ${slotCount > 1 ? 'are' : 'is'} available for you to choose from.</p>
          <p><strong>Voting Deadline:</strong> ${deadlineDate}</p>
          <p>Please log in to your dashboard to view and vote for your preferred interview times.</p>
          <p><a href="${config.CLIENT_URL}/dashboard/applications" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">View Interview Slots</a></p>
          <p>Best of luck with your interview!</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Interview proposal email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send interview proposal email: ${error.message}`);
      throw error;
    }
  }

  async sendStatusUpdateEmail(email, subject, message, jobTitle, companyName, status) {
    try {
      const statusEmojis = {
        'applied': '📧',
        'shortlisted': '⭐',
        'interview': '🎯',
        'rejected': '📋',
        'accepted': '🎉',
        'offered': '💼'
      };

      const emoji = statusEmojis[status] || '📬';

      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: `${emoji} ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #02243b;">${subject}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${message}</p>
            <div style="background-color: #f5f3f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Job:</strong> ${jobTitle}</p>
              <p style="margin: 5px 0 0 0;"><strong>Company:</strong> ${companyName}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="${config.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications" 
                 style="background-color: #02243b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Application Status
              </a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Status update email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send status update email: ${error.message}`);
      throw error;
    }
  }

  async sendMessageNotification(email, senderName, messagePreview, jobTitle) {
    try {
      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: `New Message from ${senderName}${jobTitle ? ` - ${jobTitle}` : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #02243b;">New Message Received</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              You have received a new message from <strong>${senderName}</strong>${jobTitle ? ` regarding ${jobTitle}` : ''}.
            </p>
            <div style="background-color: #f5f3f0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #02243b;">
              <p style="margin: 0; font-style: italic;">"${messagePreview}"</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="${config.CLIENT_URL || 'http://localhost:3000'}/dashboard/messages" 
                 style="background-color: #02243b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Message
              </a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Message notification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send message notification email: ${error.message}`);
      throw error;
    }
  }

  async sendInterviewConfirmationEmail(email, jobTitle, interviewDate, meetingLink, interviewerName) {
    try {
      const formattedDate = new Date(interviewDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const mailOptions = {
        from: config.EMAIL_FROM || config.SMTP_USER || config.EMAIL_USER,
        to: email,
        subject: `🎉 Interview Confirmed - ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #02243b;">Interview Confirmed! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Great news! Your interview has been confirmed.
            </p>
            <div style="background-color: #f5f3f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #02243b;">
              <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              ${interviewerName ? `<p style="margin: 0 0 10px 0;"><strong>Interviewer:</strong> ${interviewerName}</p>` : ''}
              ${meetingLink ? `<p style="margin: 10px 0 0 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #02243b;">${meetingLink}</a></p>` : ''}
            </div>
            ${meetingLink ? `
            <p style="margin-top: 20px;">
              <a href="${meetingLink}" 
                 style="background-color: #02243b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Join Interview
              </a>
            </p>
            ` : ''}
            <p style="margin-top: 20px;">
              <a href="${config.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications" 
                 style="background-color: #f5f3f0; color: #02243b; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; border: 1px solid #02243b;">
                View in Dashboard
              </a>
            </p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; font-size: 14px;"><strong>💡 Tip:</strong> You'll receive reminders 1 day and 1 hour before your interview. Good luck!</p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Interview confirmation email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send interview confirmation email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService();
