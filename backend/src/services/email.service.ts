import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export const emailService = {
  async enviarEmailRecuperacaoSenha(email: string, linkComToken: string): Promise<void> {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Recuperação de senha - Derma Match',
      text:
        'Recebemos um pedido para redefinir sua senha. Use o link a seguir ' +
        `(válido por 1 hora):\n\n${linkComToken}\n\nSe não foi você, ignore este email.`,
      html:
        '<p>Recebemos um pedido para redefinir sua senha.</p>' +
        `<p><a href="${linkComToken}">Redefinir minha senha</a> (link válido por 1 hora).</p>` +
        '<p>Se não foi você, ignore este email.</p>',
    });
    logger.info('email de recuperação de senha enviado');
  },
};
