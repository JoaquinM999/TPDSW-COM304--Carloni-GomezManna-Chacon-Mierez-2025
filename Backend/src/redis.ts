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

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });
}

export default redis;
