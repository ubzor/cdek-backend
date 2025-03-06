/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `DeliveryPoint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPoint_code_key" ON "DeliveryPoint"("code");
