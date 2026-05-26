-- AlterTable
ALTER TABLE `advisory_committee_members` ADD COLUMN `featured_on_committee` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `committee_sort_order` INTEGER NOT NULL DEFAULT 0;
