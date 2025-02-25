-- CreateTable
CREATE TABLE "DeliveryPoint" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
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
    "fulfillment" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "additional" TEXT,
    "deliveryPointId" TEXT NOT NULL,
    CONSTRAINT "Phone_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfficeImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER,
    "url" TEXT NOT NULL,
    "deliveryPointId" TEXT NOT NULL,
    CONSTRAINT "OfficeImage_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "deliveryPointId" TEXT NOT NULL,
    CONSTRAINT "WorkTime_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkTimeException" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateStart" TEXT NOT NULL,
    "dateEnd" TEXT NOT NULL,
    "timeStart" TEXT,
    "timeEnd" TEXT,
    "isWorking" BOOLEAN NOT NULL,
    "deliveryPointId" TEXT NOT NULL,
    CONSTRAINT "WorkTimeException_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dimensions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "deliveryPointId" TEXT NOT NULL,
    CONSTRAINT "Dimensions_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryCode" TEXT NOT NULL,
    "regionCode" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "cityCode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "fiasGuid" TEXT,
    "postalCode" TEXT,
    "longitude" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "addressFull" TEXT NOT NULL,
    "cityUuid" TEXT,
    "deliveryPointId" TEXT NOT NULL,
    CONSTRAINT "Location_deliveryPointId_fkey" FOREIGN KEY ("deliveryPointId") REFERENCES "DeliveryPoint" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_deliveryPointId_key" ON "Location"("deliveryPointId");
