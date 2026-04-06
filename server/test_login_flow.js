import mongoose from 'mongoose';
import dotenv from 'dotenv';
import format from 'util';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const email = 'gameloginwala@gmail.com';
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log("User not found in DB:", email);
            process.exit(0);
        }
        
        console.log("Found user:", user.email);
        console.log("Password hash:", user.password);
        
        // Let's test a few common passwords
        const guess = ['password', '123456', 'gameloginwala', 'game123', 'password123', 'Password123!', 'test123', 'test', '1234567890', 'game1234', 'login123', 'qwerty'];
        
        for (let p of guess) {
            const match = await bcrypt.compare(p, user.password);
            console.log(`Password "${p}" match: ${match}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
