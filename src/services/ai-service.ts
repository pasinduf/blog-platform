import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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

const getAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not set. AI services will fail if called.");
    }
    return new GoogleGenerativeAI(apiKey || "");
}


export class AIService {

    /**
     * Generates feedback for a writer upon draft submission.
     */
    static async performWriterAnalysis(id: string, title: string, content: string): Promise<WriterAnalysisResult> {
        console.log(`[AI SERVICE] Analyzing content for: "${title}" , id: "${id}"`);

        try {

            const ai = getAIClient();
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

            const prompt = `Analyze the following blog post draft. Provide a clarity score (1-100), strengths, issues, and specific suggestions for improvement.\n\nTitle: ${title}\n\nContent: ${content}`;
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
            const ai = getAIClient();
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

            const prompt = `Generate a concise summary, key points, and potential risks for the following blog post for an admin review.\n\nTitle: ${title}\n\nContent: ${content}`;
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

            const ai = getAIClient();
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

            const prompt = `Evaluate the clarity of the following blog post and provide a clarity score from 1 to 100.\n\nTitle: ${title}\n\nContent: ${content}`;
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
