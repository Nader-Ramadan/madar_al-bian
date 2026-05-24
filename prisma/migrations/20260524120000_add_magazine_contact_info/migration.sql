-- AlterTable
ALTER TABLE `magazines` ADD COLUMN `contactPhone` VARCHAR(120) NULL,
    ADD COLUMN `contactPhoneTel` VARCHAR(50) NULL,
    ADD COLUMN `contactEmail` VARCHAR(255) NULL,
    ADD COLUMN `contactAddress` TEXT NULL;
