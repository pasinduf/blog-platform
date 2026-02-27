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
    /**
     * Generates feedback for a writer upon draft submission.
     * In a real implementation this would call an LLM with strict JSON schema parsing and timeouts.
     */
    static async performWriterAnalysis(title: string, content: string): Promise<WriterAnalysisResult> {
        console.log(`[AI SERVICE] Analyzing content for: "${title}"`);

        // Simulate network delay and processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            clarityScore: Math.floor(Math.random() * 20) + 70, // Random score 70-90
            strengths: ['Clear introduction', 'Engaging tone'],
            issues: ['Abrupt conclusion'],
            suggestions: ['Add a summary summarizing the key takeaways.'],
        };
    }

    /**
     * Generates a concise summary for the admin reviewer.
     */
    static async generateAdminSummary(title: string, content: string): Promise<AdminSummaryResult> {
        console.log(`[AI SERVICE] Generating summary for: "${title}"`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            summary: 'The author explains the topic clearly but lacks some depth in the technical sections.',
            keyPoints: ['Good high level overview', 'Requires prior knowledge to grasp fully'],
            risks: ['Might be too vague for advanced readers', 'Some statements are subjective'],
        };
    }

    /**
     * Generates a clarity score when an admin approves an article.
     * Score between 1 and 100.
     */
    static async generateClarityScore(title: string, content: string): Promise<number> {
        console.log(`[AI SERVICE] Generating clarity score for: "${title}"`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Random score 60-100
        return Math.floor(Math.random() * (100 - 60 + 1)) + 60;
    }
}
