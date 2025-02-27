-- PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- UUID Generator V4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "DeliveryPoint" (
    "uuid" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressComment" TEXT,
    "nearestStation" TEXT,
    "nearestMetroStation" TEXT,
    "workTime" TEXT NOT NULL,
    "email" TEXT,
    "note" TEXT,
    "type" TEXT NOT NULL,
    "ownerCode" TEXT NOT NULL,
    "takeOnly" BOOLEAN NOT NULL,
    "isHandout" BOOLEAN NOT NULL,
    "isReception" BOOLEAN NOT NULL,
    "isDressingRoom" BOOLEAN NOT NULL,
    "isMarketplace" BOOLEAN,
    "isLtl" BOOLEAN,
    "haveCashless" BOOLEAN NOT NULL,
    "haveCash" BOOLEAN NOT NULL,
    "haveFastPaymentSystem" BOOLEAN NOT NULL,
    "allowedCod" BOOLEAN NOT NULL,
    "site" TEXT,
    "weightMin" INTEGER,
    "weightMax" INTEGER,
    "distance" INTEGER,
    "fulfillment" BOOLEAN NOT NULL,

    CONSTRAINT "DeliveryPoint_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Phone" (
    "uuid" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "additional" TEXT,
    "deliveryPointId" UUID NOT NULL,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "OfficeImage" (
    "uuid" UUID NOT NULL,
    "number" INTEGER,
    "url" TEXT NOT NULL,
    "deliveryPointId" UUID NOT NULL,

    CONSTRAINT "OfficeImage_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "WorkTime" (
    "uuid" UUID NOT NULL,
    "day" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "deliveryPointId" UUID NOT NULL,

    CONSTRAINT "WorkTime_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "WorkTimeException" (
    "uuid" UUID NOT NULL,
    "dateStart" TEXT NOT NULL,
    "dateEnd" TEXT NOT NULL,
    "timeStart" TEXT,
    "timeEnd" TEXT,
    "isWorking" BOOLEAN NOT NULL,
    "deliveryPointId" UUID NOT NULL,

    CONSTRAINT "WorkTimeException_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Dimensions" (
    "uuid" UUID NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "deliveryPointId" UUID NOT NULL,

    CONSTRAINT "Dimensions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Location" (
    "uuid" UUID NOT NULL,
    "countryCode" TEXT NOT NULL,
    "regionCode" INTEGER NOT NULL,
    "region" TEXT,
    "cityCode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "fiasGuid" TEXT,
    "postalCode" TEXT,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "addressFull" TEXT NOT NULL,
    "cityUuid" TEXT,
    "deliveryPointId" UUID NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "GeoData" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "coordinates" geography(Point, 4326) NOT NULL,
    "deliveryPointId" UUID NOT NULL,

    CONSTRAINT "GeoData_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_deliveryPointId_key" ON "Location"("deliveryPointId");

-- CreateIndex
CREATE UNIQUE INDEX "GeoData_deliveryPointId_key" ON "GeoData"("deliveryPointId");

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeImage" ADD CONSTRAINT "OfficeImage_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTime" ADD CONSTRAINT "WorkTime_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTimeException" ADD CONSTRAINT "WorkTimeException_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dimensions" ADD CONSTRAINT "Dimensions_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoData" ADD CONSTRAINT "GeoData_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
