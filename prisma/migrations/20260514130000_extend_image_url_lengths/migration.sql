-- Longer S3/CDN URLs for uploaded assets (next/image + admin uploads)
ALTER TABLE `magazines` MODIFY `image` VARCHAR(2048) NOT NULL;
ALTER TABLE `blogs` MODIFY `image` VARCHAR(2048) NULL;
ALTER TABLE `conferences` MODIFY `image` VARCHAR(2048) NULL;
ALTER TABLE `advisory_committee_members` MODIFY `image` VARCHAR(2048) NULL;
