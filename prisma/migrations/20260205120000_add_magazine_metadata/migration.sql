-- AlterTable
ALTER TABLE `magazines` ADD COLUMN `issn` VARCHAR(32) NULL,
    ADD COLUMN `impactFactor` DECIMAL(6, 3) NULL,
    ADD COLUMN `currentVersion` VARCHAR(50) NULL,
    ADD COLUMN `nextVersionRelease` DATETIME(3) NULL,
    ADD COLUMN `publicationPreference` TEXT NULL,
    ADD COLUMN `versionMessage` TEXT NULL,
    ADD COLUMN `certification` TEXT NULL,
    ADD COLUMN `advisorsApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `versionCount` INTEGER NOT NULL DEFAULT 0;
