/*
  Warnings:

  - Added the required column `updated_at` to the `option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `poll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `vote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "provider" AS ENUM ('EMAIL', 'GOOGLE', 'GITHUB');

-- AlterTable
ALTER TABLE "option" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- AlterTable
ALTER TABLE "poll" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- AlterTable
ALTER TABLE "room" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "provider" "provider" NOT NULL,
ALTER COLUMN "encrypted_password" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "recovery_sent_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "last_sign_in_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "confirmation_sent_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "confirmation_token" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "confirmed_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "vote" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "vote" ADD FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
