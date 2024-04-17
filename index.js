const express = require("express");
const request = require('request').defaults({ encoding: null });
const sizeOf = require('buffer-image-size');
const { createCanvas, loadImage } = require('@napi-rs/canvas')
const Jimp = require('jimp');
const app = express();

const getDimensions = (H, W, h, w, ratio) => {
  let hh, ww;
  if ((H / W) < (h / w)) {
      hh = ratio * H;
      ww = hh / h * w;
  } else {
      ww = ratio * W;
      hh = ww / w * h;
  }
  return [hh, ww];
}

app.get("/", (req, res) => {
  if (req.query.url) {
    request.get(req.query.url, async function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(req.query.url, ': image found');
        const buffer = Buffer.from(body)
        const {width, height} = sizeOf(buffer);

        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        loadImage(buffer).then(async (image) => {
          ctx.drawImage(image, 0, 0, width, height)
          const pngData = await canvas.encode('png');

          const main = await Jimp.read(pngData);
          const watermark = await Jimp.read('./NetflixLogoWhiteResized.png');
          // const [newHeight, newWidth] = getDimensions(main.getHeight(), main.getWidth(), watermark.getHeight(), watermark.getWidth(), .6);
          const positionX = Jimp.HORIZONTAL_ALIGN_RIGHT;
          const positionY = Jimp.VERTICAL_ALIGN_TOP;
          await watermark.resize(50, 50);
          await watermark.opacity(.99);
          await main.composite(watermark,
            main.getWidth() - 50,
            positionY,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
          await main.quality(100).getBuffer(Jimp.MIME_PNG, (err, buff) => {
            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Content-Length': buff.length
            });
            res.end(buff);
            console.log(req.query.url, `${width} x ${height}`, ': image converted');
          })

        })

      } else {
        console.error(req.query.url, ': image failed');
      }
    });
  } else {
    res.send('Please send url query ?url=');
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;