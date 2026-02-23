// Mocking PrismaClient since database is skipped for MVP
export interface CreateBlogDto {
    title: string;
    content: string;
    authorId: string;
}

export interface UpdateBlogDto {
    id: string;
    title?: string;
    content?: string;
    status?: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';
    aiAnalysis?: any;
}

export class BlogService {
    static async createDraft(data: CreateBlogDto) {
        return { id: 'mock', ...data, status: 'DRAFT', createdAt: new Date() };
    }

    static async updateBlog(data: UpdateBlogDto) {
        return { ...data, updatedAt: new Date() };
    }

    static async getBlogsByAuthor(authorId: string) {
        return [];
    }

    static async getSubmittedBlogs() {
        return [];
    }

    static async getPublishedBlogs() {
        return [];
    }

    static async getBlogById(id: string) {
        return null;
    }
}
