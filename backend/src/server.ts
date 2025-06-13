import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 4000;

async function main() {
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`🚀 Hotel Reception API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🏨 Room availability: http://localhost:${PORT}/api/rooms/available-now`);
    console.log(`📈 Room statistics: http://localhost:${PORT}/api/rooms/statistics`);
    console.log(`🔍 View database: cd backend && npx prisma studio`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 Server failed to start:', error);
  process.exit(1);
});