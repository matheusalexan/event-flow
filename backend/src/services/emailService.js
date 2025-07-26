const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Verifique seu email - EventFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EventFlow</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Olá ${data.name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Obrigado por se registrar no EventFlow! Para começar a usar sua conta, 
            por favor verifique seu endereço de email clicando no botão abaixo:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verificar Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${data.verificationUrl}" style="color: #667eea;">${data.verificationUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Este link expira em 24 horas.
          </p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 EventFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Redefinição de senha - EventFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EventFlow</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Olá ${data.name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Você solicitou a redefinição de sua senha. Clique no botão abaixo para 
            criar uma nova senha:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Se você não solicitou esta redefinição, ignore este email.<br>
            Este link expira em ${data.expiresIn}.
          </p>
          <p style="color: #666; font-size: 14px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${data.resetUrl}" style="color: #667eea;">${data.resetUrl}</a>
          </p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 EventFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  eventRegistration: (data) => ({
    subject: `Inscrição confirmada - ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EventFlow</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Inscrição Confirmada!</h2>
          <p style="color: #666; line-height: 1.6;">
            Olá ${data.userName}, sua inscrição para o evento <strong>${data.eventTitle}</strong> 
            foi confirmada com sucesso!
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalhes do Evento:</h3>
            <p><strong>Data:</strong> ${data.eventDate}</p>
            <p><strong>Horário:</strong> ${data.eventTime}</p>
            <p><strong>Local:</strong> ${data.eventLocation}</p>
            <p><strong>Status:</strong> <span style="color: green;">Confirmado</span></p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.eventUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Ver Detalhes do Evento
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 EventFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  eventReminder: (data) => ({
    subject: `Lembrete: ${data.eventTitle} amanhã!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EventFlow</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Lembrete de Evento</h2>
          <p style="color: #666; line-height: 1.6;">
            Olá ${data.userName}, não se esqueça que o evento <strong>${data.eventTitle}</strong> 
            acontece amanhã!
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalhes do Evento:</h3>
            <p><strong>Data:</strong> ${data.eventDate}</p>
            <p><strong>Horário:</strong> ${data.eventTime}</p>
            <p><strong>Local:</strong> ${data.eventLocation}</p>
            ${data.onlineUrl ? `<p><strong>Link Online:</strong> <a href="${data.onlineUrl}">${data.onlineUrl}</a></p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.eventUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Ver Detalhes do Evento
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 EventFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  eventCancellation: (data) => ({
    subject: `Evento cancelado - ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EventFlow</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Evento Cancelado</h2>
          <p style="color: #666; line-height: 1.6;">
            Olá ${data.userName}, lamentamos informar que o evento <strong>${data.eventTitle}</strong> 
            foi cancelado.
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalhes:</h3>
            <p><strong>Motivo:</strong> ${data.reason}</p>
            ${data.refundInfo ? `<p><strong>Reembolso:</strong> ${data.refundInfo}</p>` : ''}
          </div>
          <p style="color: #666; line-height: 1.6;">
            Se você pagou pelo evento, o reembolso será processado automaticamente 
            em até 5 dias úteis.
          </p>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 EventFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  welcomeEmail: (data) => ({
    subject: 'Bem-vindo ao EventFlow!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EventFlow</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Bem-vindo ao EventFlow!</h2>
          <p style="color: #666; line-height: 1.6;">
            Olá ${data.name}, seja bem-vindo à plataforma EventFlow! 
            Aqui você pode descobrir, participar e organizar eventos incríveis.
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">O que você pode fazer:</h3>
            <ul style="color: #666;">
              <li>Descobrir eventos interessantes</li>
              <li>Inscrever-se em eventos</li>
              <li>Organizar seus próprios eventos</li>
              <li>Conectar-se com outros participantes</li>
              <li>Receber certificados de participação</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Explorar Eventos
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 EventFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async ({ email, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailContent = {};

    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else {
      emailContent = {
        subject: subject,
        html: html,
        text: text
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to ${email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Send bulk emails
const sendBulkEmails = async (emails, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emails.join(', '),
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Bulk email sent successfully to ${emails.length} recipients: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      recipients: emails.length
    };
  } catch (error) {
    logger.error('Error sending bulk email:', error);
    throw new Error('Failed to send bulk email');
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
  emailTemplates
}; 