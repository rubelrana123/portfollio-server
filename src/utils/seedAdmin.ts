import bcrypt from "bcrypt";
import { prisma } from "../config/db";

export const seedAdmin = async () => {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;
    const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);

    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log("Admin already exists!");
      return;
    }

    console.log("Creating Super Admin...");

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD as string, SALT_ROUNDS);

    // Create admin user
    await prisma.user.create({
      data: {
        name: "Rubel Rana",
        email: ADMIN_EMAIL as string,
        phone: "01234567890",
        password: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
    });

    console.log(" Admin seeded successfully!");
  } catch (error) {
    console.error("Failed to seed  admin:", error);
  }
};
