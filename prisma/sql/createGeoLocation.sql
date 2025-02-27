-- @param {String} $1:deliveryPointId
-- @param {Float} $2:longitude
-- ///@param {Float} $3:latitude
INSERT INTO "GeoData" ("deliveryPointId", "coordinates")
VALUES ($1::uuid, ST_SetSRID(ST_MakePoint($2, $3)::geography, 4326))