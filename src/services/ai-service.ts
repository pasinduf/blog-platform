import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

interface WriterAnalysisResult {
    clarityScore: number;
    strengths: string[];
    issues: string[];
    suggestions: string[];
}

interface AdminSummaryResult {
    summary: string;
    keyPoints: string[];
    risks: string[];
}

export class AIService {
    private static async getSettingsConfig(): Promise<Record<string, string>> {
        const settings = await prisma.setting.findMany({
            where: {
                name: { in: ['WRITING_COACH', 'ADMIN_REVIEW', 'CLARITY_SCORE', 'AI_API_KEY'] }
            }
        });

        return settings.reduce((acc, setting) => {
            acc[setting.name] = setting.value;
            return acc;
        }, {} as Record<string, string>);
    }

    private static getAIClient(apiKey: string) {
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not set. AI services will fail if called.");
        }
        return new GoogleGenerativeAI(apiKey || "");
    }

    private static formatPrompt(template: string, title: string, content: string): string {
        return `${template}\n\nTitle: ${title}\nContent: ${content}`;
    }

    /**
     * Generates feedback for a writer upon draft submission.
     */
    static async performWriterAnalysis(id: string, title: string, content: string): Promise<WriterAnalysisResult> {
        console.log(`[AI SERVICE] Analyzing content for: "${title}" , id: "${id}"`);

        try {
            const settings = await this.getSettingsConfig();

            const ai = this.getAIClient(settings.AI_API_KEY || process.env.GEMINI_API_KEY || "");
            const model = ai.getGenerativeModel({
                model: 'gemini-3-flash-preview',
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            clarityScore: { type: SchemaType.INTEGER, description: "A score from 1 to 100 indicating clarity" },
                            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of strengths in the article" },
                            issues: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of issues in the article" },
                            suggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Suggestions to improve the article" }
                        },
                        required: ["clarityScore", "strengths", "issues", "suggestions"]
                    }
                }
            });

            if (!settings.WRITING_COACH) {
                throw new Error("Writing Coach AI setting not found in database.");
            }

            const prompt = this.formatPrompt(settings.WRITING_COACH, title, content);

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            return JSON.parse(responseText) as WriterAnalysisResult;
        } catch (e) {
            console.error(`Failed to parse AI response for blog: ${id}`, e);
            throw new Error("Invalid format from AI");
        }
    }

    /**
     * Generates a concise summary for the admin reviewer.
     */
    static async generateAdminSummary(id: string, title: string, content: string): Promise<AdminSummaryResult> {
        console.log(`[AI SERVICE] Generating summary for: "${title}", id: ${id}`);

        try {
            const settings = await this.getSettingsConfig();
            const ai = this.getAIClient(settings.AI_API_KEY);
            const model = ai.getGenerativeModel({
                model: "gemini-3-flash-preview",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            summary: { type: SchemaType.STRING, description: "A concise summary of the article" },
                            keyPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key points from the article" },
                            risks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Potential risks or controversial elements" }
                        },
                        required: ["summary", "keyPoints", "risks"]
                    }
                }
            });

            if (!settings.ADMIN_REVIEW) {
                throw new Error("Admin Review AI setting not found in database.");
            }

            const prompt = this.formatPrompt(settings.ADMIN_REVIEW, title, content);

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return JSON.parse(responseText) as AdminSummaryResult;
        } catch (e) {
            console.error(`Failed to parse AI response for blog: ${id}`, e);
            throw new Error("Invalid format from AI");
        }
    }

    /**
     * Generates a clarity score when an admin approves an article.
     * Score between 1 and 100.
     */
    static async generateClarityScore(id: string, title: string, content: string): Promise<number> {
        console.log(`[AI SERVICE] Generating clarity score for: "${title}", id: ${id}`);

        try {
            const settings = await this.getSettingsConfig();
            const ai = this.getAIClient(settings.AI_API_KEY);
            const model = ai.getGenerativeModel({
                model: "gemini-3-flash-preview",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.INTEGER, description: "Clarity score from 1 to 100" }
                        },
                        required: ["score"]
                    }
                }
            });

            if (!settings.CLARITY_SCORE) {
                throw new Error("Clarity Score AI setting not found in database.");
            }

            const prompt = this.formatPrompt(settings.CLARITY_SCORE, title, content);

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = JSON.parse(responseText);
            return parsed.score;
        } catch (e) {
            console.error(`Failed to parse AI response for blog: ${id}`, e);
            throw new Error("Invalid format from AI");
        }
    }
}
