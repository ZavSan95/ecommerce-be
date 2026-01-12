-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `invoiceType` ENUM('A', 'B', 'C') NOT NULL,
    `pointOfSale` INTEGER NOT NULL,
    `voucherNumber` INTEGER NOT NULL,
    `voucherDate` DATETIME(3) NOT NULL,
    `cae` VARCHAR(191) NOT NULL,
    `caeDueDate` DATETIME(3) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'ARS',
    `totalAmount` DECIMAL(15, 2) NOT NULL,
    `netAmount` DECIMAL(15, 2) NOT NULL,
    `taxAmount` DECIMAL(15, 2) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerDocType` VARCHAR(191) NOT NULL,
    `customerDocNumber` VARCHAR(191) NOT NULL,
    `afipResponse` JSON NOT NULL,
    `status` ENUM('ISSUED', 'CANCELED') NOT NULL DEFAULT 'ISSUED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_orderId_key`(`orderId`),
    INDEX `Invoice_orderId_idx`(`orderId`),
    INDEX `Invoice_voucherNumber_pointOfSale_idx`(`voucherNumber`, `pointOfSale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unitPrice` DECIMAL(15, 2) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,

    INDEX `InvoiceItem_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceFile` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `type` ENUM('PDF') NOT NULL,
    `storage` ENUM('WASABI') NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InvoiceFile_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceFile` ADD CONSTRAINT `InvoiceFile_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
