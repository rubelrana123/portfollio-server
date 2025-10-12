/*
  Warnings:

  - You are about to drop the column `repoUrl` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "repoUrl",
ADD COLUMN     "clientRepoUrl" TEXT,
ADD COLUMN     "serverRepoUrl" TEXT;
