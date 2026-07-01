-- AlterTable: extend publication status enum
ALTER TABLE `publication_requests` MODIFY `status` ENUM('AWAITING_PAYMENT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable: payment access token fields
ALTER TABLE `publication_requests` ADD COLUMN `payment_access_token` VARCHAR(64) NULL;
ALTER TABLE `publication_requests` ADD COLUMN `payment_token_expires_at` DATETIME(3) NULL;
CREATE UNIQUE INDEX `publication_requests_payment_access_token_key` ON `publication_requests`(`payment_access_token`);

-- CreateTable: payments
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publication_request_id` INTEGER NOT NULL,
    `paypal_order_id` VARCHAR(64) NOT NULL,
    `paypal_capture_id` VARCHAR(64) NULL,
    `paypal_refund_id` VARCHAR(64) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payer_email` VARCHAR(255) NULL,
    `payer_name` VARCHAR(255) NULL,
    `refund_error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_publication_request_id_key`(`publication_request_id`),
    UNIQUE INDEX `payments_paypal_order_id_key`(`paypal_order_id`),
    UNIQUE INDEX `payments_paypal_capture_id_key`(`paypal_capture_id`),
    UNIQUE INDEX `payments_paypal_refund_id_key`(`paypal_refund_id`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: publication fee settings
CREATE TABLE `publication_fee_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `label_ar` VARCHAR(255) NULL,
    `label_en` VARCHAR(255) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `publication_fee_settings` (`id`, `amount`, `currency`, `enabled`, `updatedAt`)
VALUES (1, 0, 'USD', false, CURRENT_TIMESTAMP(3));

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_publication_request_id_fkey` FOREIGN KEY (`publication_request_id`) REFERENCES `publication_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
