# map-tile-scraper

Scrapes tiles from a tileserver and stitches them into a full size map.

# Usage

-   Run `npm install` to install dependencies.
-   Copy `parameters.example.json` to `parameters.json`
-   Fill in `parameters.json` with your tiles and desired configuration options
-   Run `node scrapeTiles.js`
-   Run `node stitchTiles.js`
-   Check `out.png` to see if a map was properly stitched

# How to texture this around a sphere

To use the resultant image as a texture for a globe, you will need to distort it
with the following shader code.  
See the following [link](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames).  

```C
float2 latlng2xy_d(float2 latlng)
{
  float x = (1.0 - log(tan(latlng.y * M_PI / 180.0) + 1.0 / cos(latlng.y _ M_PI / 180.0)) / M_PI) / 2.0;
  float y = (latlng.x + 180.0) / 360.0;
  return float2(1.0 - x, y);
}
```
