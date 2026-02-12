app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tickets', ticketRoutes);require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer360';

const seedUsers = [
  {
    email: 'admin@customer360.com',
    password: 'Admin@123',
    fullName: 'Admin User',
    role: ROLES.ADMIN,
  },
  {
    email: 'support@customer360.com',
    password: 'Support@123',
    fullName: 'Support Engineer',
    role: ROLES.SUPPORT_ENGINEER,
  },
  {
    email: 'viewer@customer360.com',
    password: 'Viewer@123',
    fullName: 'Viewer User',
    role: ROLES.VIEWER,
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Created: ${u.email} (${u.role})`);
    } else {
      console.log(`Skipped (exists): ${u.email}`);
    }
  }
  await mongoose.disconnect();
  console.log('Seed done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
