const mongoose = require('mongoose');
const seedData = require('./seeds/real_schemes_atlas.json');
const Scheme = require('./models/Scheme');

const uri = "mongodb+srv://praveenpandit25_db_user:z2qURLNMB8Sb8Lg2@cluster0.g16vqpr.mongodb.net/Hackathon?appName=Cluster0";

async function uploadSchemes() {
  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("✅ Connected Successfully!");

    console.log("🧹 Clearing old schemes...");
    await Scheme.deleteMany({});
    
    console.log("🚀 Uploading 100 new schemes...");
    await Scheme.insertMany(seedData);
    
    console.log("🎉 SUCCESS! All 100 schemes uploaded perfectly.");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

uploadSchemes();
