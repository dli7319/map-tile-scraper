# Map Tile Scraper

Scrapes tiles from a tileserver and stitches them into a full size map.
Tested with OpenStreetMap and Google Maps tile servers.

# Requirements
* Node.js

# Usage

-   Run `npm install` to install dependencies.
-   Copy `parameters.example.json` to `parameters.json`
-   Fill in `parameters.json` with your tiles and desired configuration options
-   Run `node scrapeTiles.js`
-   Run `node stitchTiles.js`
-   Check `out.png` to see if a map was properly stitched
-   Run `node distortMap.js` to convert the Mercator projection to Equirectangular (uv = lat/lng) projection

# How to texture this around a sphere

Apply the distorted map to a sphere where the UVs are equally spaced.

Alternatively, you can use the Mercator projection `out.png` map, transforming the coordinates with the following shader code.  
See the following [link](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames) for more details about the Mercator projection used by OpenStreetMap and Google Maps.  

```C
float2 latlng2xy_d(float2 latlng)
{
  float x = (1.0 - log(tan(latlng.y * M_PI / 180.0) + 1.0 / cos(latlng.y * M_PI / 180.0)) / M_PI) / 2.0;
  float y = (latlng.x + 180.0) / 360.0;
  return float2(1.0 - x, y);
}
```

TODO:
* Fix aspect ratio of Equirectangular projection.
