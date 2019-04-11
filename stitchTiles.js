const fs = require('fs');
const PNG = require('pngjs').PNG;
const tileFolder = "tiles/";
const zoomLevel = 3;
const tileSize = [1024, 1024];

main();

function main() {

  const z = zoomLevel;
  const w = 2 ** z;
  const h = 2 ** z;

  const tileWidth = tileSize[0];
  const tileHeight = tileSize[1];
  const width = tileWidth * w;
  const height = tileHeight * h;

  const finalImage = new PNG({
    width: width,
    height: height,
    filterType: -1
  });
  const doneArray = new Array(w);
  for (let x = 0; x < w; x++) {
    doneArray[x] = new Array(h);
    doneArray[x].fill(false);
  }

  for (let x = 0; x < 2 ** z; x++) {
    for (let y = 0; y < 2 ** z; y++) {
      let fileName = tileFolder + x + "_" + y + ".png";
      fs.createReadStream(fileName)
        .pipe(new PNG({
          filterType: 4
        }))
        .on('parsed', function() {
          console.log("PARSED TILE " + x + "_" + y);
          storeInArray(x * tileWidth, y * tileHeight, {
            height: tileHeight,
            width: tileWidth,
            data: this.data
          });
          doneArray[x][y] = true;
          checkDoneLoading();
        });
    }
  }

  function storeInArray(xpos, ypos, data) {
    for (let x = 0; x < data.height; x++) {
      let offsetX = x + xpos;
      // offsetX = width - offsetX;
      for (let y = 0; y < data.width; y++) {
        let offsetY = y + ypos;
        // offsetY = height - offsetY;
        let positionA = (offsetY * width + offsetX) * 4;
        let positionB = (y * data.width + x) * 4;
        finalImage.data[positionA] = data.data[positionB];
        finalImage.data[positionA + 1] = data.data[positionB + 1];
        finalImage.data[positionA + 2] = data.data[positionB + 2];
        finalImage.data[positionA + 3] = 255;
      }
    }
  }

  function checkDoneLoading() {
    if (isDoneLoading()) {
      finalImage
        .pack()
        .pipe(fs.createWriteStream('out.png'));
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
