import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create approved users
  const approvedUsers = [
    {
      email: 'kb@urbanit.com',
      role: 'ADMIN',
      permission: 'WRITE'
    },
    {
      email: 'kt@urbanit.com',
      role: 'USER',
      permission: 'WRITE'
    },
    {
      email: 'readonly@urbanit.com',
      role: 'USER',
      permission: 'READ'
    },
    {
      email: 'dc@urbanit.com',
      role: 'USER',
      permission: 'READ'
    }
  ];

  for (const approvedUser of approvedUsers) {
    await prisma.approvedUser.upsert({
      where: { email: approvedUser.email },
      update: {},
      create: approvedUser
    });
  }

  console.log('✅ Approved users created');

  // Create actual users
  const users = [
    {
      name: 'Kwame Boateng',
      email: 'kb@urbanit.com',
      password: await bcrypt.hash('password', 12),
      role: 'ADMIN',
      permission: 'WRITE',
      isWhitelisted: true
    },
    {
      name: 'Kofi Tetteh',
      email: 'kt@urbanit.com',
      password: await bcrypt.hash('password', 12),
      role: 'USER',
      permission: 'WRITE',
      isWhitelisted: true
    },
    {
      name: 'Ama Asante',
      email: 'readonly@urbanit.com',
      password: await bcrypt.hash('password', 12),
      role: 'USER',
      permission: 'READ',
      isWhitelisted: true
    },
    {
      name: 'Daniel Osei',
      email: 'dc@urbanit.com',
      password: await bcrypt.hash('password', 12),
      role: 'USER',
      permission: 'READ',
      isWhitelisted: true
    }
  ];

  const createdUsers = [];
  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
    createdUsers.push(createdUser);
  }

  console.log('✅ Users created');

  // Create sample transactions with realistic Ghana business data
  const transactions = [
    // Income transactions
    {
      userId: createdUsers[0].id, // Kwame Boateng
      type: 'INCOME',
      amount: 15000.00,
      category: 'Consulting',
      description: 'Web Development Project - ABC Company',
      date: new Date('2025-01-15')
    },
    {
      userId: createdUsers[0].id,
      type: 'INCOME',
      amount: 8500.00,
      category: 'Training',
      description: 'React.js Training Workshop',
      date: new Date('2025-01-10')
    },
    {
      userId: createdUsers[1].id, // Kofi Tetteh
      type: 'INCOME',
      amount: 12000.00,
      category: 'Product Sales',
      description: 'Software License Sales',
      date: new Date('2025-01-08')
    },
    {
      userId: createdUsers[0].id,
      type: 'INCOME',
      amount: 5000.00,
      category: 'Service Fees',
      description: 'Technical Support Services',
      date: new Date('2025-01-05')
    },
    
    // Expenditure transactions
    {
      userId: createdUsers[0].id,
      type: 'EXPENDITURE',
      amount: 3500.00,
      category: 'Salaries',
      description: 'Staff Salaries - January',
      date: new Date('2025-01-31')
    },
    {
      userId: createdUsers[1].id,
      type: 'EXPENDITURE',
      amount: 1200.00,
      category: 'Rent',
      description: 'Office Rent - January',
      date: new Date('2025-01-01')
    },
    {
      userId: createdUsers[0].id,
      type: 'EXPENDITURE',
      amount: 800.00,
      category: 'Utilities',
      description: 'Electricity and Internet Bills',
      date: new Date('2025-01-20')
    },
    {
      userId: createdUsers[1].id,
      type: 'EXPENDITURE',
      amount: 450.00,
      category: 'Marketing',
      description: 'Social Media Advertising',
      date: new Date('2025-01-12')
    },
    {
      userId: createdUsers[0].id,
      type: 'EXPENDITURE',
      amount: 600.00,
      category: 'Equipment',
      description: 'Office Supplies and Hardware',
      date: new Date('2025-01-18')
    }
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction
    });
  }

  console.log('✅ Sample transactions created');
  console.log('🎉 Database seeded successfully!');
  
  console.log('\n📋 Demo Credentials:');
  console.log('Admin: kb@urbanit.com / password');
  console.log('User: kt@urbanit.com / password');
  console.log('Read-only: readonly@urbanit.com / password');
  console.log('Read-only: dc@urbanit.com / password');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });