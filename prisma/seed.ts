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
    });

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
    const blogsToDelete = await prisma.blog.findMany({
        where: { title: { contains: 'Sample Post' } },
        select: { id: true }
    });
    const blogIds = blogsToDelete.map(b => b.id);

    if (blogIds.length > 0) {
        await prisma.reaction.deleteMany({ where: { comment: { blogId: { in: blogIds } } } });
        await prisma.comment.deleteMany({ where: { blogId: { in: blogIds } } });
        await prisma.adminComment.deleteMany({ where: { blogId: { in: blogIds } } });
        await prisma.bookmark.deleteMany({ where: { blogId: { in: blogIds } } });
        await prisma.blog.deleteMany({ where: { id: { in: blogIds } } });
    }

    console.log('Seeding settings...');
    const settings = [
        {
            name: 'WRITING_COACH',
            description: 'Analyzes blog post draft and provides a clarity score, strengths, issues, and specific suggestions for improvement.',
            value: 'Analyze the following blog post draft. Provide a clarity score (1-100), strengths, issues, and specific suggestions for improvement.',
            updatedBy: admin.id
        },
        {
            name: 'ADMIN_REVIEW',
            description: 'Generates a concise summary, key points, and potential risks for a blog post for an admin review.',
            value: 'Generate a concise summary, key points, and potential risks for the following blog post for an admin review.',
            updatedBy: admin.id
        },
        {
            name: 'CLARITY_SCORE',
            description: 'Evaluates the clarity of a blog post and provides a score from 1 to 100.',
            value: 'Evaluate the clarity of the following blog post and provide a clarity score from 1 to 100.',
            updatedBy: admin.id
        },
        {
            name: 'AI_API_KEY',
            description: 'The API key used for the AI service integrations.',
            value: '',
            updatedBy: admin.id
        }
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { name: setting.name },
            update: {},
            create: setting,
        });
    }

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
