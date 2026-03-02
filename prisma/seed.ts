import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const apiKey = process.env.AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const topics = [
    'Software development',
    'Artificial intelligence',
    'Cloud computing',
    'Productivity',
    'Leadership',
    'Business strategy',
    'Career growth',
    'Cybersecurity',
    'DevOps',
    'Data engineering'
];

const names = [
    { first: 'Admin', last: 'User', role: Role.ADMIN },
    { first: 'Alice', last: 'Jane', role: Role.USER },
    { first: 'Bob', last: 'Smith', role: Role.USER },
    { first: 'Charlie', last: 'Brown', role: Role.USER },
    { first: 'Diana', last: 'Prince', role: Role.USER },
    { first: 'Evan', last: 'Wright', role: Role.USER },
    { first: 'Fiona', last: 'Gallagher', role: Role.USER },
    { first: 'George', last: 'Miller', role: Role.USER },
    { first: 'Hannah', last: 'Abbott', role: Role.USER },
    { first: 'Ian', last: 'Malcolm', role: Role.USER }
];

function generateEmail(first: string, last: string) {
    if (first.toLowerCase() === 'admin') return 'admin@test.com';
    return `${first.toLowerCase()}${last.charAt(0).toLowerCase()}@test.com`;
}

function getRandomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Sleep utility to respect rate limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateProfessionalArticleAI(topic: string, index: number, retries = 3): Promise<{ title: string, content: string }> {
    if (!apiKey) {
        throw new Error('AI API key is missing. Please set AI_API_KEY in your .env file.');
    }

    const titleTemplates = [
        `The Future of ${topic}: Trends and Insights for 2026`,
        `${topic} in the Modern Enterprise: A Comprehensive Guide`,
        `Mastering ${topic}: Strategies for Success`,
        `Demystifying ${topic}: What You Need to Know`,
        `The Role of ${topic} in Digital Transformation`,
    ];

    const title = titleTemplates[index % 5];

    // As per user request, use gemini-3-flash-preview
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `Write a highly professional, comprehensive, and detailed long-form article about "${title}". 
    The article must be AT LEAST 1000 words long. 
    Use proper HTML formatting (without html markdown tags, just raw HTML string) such as <h2>, <h3>, <p>, <ul>, and <li> tags to structure the content well.
    Write with an authoritative and engaging tone suitable for a high-quality professional tech and business blog.
    Include an introduction, several detailed body sections with deep insights, and a strong conclusion.`;

    try {
        const result = await model.generateContent(prompt);
        const content = result.response.text();

        let cleanContent = content.trim();
        if (cleanContent.startsWith('```html')) {
            cleanContent = cleanContent.replace('```html', '').replace(/```$/, '').trim();
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```[a-z]*\n*/, '').replace(/```$/, '').trim();
        }

        return { title, content: cleanContent };
    } catch (e: any) {
        if (e.status === 429 && retries > 0) {
            console.log(`Rate limit hit for article "${title}". Waiting 65 seconds before retrying...`);
            await sleep(65000); // Wait slightly over 1 minute to clear per-minute quota
            return generateProfessionalArticleAI(topic, index, retries - 1);
        }
        console.error(`Error generating article for ${title}:`, e);
        return { title, content: `<p>Failed to generate content for ${title}. Error: ${e.message}</p>` };
    }
}

async function main() {
    console.log('Seeding database...');

    console.log('Hashing passwords...');
    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Creating users...');
    const createdUsers = [];
    for (const name of names) {
        const email = generateEmail(name.first, name.last);
        const user = await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                firstName: name.first,
                lastName: name.last,
                role: name.role,
                status: UserStatus.APPROVED
            }
        });
        createdUsers.push(user);
    }

    // console.log('Applying Settings...');
    // const settings = [
    //     {
    //         name: 'WRITING_COACH',
    //         description: 'Analyzes blog post draft and provides a clarity score, strengths, issues, and specific suggestions for improvement.',
    //         value: 'Analyze the following blog post draft. Provide a clarity score (1-100), strengths, issues, and specific suggestions for improvement.',
    //         updatedBy: null
    //     },
    //     {
    //         name: 'ADMIN_REVIEW',
    //         description: 'Generates a concise summary, key points, and potential risks for a blog post for an admin review.',
    //         value: 'Generate a concise summary, key points, and potential risks for the following blog post for an admin review.',
    //         updatedBy: null
    //     },
    //     {
    //         name: 'CLARITY_SCORE',
    //         description: 'Evaluates the clarity of a blog post and provides a score from 1 to 100.',
    //         value: 'Evaluate the clarity of the following blog post and provide a clarity score from 1 to 100.',
    //         updatedBy: null
    //     },
    //     {
    //         name: 'AI_API_KEY',
    //         description: 'The API key used for the AI service integrations.',
    //         value: apiKey,
    //         updatedBy: null
    //     }
    // ];

    // for (const setting of settings) {
    //     await prisma.setting.upsert({
    //         where: { name: setting.name },
    //         update: { value: setting.value },
    //         create: setting,
    //     });
    // }

    console.log('Clearing old populated blogs...');
    await prisma.reaction.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.adminComment.deleteMany({});
    await prisma.bookmark.deleteMany({});
    await prisma.blog.deleteMany({});

    console.log('Creating 50 articles via Gemini AI (this may take a while)...');
    let articleCount = 0;

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    for (const topic of topics) {
        for (let i = 0; i < 2; i++) {
            console.log(`Generating article ${articleCount + 1}/20 on topic: ${topic}...`);
            const { title, content } = await generateProfessionalArticleAI(topic, i);

            const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const topicSlug = topic.toLowerCase().replace(/ /g, '-');
            const coverImage = `https://source.unsplash.com/800x400/?${topicSlug},tech,sig=${i}`;
            const createdAt = getRandomDate(oneYearAgo, now);
            const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime()));

            await prisma.blog.create({
                data: {
                    title,
                    content,
                    status: 'SUBMITTED',
                    authorId: author.id,
                    coverImage,
                    createdAt,
                    updatedAt
                }
            });
            articleCount++;

            // Sleep 5 seconds to reduce rate limits (the free tier is 15 requests per minute usually)
            await sleep(5000);
        }
    }

    console.log(`Successfully created ${articleCount} AI-generated articles.`);
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
