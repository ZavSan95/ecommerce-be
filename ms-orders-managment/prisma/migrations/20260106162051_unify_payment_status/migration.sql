/*
  Warnings:

  - The values [approved,rejected] on the enum `OrderPayment_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `OrderPayment` MODIFY `status` ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL;
