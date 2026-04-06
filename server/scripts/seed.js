import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Module from '../models/Module.js';
import { programmingModules } from './seedData/modules1.js';
import { csModules } from './seedData/modules2.js';
import { dbaDevopsModules } from './seedData/modules3.js';
import { aiAptitudeModules } from './seedData/modules4.js';
import { createQuizzesForAllModules } from './seedData/quizGenerator.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing
    await Module.deleteMany({});
    console.log('Cleared existing modules');

    const allModules = [
      ...programmingModules,
      ...csModules,
      ...dbaDevopsModules,
      ...aiAptitudeModules
    ];

    await Module.insertMany(allModules);
    console.log(`✅ ${allModules.length} modules created`);

    // Create quizzes
    await createQuizzesForAllModules();

    console.log('\n🎉 Seed complete! You can now see real content in the Learning Hub.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
