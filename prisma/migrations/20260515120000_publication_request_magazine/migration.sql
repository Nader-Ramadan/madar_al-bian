-- Optional target magazine for publication requests
ALTER TABLE `publication_requests` ADD COLUMN `magazineId` INTEGER NULL;

CREATE INDEX `publication_requests_magazineId_idx` ON `publication_requests`(`magazineId`);

ALTER TABLE `publication_requests` ADD CONSTRAINT `publication_requests_magazineId_fkey` FOREIGN KEY (`magazineId`) REFERENCES `magazines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
