import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Función para crear el transporter (lazy loading para que cargue el .env primero)
const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Interfaz para opciones de email
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envía un email usando Nodemailer
 * @param options - Opciones del email (to, subject, html, text)
 * @returns Promise con el resultado del envío
 */
export const sendEmail = async (options: EmailOptions): Promise<any> => {
  try {
    const transporter = getTransporter(); // Crear transporter cuando se use
    const mailOptions: nodemailer.SendMailOptions = {
      from: `BookCode <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

/**
 * Envía email de bienvenida a la newsletter
 * @param email - Email del suscriptor
 * @param nombre - Nombre del suscriptor (opcional)
 */
export const sendNewsletterWelcome = async (email: string, nombre?: string): Promise<any> => {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a BookCode Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📚 BookCode</h1>
              <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">Tu comunidad de reseñas de libros</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">¡Bienvenido${nombre ? ` ${nombre}` : ''}! 🎉</h2>
              
              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                Gracias por suscribirte a nuestra newsletter. Ahora recibirás:
              </p>
              
              <ul style="margin: 0 0 20px; padding-left: 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                <li>📖 Recomendaciones de libros personalizadas</li>
                <li>✨ Novedades y lanzamientos literarios</li>
                <li>👥 Reseñas destacadas de la comunidad</li>
                <li>🎁 Ofertas y promociones exclusivas</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                   style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px;">
                  Explorar BookCode
                </a>
              </div>
              
              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Si tienes alguna pregunta, no dudes en contactarnos. ¡Feliz lectura!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} BookCode. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe" style="color: #667eea; text-decoration: none;">Cancelar suscripción</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: '¡Bienvenido a BookCode Newsletter! 📚',
    html,
    text: `¡Bienvenido${nombre ? ` ${nombre}` : ''} a BookCode Newsletter! Ahora recibirás recomendaciones de libros, novedades literarias y reseñas destacadas directamente en tu email.`,
  });
};

/**
 * Envía email de recuperación de contraseña
 * @param email - Email del usuario
 * @param resetToken - Token de recuperación
 * @param nombre - Nombre del usuario
 */
export const sendPasswordReset = async (email: string, resetToken: string, nombre?: string): Promise<any> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Contraseña - BookCode</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🔐 BookCode</h1>
              <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 16px;">Recuperación de Contraseña</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hola${nombre ? ` ${nombre}` : ''} 👋</h2>
              
              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 10px 0; color: #667eea; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  ⚠️ <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.
                </p>
              </div>
              
              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Si no solicitaste restablecer tu contraseña, ignora este email. Tu contraseña permanecerá sin cambios.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} BookCode. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Este es un email automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: 'Recuperar Contraseña - BookCode 🔐',
    html,
    text: `Hola${nombre ? ` ${nombre}` : ''}, recibimos una solicitud para restablecer tu contraseña. Visita este enlace: ${resetUrl} (expira en 1 hora). Si no solicitaste esto, ignora este email.`,
  });
};

/**
 * Envía notificación de nueva actividad
 * @param email - Email del usuario
 * @param nombre - Nombre del usuario
 * @param actividad - Descripción de la actividad
 */
export const sendActivityNotification = async (
  email: string,
  nombre: string,
  actividad: string
): Promise<any> => {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Actividad - BookCode</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🔔 BookCode</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 22px;">Hola ${nombre} 👋</h2>
              
              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                ${actividad}
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/perfil" 
                   style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 14px;">
                  Ver en BookCode
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} BookCode. 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings/notifications" style="color: #667eea; text-decoration: none;">Gestionar notificaciones</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: 'Nueva actividad en BookCode 🔔',
    html,
    text: `Hola ${nombre}, ${actividad}`,
  });
};

export default {
  sendEmail,
  sendNewsletterWelcome,
  sendPasswordReset,
  sendActivityNotification,
};
