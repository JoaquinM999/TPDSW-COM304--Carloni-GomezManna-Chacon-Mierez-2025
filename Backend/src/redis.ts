import Redis from 'ioredis';

// Usar URL de Redis remoto desde variable de entorno
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.warn('⚠️ REDIS_URL no definida, Redis no se conectará.');
}

const redis = redisUrl
  ? new Redis(redisUrl, {
      // Opcional: reconexión automática
      retryStrategy(times) {
        console.log(`Redis reconnection attempt #${times}`);
        return Math.min(times * 50, 2000); // tiempo entre reconexiones
      },
    })
  : null;

if (redis) {
  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  redis.on('ready', () => {
    console.log('🔔 Redis ready to use');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });

  redis.on('close', () => {
    console.warn('⚠️ Redis connection closed');
  });

  redis.on('reconnecting', () => {
    console.log('🔁 Redis reconnecting...');
  });

  // Ping opcional para verificar la conexión al arrancar
  redis
    .ping()
    .then(() => console.log('✅ Redis ping OK'))
    .catch(() => {
      /* noop */
    });

  // Graceful shutdown: cuando el proceso reciba SIGINT/SIGTERM/SIGQUIT
  const shutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal} — closing Redis connection...`);
    // si quit tarda demasiado, forzamos salida
    const forceExitTimer = setTimeout(() => {
      console.warn('⏱ Redis quit timed out, forcing exit.');
      try {
        redis.disconnect();
      } catch {
        /* ignore */
      }
      process.exit(1);
    }, 5000);

    try {
      await redis.quit();
      clearTimeout(forceExitTimer);
      console.log('🛑 Redis connection closed gracefully.');
      process.exit(0);
    } catch (err) {
      clearTimeout(forceExitTimer);
      console.error('Error during Redis shutdown:', err);
      try {
        redis.disconnect();
      } catch {
        /* ignore */
      }
      process.exit(1);
    }
  };

  // Usamos `once` para evitar ejecutar shutdown múltiples veces
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGQUIT', () => shutdown('SIGQUIT'));
}

export default redis;
