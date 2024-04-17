const express = require("express");
const request = require('request').defaults({ encoding: null });
const sizeOf = require('buffer-image-size');
const { createCanvas, loadImage } = require('@napi-rs/canvas')
const Jimp = require('jimp');
const app = express();

app.get("/", (req, res) => {
  console.log('Requested with url: ', );
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
          const watermark = await Jimp.read(Buffer.from('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', 'base64'));
          const positionX = Jimp.HORIZONTAL_ALIGN_RIGHT;
          const positionY = Jimp.VERTICAL_ALIGN_TOP;
          // await watermark.resize(50, 50);
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