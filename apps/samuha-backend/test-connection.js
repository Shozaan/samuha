const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Testing Karma database connection...\n')

    // Test 1: Check connection
    const result = await prisma.$queryRaw`SELECT current_database(), version()`
    console.log('✅ Connected to database:', result[0].current_database)
    console.log('📊 PostgreSQL version:', result[0].version.split(' ')[1])

    // Test 2: Create a user
    console.log('\n🔄 Creating test user...')
    const user = await prisma.user.create({
        data: {
            phoneNumber: '+977-9876543210',
            name: 'Test User'
        }
    })
    console.log('✅ Created user:', user)

    // Test 3: Find the user
    console.log('\n🔄 Finding user...')
    const foundUser = await prisma.user.findUnique({
        where: { phoneNumber: '+977-9876543210' }
    })
    console.log('✅ Found user:', foundUser.name)

    // Test 4: Count users
    const count = await prisma.user.count()
    console.log('\n📊 Total users in database:', count)

    // Test 5: Delete test user
    console.log('\n🔄 Cleaning up...')
    await prisma.user.delete({
        where: { id: user.id }
    })
    console.log('✅ Deleted test user')

    console.log('\n🎉 All tests passed! Prisma is connected to Karma database!')
}

main()
    .catch((error) => {
        console.error('❌ Error:', error.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })