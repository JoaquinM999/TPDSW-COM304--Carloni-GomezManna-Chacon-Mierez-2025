import redis from './src/redis';

// Función simulada que normalmente usaría Redis

// cd Backend && npx ts-node testRedisConnection.ts para correr este test

async function simulateRequest(requestId: number) {
  if (!process.env.REDIS_URL) {
    console.log(`Request ${requestId}: ✅ Usando solo memoria local`);
    return;
  }

  try {
    await redis.ping();
    console.log(`Request ${requestId}: ❌ Redis activo!`);
  } catch {
    console.log(`Request ${requestId}: ✅ Redis no conectado`);
  }
}

async function testRedisConnection() {
  if (!process.env.REDIS_URL) {
    console.log('✅ Redis no activo: no se hará ninguna conexión remota');
  } else {
    console.log('⚠️ Redis activo: se intentará conexión');
  }

  // Simular 5 requests concurrentes
  const requests = Array.from({ length: 5 }, (_, i) => simulateRequest(i + 1));
  await Promise.all(requests);

  console.log('✅ Test finalizado: ninguna request debe tocar Redis remoto si REDIS_URL está comentada');
  process.exit(0);
}

testRedisConnection();
