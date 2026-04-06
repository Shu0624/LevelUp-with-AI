import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Direct connection to avoid loading the whole app
mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ email: 'student01@gmail.com' }).toArray();
        console.log("Users found:", users.length);
        if (users.length > 0) {
            console.log("User data:", JSON.stringify(users[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
