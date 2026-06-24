const mongoose = require('mongoose');
const logger = require('../utils/logger');
const Scheme = require('../models/Scheme');
const seedData = require('../seeds/schemes.json');

/**
 * Connect to MongoDB and optionally seed the database
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yojanasetu';

    mongoose.connection.on('connected', () =>
      logger.info('✅ MongoDB connected successfully')
    );
    mongoose.connection.on('error', (err) =>
      logger.error('MongoDB connection error:', err)
    );
    mongoose.connection.on('disconnected', () =>
      logger.warn('MongoDB disconnected')
    );

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    // Seed the database if needed
    if (process.env.MONGODB_SEED === 'true') {
      await seedDatabase();
    }
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
    logger.warn('Starting in offline mode...');
    // Don't crash — allow server to run without DB for demo
  }
};

/**
 * Seed database with sample welfare schemes on first run
 */
const seedDatabase = async () => {
  try {
    const count = await Scheme.countDocuments();
    if (count === 0) {
      logger.info('🌱 Seeding database with sample schemes...');
      await Scheme.insertMany(seedData);
      logger.info(`✅ Seeded ${seedData.length} welfare schemes`);
    } else {
      logger.info(`📚 Database already has ${count} schemes`);
    }
  } catch (error) {
    logger.error('Seeding failed:', error.message);
  }
};

/**
 * Graceful shutdown
 */
const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected (shutdown)');
};

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB };
