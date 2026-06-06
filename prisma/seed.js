const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generatePastMonths(numMonths) {
  const months = [];
  const now = new Date();
  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }
  return months;
}

async function main() {
  console.log('Seeding database with historical data...');
  
  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.student.deleteMany();
  //await prisma.leaveApprovalRequest.deleteMany();
  //await prisma.feeAdjustmentRequest.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const userRoles = ['ADMIN', 'TEACHER', 'TEACHER', 'TEACHER', 'STAFF', 'STAFF'];
  const userStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE'];
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  const usersData = [
    { email: 'admin@kalnet.edu', name: 'Super Admin', role: 'ADMIN', status: 'ACTIVE' },
  ];

  for (let i = 0; i < 35; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = userRoles[Math.floor(Math.random() * userRoles.length)];
    const status = userStatuses[Math.floor(Math.random() * userStatuses.length)];
    
    usersData.push({
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@kalnet.edu`,
      name: `${fn} ${ln}`,
      role: role,
      status: status
    });
  }

  await prisma.user.createMany({
    data: usersData
  });

  const months = generatePastMonths(7); // Last 7 months including current
  
  // Generate historical data month by month
  for (let i = 0; i < months.length; i++) {
    const ym = months[i];
    
    // Admissions for this month (random between 15 and 45)
    const numAdmissions = Math.floor(Math.random() * 30) + 15;
    
    for (let j = 0; j < numAdmissions; j++) {
      const student = await prisma.student.create({
        data: {
          admissionNo: `ADM-${ym}-${j.toString().padStart(3, '0')}`,
          firstName: `Student${j}`,
          lastName: `Last${i}${j}`,
          status: 'ACTIVE'
        }
      });

      await prisma.admission.create({
        data: {
          studentId: student.id,
          admitYm: ym,
          admittedAt: new Date(`${ym}-10T10:00:00Z`)
        }
      });
      
      // Monthly fee invoice for all ACTIVE students (including newly admitted)
      // Actually let's just create an invoice for this student for this month
      // And some pending, some paid.
      const isPaid = Math.random() > 0.3; // 70% paid, 30% pending
      const amount = 1500.0 + Math.floor(Math.random() * 500);
      
      const invoice = await prisma.feeInvoice.create({
        data: {
          studentId: student.id,
          totalAmount: amount,
          status: isPaid ? 'PAID' : 'ISSUED',
          issueDate: new Date(`${ym}-01T10:00:00Z`)
        }
      });

      if (isPaid) {
        await prisma.feePayment.create({
          data: {
            invoiceId: invoice.id,
            studentId: student.id,
            amount: amount,
            status: 'SUCCESS',
            paidYm: ym,
            paidAt: new Date(`${ym}-15T10:00:00Z`)
          }
        });
      }
    }
    
    // Add some random approval requests and leaves per month
    
  }

  console.log('Database seeded successfully with historical data!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
