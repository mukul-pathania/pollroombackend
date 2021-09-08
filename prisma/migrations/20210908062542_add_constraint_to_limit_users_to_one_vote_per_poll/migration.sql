/*
  Warnings:

  - A unique constraint covering the columns `[poll_id,user_id]` on the table `vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `poll_id` to the `vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vote" ADD COLUMN     "poll_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "vote.poll_id_user_id_unique" ON "vote"("poll_id", "user_id");

-- AddForeignKey
ALTER TABLE "vote" ADD FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
