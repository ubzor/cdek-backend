-- @param {Float} $1:$minLongitude
-- @param {Float} $2:$minLatitude
-- @param {Float} $3:$maxLongitude
-- @param {Float} $4:$maxLatitude
SELECT "deliveryPointId",
    ST_X(coordinates::geometry) as longitude,
    ST_Y(coordinates::geometry) as latitude
FROM "GeoData"
WHERE coordinates && ST_MakeEnvelope($1, $2, $3, $4, 4326)