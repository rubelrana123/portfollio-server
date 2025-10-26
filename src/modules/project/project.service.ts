import { Project, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { generateSlug } from "../../utils/generateSlug";

// ==============================
// CREATE PROJECT
// ==============================
const createProject = async (payload: Prisma.ProjectCreateInput): Promise<Project> => {
  // Generate slug dynamically if not provided
  const slug = payload.slug || generateSlug(payload.title);
  console.log(payload)
  const result = await prisma.project.create({
    data: {
      ...payload,
      slug,
    },
    include: {
      owner: {
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
// GET ALL PROJECTS (filters + pagination)
// ==============================
const getAllProjects = async ({
  page = 1,
  limit = 10,
  search,
  isFeatured,
}: {
  page?: number;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectWhereInput = {
    AND: [
      search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
      typeof isFeatured === "boolean" && { isFeatured },
    ].filter(Boolean) as Prisma.ProjectWhereInput[],
  };

  const result = await prisma.project.findMany({
    skip,
    take: limit,
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const total = await prisma.project.count({ where });

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
// GET PROJECT BY ID
// ==============================
const getProjectById = async (id: number) => {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
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
// GET PROJECT BY SLUG (for Next.js pages)
// ==============================
const getProjectBySlug = async (slug: string) => {
  return await prisma.project.findUnique({
    where: { slug },
    include: {
      owner: {
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
// UPDATE PROJECT
// ==============================
const updateProject = async (id: number, data: Prisma.ProjectUpdateInput) => {
    console.log(data);
  return prisma.project.update({
    where: { id },
    data,
    include: {
      owner: {
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
// DELETE PROJECT
// ==============================
const deleteProject = async (id: number) => {
  return prisma.project.delete({
    where: { id },
  });
};

// ==============================
// PROJECT STATISTICS
// ==============================
const getProjectStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const totalProjects = await tx.project.count();
    const featuredCount = await tx.project.count({ where: { isFeatured: true } });

    const recentProjects = await tx.project.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastWeekProjectCount = await tx.project.count({
      where: {
        createdAt: { gte: lastWeek },
      },
    });

    return {
      stats: {
        totalProjects,
        featuredCount,
        lastWeekProjectCount,
        recentProjects,
      },
    };
  });
};

// ==============================
// EXPORT SERVICE
// ==============================
export const ProjectService = {
  createProject,
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  updateProject,
  deleteProject,
  getProjectStats,
};
