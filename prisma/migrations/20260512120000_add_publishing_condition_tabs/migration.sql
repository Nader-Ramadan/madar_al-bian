-- CreateTable
CREATE TABLE `magazine_publishing_condition_tabs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `magazineId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `iconKey` VARCHAR(50) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `magazine_publishing_condition_tabs_magazineId_idx` ON `magazine_publishing_condition_tabs`(`magazineId`);

-- AddForeignKey
ALTER TABLE `magazine_publishing_condition_tabs` ADD CONSTRAINT `magazine_publishing_condition_tabs_magazineId_fkey` FOREIGN KEY (`magazineId`) REFERENCES `magazines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
