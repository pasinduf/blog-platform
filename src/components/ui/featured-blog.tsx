"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, User, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FeaturedBlogProps {
  blog: {
    id: string;
    title: string;
    excerpt?: string;
    updatedAt: Date;
    author?: { id?: string; name: string };
    commentCount?: number;
    coverImage?: string;
  };
}

export default function FeaturedBlog({ blog }: FeaturedBlogProps) {

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl overflow-hidden shadow-xl border border-blue-100">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 relative h-56 lg:h-auto">
          {blog.coverImage ? (
            <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
              <span className="text-6xl text-white">🌟</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/10"></div>

          {/* Category Badge */}
          {/* <div className="absolute top-6 left-6">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-sm font-semibold text-blue-700 rounded-full shadow-lg">
              Featured • {post.category.name}
            </span>
          </div> */}
        </div>

        <div className="lg:w-1/2 p-8 md:p-12">
          <div className="mb-6">
            <div className="flex items-center gap-4 text-sm text-blue-600 mb-3">
              {blog.updatedAt &&
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatDate(blog.updatedAt)}</span>
                </div>
              }
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{blog.author?.name}</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              <Link href={`/article/${blog.id}`} className="hover:text-blue-600 transition-colors">
                {blog.title}
              </Link>
            </h2>

            {blog.excerpt && <p className="text-lg text-gray-600 mb-6 line-clamp-3">{blog.excerpt}</p>}
          </div>

          <Link
            href={`/article/${blog.id}`}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transition-all hover:gap-4 group"
          >
            Read Featured Article
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">5</div>
              <div className="text-sm text-gray-500">Min Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">42</div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">1.2K</div>
              <div className="text-sm text-gray-500">Views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
