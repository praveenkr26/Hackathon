/**
 * Force re-seed script — clears all schemes and reseeds from schemes.json
 * Run: node seeds/reseed.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const seedData = require('./schemes.json');

const reseed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yojanasetu';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected');

    console.log('🗑  Clearing existing schemes...');
    await Scheme.deleteMany({});

    console.log(`🌱 Seeding ${seedData.length} schemes...`);
    // Use create() to trigger pre-save hook for slug generation
    let count = 0;
    for (const scheme of seedData) {
      await Scheme.create(scheme);
      count++;
    }
    console.log(`✅ Successfully seeded ${count} schemes!`);

    const categories = [...new Set(seedData.map(s => s.category))];
    console.log(`📂 Categories: ${categories.join(', ')}`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected. Done!');
    process.exit(0);
  }
};

reseed();
