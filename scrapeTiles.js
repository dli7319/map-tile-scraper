const fs = require('fs');
const fetch = require('node-fetch');

let PARAMETERS = {
  "TILE_URL": "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "ZOOM": 2,
  "TILE_FOLDER": "tiles/"
};

main();

function getMapTileUrl(x, y, z, options = {}) {
  if (options.resolution == null) {
    options.resolution = 4;
  }
  return PARAMETERS.TILE_URL
    .replace("{x}", x)
    .replace("{y}", y)
    .replace("{z}", z)
    .replace("{resolution}", options.resolution);
}


function main() {
  readParameters().then(downloadTiles);
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

function downloadTiles() {
  let z = PARAMETERS.ZOOM;
  if (!fs.existsSync(PARAMETERS.TILE_FOLDER)){
    fs.mkdirSync(PARAMETERS.TILE_FOLDER);
}
  for (let x = 0; x < 2 ** z; x++) {
    for (let y = 0; y < 2 ** z; y++) {
      let fileName = PARAMETERS.TILE_FOLDER + x + "_" + y + ".png";
      fetch(getMapTileUrl(x, y, z))
        .then(image =>
          image.body
          .pipe(fs.createWriteStream(fileName))
          .on('close', () => console.log('image ' + fileName + ' downloaded')));
    }
  }
}
