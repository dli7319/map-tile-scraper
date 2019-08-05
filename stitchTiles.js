const fs = require('fs');
const PNG = require('pngjs').PNG;
const JPEG = require('jpeg-js');

let PARAMETERS = {
  "TILE_URL": "https://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
  "ZOOM": 2,
  "TILE_FOLDER": "tiles/",
  "OUTPUT_FILENAME": "output/out.png",
  "DISTORTED_OUTPUT": "output/distorted.png"
};

main();

function main() {
  readParameters().then(stitchTiles);
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

function stitchTiles() {
  const z = PARAMETERS.ZOOM;
  const w = 2 ** z;
  const h = 2 ** z;
  let fileType = "png";

  let tileWidth;
  let tileHeight;

  let finalImage;
  const doneArray = new Array(w);
  for (let x = 0; x < w; x++) {
    doneArray[x] = new Array(h);
    doneArray[x].fill(false);
  }

  for (let x = 0; x < 2 ** z; x++) {
    for (let y = 0; y < 2 ** z; y++) {
      readImage(x, y);
    }
  }

  function readImage(x, y) {
    let fileName = PARAMETERS.TILE_FOLDER + x + "_" + y + ".png";
    if (fileType === 'png') {
      try {
        fs.createReadStream(fileName)
          .pipe(new PNG({
            filterType: 4
          }))
          .on('parsed', function() {
            console.log("PARSED TILE " + x + "_" + y);
            initializeFinalImage(this.width, this.height);
            storeInArray(x * tileWidth, y * tileHeight, {
              height: tileHeight,
              width: tileWidth,
              data: this.data
            });
            doneArray[x][y] = true;
            checkDoneLoading();
          }).on('error', function() {
            if (fileType == "png") {
              fileType = "jpeg";
            }
            readImage(x, y);
          });
      } catch (e) {
        fileType = "jpeg";
      }
    } else if (fileType == "jpeg") {
      try {
        var jpegData = fs.readFileSync(fileName);
        var rawImageData = JPEG.decode(jpegData, true);
        console.log("PARSED TILE " + x + "_" + y);
        initializeFinalImage(rawImageData.width, rawImageData.height);
        storeInArray(x * tileWidth, y * tileHeight, {
          height: tileHeight,
          width: tileWidth,
          data: rawImageData.data
        });
        doneArray[x][y] = true;
        checkDoneLoading();
      } catch (e) {
        if (fileType == "jpeg") {
          fileType = "unknown";
        }
      }
    } else {
      console.log("Unknown file type");
    }
  }

  function initializeFinalImage(width, height) {
    if (typeof finalImage !== 'undefined') {
      return false;
    }
    tileWidth = width;
    tileHeight = height;

    const finalWidth = tileWidth * w;
    const finalHeight = tileHeight * h;

    finalImage = new PNG({
      width: finalWidth,
      height: finalHeight,
      filterType: -1
    });
  }

  function storeInArray(xpos, ypos, data) {
    for (let x = 0; x < data.height; x++) {
      let offsetX = x + xpos;
      // offsetX = width - offsetX;
      for (let y = 0; y < data.width; y++) {
        let offsetY = y + ypos;
        // offsetY = height - offsetY;
        let positionA = (offsetY * finalImage.width + offsetX) * 4;
        let positionB = fileType == "png" ? (y * data.width + x) * 4 : (y * data.width + x) * 3;
        finalImage.data[positionA] = data.data[positionB];
        finalImage.data[positionA + 1] = data.data[positionB + 1];
        finalImage.data[positionA + 2] = data.data[positionB + 2];
        finalImage.data[positionA + 3] = 255;
      }
    }
  }

  function checkDoneLoading() {
    if (isDoneLoading()) {
      console.log("FINAL IMAGE SIZE: " + finalImage.width + ", " + finalImage.height);
      finalImage
        .pack()
        .pipe(fs.createWriteStream(PARAMETERS.OUTPUT_FILENAME));
    }

    function isDoneLoading() {
      return doneArray.every((x) => {
        return x.every((y) => {
          return y;
        });
      });
    }
  }
}
