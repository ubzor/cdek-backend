-- @param {Float} $1:$minLongitude
-- @param {Float} $2:$minLatitude
-- @param {Float} $3:$maxLongitude
-- @param {Float} $4:$maxLatitude
SELECT gd."deliveryPointId",
    ST_X(gd."coordinates"::geometry) as longitude,
    ST_Y(gd."coordinates"::geometry) as latitude
FROM "GeoData" gd
JOIN "DeliveryPoint" dp ON gd."deliveryPointId" = dp."uuid"
WHERE gd."coordinates" && ST_MakeEnvelope($1, $2, $3, $4, 4326)