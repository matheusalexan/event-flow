const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Verifique seu email - Transport App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Olá ${data.name}!</h2>
        <p>Obrigado por se registrar no Transport App. Para ativar sua conta, clique no link abaixo:</p>
        <a href="${data.verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verificar Email
        </a>
        <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all; color: #666;">${data.verificationUrl}</p>
        <p>Este link expira em 24 horas.</p>
        <p>Atenciosamente,<br>Equipe Transport App</p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Reset de Senha - Transport App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Olá ${data.name}!</h2>
        <p>Você solicitou um reset de senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${data.resetUrl}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Resetar Senha
        </a>
        <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
        <p>Este link expira em 10 minutos.</p>
        <p>Se você não solicitou este reset, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Transport App</p>
      </div>
    `
  }),

  rideConfirmation: (data) => ({
    subject: 'Corrida Confirmada - Transport App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sua corrida foi confirmada!</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Detalhes da Corrida:</h3>
          <p><strong>Motorista:</strong> ${data.driverName}</p>
          <p><strong>Veículo:</strong> ${data.vehicleInfo}</p>
          <p><strong>Origem:</strong> ${data.pickup}</p>
          <p><strong>Destino:</strong> ${data.destination}</p>
          <p><strong>Preço:</strong> ${data.price}</p>
          <p><strong>Estimativa:</strong> ${data.estimatedTime} min</p>
        </div>
        <p>O motorista está a caminho. Você receberá uma notificação quando ele chegar.</p>
        <p>Atenciosamente,<br>Equipe Transport App</p>
      </div>
    `
  }),

  rideCompleted: (data) => ({
    subject: 'Corrida Concluída - Transport App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sua corrida foi concluída!</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Resumo da Corrida:</h3>
          <p><strong>Motorista:</strong> ${data.driverName}</p>
          <p><strong>Veículo:</strong> ${data.vehicleInfo}</p>
          <p><strong>Distância:</strong> ${data.distance} km</p>
          <p><strong>Duração:</strong> ${data.duration} min</p>
          <p><strong>Valor Final:</strong> ${data.finalPrice}</p>
        </div>
        <p>Obrigado por usar o Transport App! Não se esqueça de avaliar sua experiência.</p>
        <p>Atenciosamente,<br>Equipe Transport App</p>
      </div>
    `
  }),

  welcomeEmail: (data) => ({
    subject: 'Bem-vindo ao Transport App!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bem-vindo, ${data.name}!</h2>
        <p>Estamos muito felizes em tê-lo conosco no Transport App!</p>
        <p>Com nossa plataforma, você pode:</p>
        <ul>
          <li>Solicitar corridas de forma rápida e segura</li>
          <li>Acompanhar seu motorista em tempo real</li>
          <li>Pagar de forma conveniente</li>
          <li>Avaliar suas experiências</li>
        </ul>
        <p>Se você tiver alguma dúvida, nossa equipe de suporte está sempre pronta para ajudar.</p>
        <p>Atenciosamente,<br>Equipe Transport App</p>
      </div>
    `
  })
};

// Send email
const sendEmail = async ({ email, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();
    
    let emailContent = {};
    
    if (template && emailTemplates[template]) {
      const templateContent = emailTemplates[template](data);
      emailContent = {
        subject: templateContent.subject,
        html: templateContent.html
      };
    } else {
      emailContent = {
        subject,
        html,
        text
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      ...emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (emails, subject, template, data) => {
  try {
    const transporter = createTransporter();
    const templateContent = emailTemplates[template](data);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emails.join(', '),
      subject: templateContent.subject,
      html: templateContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Bulk email sent to ${emails.length} recipients: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending bulk email:', error);
    throw error;
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