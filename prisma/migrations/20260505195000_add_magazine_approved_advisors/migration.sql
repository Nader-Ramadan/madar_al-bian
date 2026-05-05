CREATE TABLE `magazine_approved_advisors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `magazineId` INTEGER NOT NULL,
    `advisoryMemberId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `magazine_approved_advisors_magazineId_advisoryMemberId_key`(`magazineId`, `advisoryMemberId`),
    INDEX `magazine_approved_advisors_magazineId_idx`(`magazineId`),
    INDEX `magazine_approved_advisors_advisoryMemberId_idx`(`advisoryMemberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `magazine_approved_advisors` ADD CONSTRAINT `magazine_approved_advisors_magazineId_fkey` FOREIGN KEY (`magazineId`) REFERENCES `magazines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `magazine_approved_advisors` ADD CONSTRAINT `magazine_approved_advisors_advisoryMemberId_fkey` FOREIGN KEY (`advisoryMemberId`) REFERENCES `advisory_committee_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
