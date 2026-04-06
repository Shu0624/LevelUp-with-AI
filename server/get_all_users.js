import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const users = await User.find({}).select('+password');
        console.log("Users in DB:");
        users.forEach(u => console.log(`- Email: '${u.email}', ID: ${u._id}`));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
