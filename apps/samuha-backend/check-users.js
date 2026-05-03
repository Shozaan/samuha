const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('Total Users:', users.length);
    users.forEach(u => {
        console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Phone: ${u.phoneNumber}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
