import { prisma } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, UserStatus } from "@prisma/client";

const loginWithEmailAndPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  // 1️⃣ Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found!");
  }

//   // 2️⃣ Check user status
  if (user.status !== UserStatus.ACTIVE) {
    throw new Error(`User account is ${user.status.toLowerCase()}. Please contact support.`);
  }

//   // 3️⃣ Check if verified
//   if (!user.isVerified) {
//     throw new Error("User account is not verified. Please verify your email before logging in.");
//   }

  // 4️⃣ Compare hashed password
  const isPasswordValid = await bcrypt.compare(password, user?.password || "");
  if (!isPasswordValid) {
    throw new Error("Incorrect password!");
  }

  // 5️⃣ Generate JWT token (valid for 7 days)
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  // 6️⃣ Return safe user data
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    picture: user.picture,
    phone: user.phone,
    status: user.status,
    isVerified: user.isVerified,
    token,
  };

  return safeUser;
};
const authWithGoogle = async (data: Prisma.UserCreateInput) => {
    let user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    })

    if (!user) {
        user = await prisma.user.create({
            data
        })
    }

    return user;
}

export const AuthService = {
    loginWithEmailAndPassword,
    authWithGoogle
}