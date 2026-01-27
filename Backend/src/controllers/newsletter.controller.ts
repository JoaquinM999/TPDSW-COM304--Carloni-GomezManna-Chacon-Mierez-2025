import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Newsletter } from '../entities/newsletter.entity';
import { sendNewsletterWelcome } from '../services/email.service';

/**
 * Suscribir un email a la newsletter
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email, nombre } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        message: 'Email inválido' 
      });
    }

    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();

    // Verificar si ya está suscrito
    const existingSub = await em.findOne(Newsletter, { email });

    if (existingSub) {
      if (existingSub.activo) {
        return res.status(400).json({ 
          message: 'Este email ya está suscrito a la newsletter' 
        });
      } else {
        // Reactivar suscripción
        existingSub.activo = true;
        existingSub.fechaBaja = undefined;
        await em.persistAndFlush(existingSub);

        // Enviar email de bienvenida (solo si está configurado)
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
          try {
            await sendNewsletterWelcome(email, nombre);
            console.log('✅ Email de bienvenida enviado a:', email);
          } catch (emailError) {
            console.warn('⚠️  No se pudo enviar email de bienvenida:', emailError);
          }
        }

        return res.status(200).json({
          message: 'Suscripción reactivada exitosamente',
          subscription: existingSub,
        });
      }
    }

    // Crear nueva suscripción
    const subscription = new Newsletter(email, nombre);

    await em.persistAndFlush(subscription);

    // Enviar email de bienvenida (solo si está configurado)
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      try {
        await sendNewsletterWelcome(email, nombre);
        console.log('✅ Email de bienvenida enviado a:', email);
      } catch (emailError) {
        console.warn('⚠️  No se pudo enviar email de bienvenida:', emailError);
        // No fallar si el email no se puede enviar
      }
    } else {
      console.log('ℹ️  Email no configurado, suscripción guardada sin envío de email');
    }

    return res.status(201).json({
      message: '¡Suscripción exitosa! Revisa tu email',
      subscription,
    });
  } catch (error: any) {
    console.error('Error en subscribe:', error);
    return res.status(500).json({ 
      message: 'Error al procesar la suscripción',
      error: error.message,
    });
  }
};

/**
 * Cancelar suscripción a la newsletter
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email requerido' 
      });
    }

    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();

    const subscription = await em.findOne(Newsletter, { email, activo: true });

    if (!subscription) {
      return res.status(404).json({ 
        message: 'Suscripción no encontrada' 
      });
    }

    subscription.activo = false;
    subscription.fechaBaja = new Date();

    await em.persistAndFlush(subscription);

    return res.status(200).json({
      message: 'Te has dado de baja de la newsletter',
    });
  } catch (error: any) {
    console.error('Error en unsubscribe:', error);
    return res.status(500).json({ 
      message: 'Error al procesar la baja',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las suscripciones (solo admin)
 */
export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();

    const subscriptions = await em.find(Newsletter, {}, {
      orderBy: { fechaSuscripcion: 'DESC' },
    });

    const stats = {
      total: subscriptions.length,
      activos: subscriptions.filter((s: Newsletter) => s.activo).length,
      inactivos: subscriptions.filter((s: Newsletter) => !s.activo).length,
    };

    return res.json({
      subscriptions,
      stats,
    });
  } catch (error: any) {
    console.error('Error en getAllSubscriptions:', error);
    return res.status(500).json({ 
      message: 'Error al obtener suscripciones',
      error: error.message,
    });
  }
};
