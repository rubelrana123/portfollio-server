import { prisma } from "../../config/db";
import { Prisma, User } from "@prisma/client";
import bcrypt from "bcrypt";

// =======================
// CREATE USER
// =======================
const createUser = async (payload: Prisma.UserCreateInput): Promise<User> => {
  // Optional: Hash password if provided
  let hashedPassword = payload.password;
  if (payload.password) {
    hashedPassword = await bcrypt.hash(payload.password,Number(process.env.BCRYPT_SALT_ROUND));
  }

  const createdUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });
  return createdUser;
};

// =======================
// GET ALL USERS
// =======================
const getAllFromDB = async () => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      picture: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      status: true,
      isVerified: true,
      posts: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        },
      },
      projects: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

// =======================
// GET USER BY ID
// =======================
const getUserById = async (id: number) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      picture: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      posts: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        },
      },
      projects: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        },
      },
    },
  });

  return result;
};

// =======================
// UPDATE USER
// =======================
const updateUser = async (id: number, payload: Partial<User>) => {
  const updateData = { ...payload };

  // Hash password if user tries to update it
  if (payload.password) {
    updateData.password = await bcrypt.hash(payload.password, 10);
  }

  const result = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return result;
};

// =======================
// DELETE USER
// =======================
const deleteUser = async (id: number) => {
  const result = await prisma.user.delete({
    where: { id },
  });
  return result;
};

// =======================
// EXPORT SERVICES
// =======================
export const UserServices = {
  createUser,
  getAllFromDB,
  getUserById,
  updateUser,
  deleteUser,
};
