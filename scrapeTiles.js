const fs = require('fs');
const fetch = require('node-fetch');

const targetFolder = "tiles/";

main();

function getMapTileUrl(x, y, z, options = {}) {
  if (options.resolution == null) {
    options.resolution = 4;
  }
  let url = 'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i' + z + '!2i' + x + '!3i' + y + '!4i256!2m3!1e0!2sm!3i461170300!3m14!2sen-US!3sUS!5e18!12m1!1e68!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy50OjF8cy5lOmwudHxwLnY6b2ZmLHMudDoxN3xzLmU6bC50fHAudjpvbixzLnQ6MnxwLnY6b2ZmLHMudDo0OXxwLnY6b2ZmLHMudDo0fHAudjpvZmY!4e0!5m1!5f4!23i1301875';
  return url;
}


function main() {

  let z = 3;
  for (let x = 0; x < 2 ** z; x++) {
    for (let y = 0; y < 2 ** z; y++) {
      let fileName = targetFolder + x + "_" + y + ".png";
      fetch(getMapTileUrl(x, y, z))
        .then(image =>
          image.body
          .pipe(fs.createWriteStream(fileName))
          .on('close', () => console.log('image ' + fileName + ' downloaded')));
    }
  }
}
