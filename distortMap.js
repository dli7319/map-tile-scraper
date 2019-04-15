const fs = require('fs');
const PNG = require('pngjs').PNG;

let PARAMETERS = {
  "TILE_URL": "https://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
  "ZOOM": 2,
  "TILE_FOLDER": "tiles/",
  "OUTPUT_FILENAME": "output/out.png",
  "DISTORTED_OUTPUT": "output/distorted.png"
};

main();

function main() {
  readParameters().then(distortMap);
}

function readParameters() {
  return new Promise(resolve => {
    let filePath = process.argv.length >= 3 ? process.argv[2] : "parameters.json";
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Cannot read parameters.json", err);
        process.exit();
      }
      PARAMETERS = JSON.parse(data);
      resolve(PARAMETERS);
    });
  });
}

function distortMap() {
  fs.createReadStream(PARAMETERS.OUTPUT_FILENAME)
    .pipe(new PNG())
    .on('parsed', function() {
      const finalImage = new PNG({
        width: this.width,
        height: this.height
      });

      for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
          const idx = (this.width * y + x) << 2;
          let distortedY = Math.floor(this.height * (1.0 - lat2tile(y / this.height * 180 - 90)));
          distortedY = Math.min(Math.max(distortedY, 0), this.height - 1);
          const idx2 = (this.width * distortedY + x) << 2;
          finalImage.data[idx] = this.data[idx2];
          finalImage.data[idx + 1] = this.data[idx2 + 1];
          finalImage.data[idx + 2] = this.data[idx2 + 2];
          finalImage.data[idx + 3] = 255;
        }
      }

      finalImage.pack().pipe(fs.createWriteStream(PARAMETERS.DISTORTED_OUTPUT));
    });


  function long2tile(lon) {
    return (lon + 180) / 360;
  }

  function lat2tile(lat) {
    const RAD2DEG = 180 / Math.PI;
    const PI_4 = Math.PI / 4;
    const result = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2;
    return Math.min(Math.max(result, 0), 1);
  }
}
