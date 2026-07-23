import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedDatabase } from './seedDatabase.js';
import { DEMO_USERS } from './seedData.js';

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'Refusing to run: NODE_ENV=production. This script wipes every collection and ' +
        'reseeds demo accounts with known passwords — never point it at a live database.'
    );
    process.exit(1);
  }

  await connectDB();
  const counts = await seedDatabase();

  console.log('Seed complete:');
  console.log(`  Users:             ${counts.users}`);
  console.log(`  Doctors:           ${counts.doctors}`);
  console.log(`  Patients:          ${counts.patients}`);
  console.log(`  Appointments:      ${counts.appointments}`);
  console.log(`  Prescriptions:     ${counts.prescriptions}`);
  console.log(`  Medical history:   ${counts.medicalHistory}`);
  console.log(`  Inventory items:   ${counts.inventoryItems}`);
  console.log(`  Invoices:          ${counts.invoices}`);
  console.log('\nDemo logins:');
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(13)} ${u.email}  /  ${u.password}`));

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
