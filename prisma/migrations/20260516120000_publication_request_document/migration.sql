-- AlterTable
ALTER TABLE `publication_requests` ADD COLUMN `documentUrl` VARCHAR(2048) NULL,
    ADD COLUMN `documentFilename` VARCHAR(255) NULL,
    ADD COLUMN `documentSize` INTEGER NULL;
