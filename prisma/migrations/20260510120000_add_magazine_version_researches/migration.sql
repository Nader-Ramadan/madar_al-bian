-- CreateTable
CREATE TABLE `magazine_version_researches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `magazineVersionId` INTEGER NOT NULL,
    `researcherNames` TEXT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `externalUrl` VARCHAR(500) NOT NULL,
    `summary` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `magazine_version_researches_magazineVersionId_idx` ON `magazine_version_researches`(`magazineVersionId`);

-- AddForeignKey
ALTER TABLE `magazine_version_researches` ADD CONSTRAINT `magazine_version_researches_magazineVersionId_fkey` FOREIGN KEY (`magazineVersionId`) REFERENCES `magazine_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
