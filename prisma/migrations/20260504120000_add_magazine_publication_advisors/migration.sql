-- CreateTable
CREATE TABLE `magazine_advisors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `magazineId` INTEGER NOT NULL,
    `photoUrl` VARCHAR(500) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `jobTitle` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `magazine_advisors_magazineId_idx` ON `magazine_advisors`(`magazineId`);

-- AddForeignKey
ALTER TABLE `magazine_advisors` ADD CONSTRAINT `magazine_advisors_magazineId_fkey` FOREIGN KEY (`magazineId`) REFERENCES `magazines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
