-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "encrypted_password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "recovery_sent_at" TIMESTAMP(3),
    "recovery_token" TEXT,
    "last_sign_in_at" TIMESTAMP(3),
    "confirmation_sent_at" TIMESTAMP(3),
    "confirmation_token" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "bio" TEXT,
    "avatar_url" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option" (
    "id" TEXT NOT NULL,
    "option_text" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote" (
    "id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_roomTouser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user.username_unique" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "room.name_unique" ON "room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_roomTouser_AB_unique" ON "_roomTouser"("A", "B");

-- CreateIndex
CREATE INDEX "_roomTouser_B_index" ON "_roomTouser"("B");

-- AddForeignKey
ALTER TABLE "room" ADD FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll" ADD FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote" ADD FOREIGN KEY ("option_id") REFERENCES "option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roomTouser" ADD FOREIGN KEY ("A") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roomTouser" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
