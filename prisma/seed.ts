import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 10);

    // Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: passwordHash,
            firstName: 'Bob',
            lastName: 'Admin',
            role: Role.ADMIN,
            status: 'APPROVED'

        },
    });

    // Users
    const user1 = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            password: passwordHash,
            firstName: 'Alice',
            lastName: 'User',
            role: Role.USER,
            status: 'APPROVED'
        },
    })


    const user2 = await prisma.user.create({
        data: {
            email: 'charlie@example.com',
            password: passwordHash,
            firstName: 'Charlie',
            lastName: 'User',
            role: Role.USER,
            status: 'APPROVED'
        },
    });

    console.log('Clearing existing seeded blogs...');
    await prisma.blog.deleteMany({
        where: { title: { contains: 'Sample Post' } }
    });

    console.log('Seeding blogs...');
    for (let i = 1; i <= 20; i++) {
        await prisma.blog.create({
            data: {
                title: `Sample Post #${i}: Exploring Tech in 2026`,
                content: `This is the detailed content for sample post #${i}. It discusses various advancements in web development, AI integration, and the general software engineering landscape. Virtual scrolling, database fetching, and frontend caching are core tenets. As we scale, keeping DOM nodes minimal is essential for 60fps performance on low-end devices. \n\nThanks for reading!`,
                status: 'PUBLISHED',
                authorId: i % 3 === 0 ? user1.id : i % 3 === 1 ? user2.id : admin.id,
                comments: {
                    create: i % 3 === 0 ? [
                        { content: 'Great article!', authorId: user1.id },
                        { content: 'Very informative, thanks for sharing.', authorId: admin.id }
                    ] : []
                }
            }
        });
    }

    console.log('Database seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
