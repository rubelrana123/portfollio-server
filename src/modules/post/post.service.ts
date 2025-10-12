import { Post, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { generateSlug } from "../../utils/generateSlug";

// ==============================
// CREATE POST
// ==============================
const createPost = async (payload: Prisma.PostCreateInput): Promise<Post> => {
  // Dynamically create slug if not provided
  const slug = payload.slug || generateSlug(payload.title);

  const result = await prisma.post.create({
    data: {
      ...payload,
      slug,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
        },
      },
    },
  });

  return result;
};
// ==============================
// GET ALL POSTS (with filters + pagination)
// ==============================
const getAllPosts = async ({
  page = 1,
  limit = 10,
  search,
  isFeatured,
  tags,
}: {
  page?: number;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
  tags?: string[];
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.PostWhereInput = {
    AND: [
      search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
      typeof isFeatured === "boolean" && { isFeatured },
      tags && tags.length > 0 ? { tags: { hasSome: tags } } : undefined,
    ].filter(Boolean) as Prisma.PostWhereInput[],
  };

  const result = await prisma.post.findMany({
    skip,
    take: limit,
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.post.count({ where });

  return {
    data: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==============================
// GET POST BY ID (increment viewCount)
// ==============================
const getPostById = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return await tx.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
    });
  });
};

// ==============================
// OPTIONAL: GET POST BY SLUG (for Next.js pages)
// ==============================
const getPostBySlug = async (slug: string) => {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
        },
      },
    },
  });
};

// ==============================
// UPDATE POST
// ==============================
const updatePost = async (id: number, data: Prisma.PostUpdateInput) => {
  return prisma.post.update({
    where: { id },
    data,
    include: {
      author: true,
    },
  });
};

// ==============================
// DELETE POST
// ==============================
const deletePost = async (id: number) => {
  return prisma.post.delete({
    where: { id },
  });
};

// ==============================
// BLOG STATISTICS
// ==============================
const getBlogStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const aggregates = await tx.post.aggregate({
      _count: true,
      _sum: { viewCount: true },
      _avg: { viewCount: true },
      _max: { viewCount: true },
      _min: { viewCount: true },
    });

    const featuredCount = await tx.post.count({
      where: { isFeatured: true },
    });

    const topFeatured = await tx.post.findFirst({
      where: { isFeatured: true },
      orderBy: { viewCount: "desc" },
    });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastWeekPostCount = await tx.post.count({
      where: {
        createdAt: {
          gte: lastWeek,
        },
      },
    });

    return {
      stats: {
        totalPosts: aggregates._count ?? 0,
        totalViews: aggregates._sum.viewCount ?? 0,
        avgViews: aggregates._avg.viewCount ?? 0,
        minViews: aggregates._min.viewCount ?? 0,
        maxViews: aggregates._max.viewCount ?? 0,
      },
      featuredCount,
      topFeatured,
      lastWeekPostCount,
    };
  });
};

// ==============================
// EXPORT SERVICE
// ==============================
export const PostService = {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  getBlogStats,
};
