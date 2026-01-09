const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db');

const migratePasswords = async () => {
    // Connect to Database
    await connectDB();

    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            // Basic check to avoid double hashing: bcrypt hashes usually start with $2a$ or $2b$ and are 60 chars long
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                console.log(`User ${user.email} already has a hashed password. Skipping.`);
                continue;
            }

            console.log(`Hashing password for user: ${user.email}`);
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);

            await user.save();
            console.log(`Successfully updated user: ${user.email}`);
        }

        console.log('Password migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error migrating passwords:', error);
        process.exit(1);
    }
};

migratePasswords();
