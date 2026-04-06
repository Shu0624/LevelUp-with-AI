import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Module from './models/Module.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

// Only keep these 5 modules (case-insensitive partial match)
const KEEP_TITLES = [
  'Java Masterclass',
  'Python for Data',
  'Generative AI',
  'Agentic AI',
  'MERN'
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const all = await Module.find({}).select('title _id');
    console.log(`Total modules in DB: ${all.length}`);

    const toDelete = all.filter(mod => 
      !KEEP_TITLES.some(keep => 
        mod.title.toLowerCase().includes(keep.toLowerCase())
      )
    );

    const toKeep = all.filter(mod => 
      KEEP_TITLES.some(keep => 
        mod.title.toLowerCase().includes(keep.toLowerCase())
      )
    );

    console.log('\n✅ KEEPING:');
    toKeep.forEach(m => console.log(`  + "${m.title}"`));

    console.log('\n🗑️  DELETING:');
    toDelete.forEach(m => console.log(`  - "${m.title}"`));

    const deleteIds = toDelete.map(m => m._id);
    const result = await Module.deleteMany({ _id: { $in: deleteIds } });
    console.log(`\n✅ Done! Deleted ${result.deletedCount} modules. ${toKeep.length} modules remain.`);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
});
