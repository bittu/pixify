const express = require("express");
const request = require('request').defaults({ encoding: null });
const sizeOf = require('buffer-image-size');
const { createCanvas, loadImage } = require('@napi-rs/canvas')
const Jimp = require('jimp');
const app = express();

const getWatermark = require('./watermark');
const getFallback = require('./fallback');

app.get("/", async (req, res) => {
  console.log('Requested with url: ', req.query.url);
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
          const watermark = await getWatermark();
          const positionX = Jimp.HORIZONTAL_ALIGN_RIGHT;
          const positionY = Jimp.VERTICAL_ALIGN_TOP;
          await watermark.resize(111, 111);
          await watermark.opacity(.99);
          await main.composite(watermark,
            main.getWidth() - 111,
            positionY,
            Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
          await main.quality(100).getBuffer(Jimp.MIME_PNG, (err, buff) => {
            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Content-Length': buff.length
            });
            res.end(buff);
          })

        })

      } else {
        console.error(req.query.url, ': image failed');
        const fallback = await getFallback();

        await fallback.quality(100).getBuffer(Jimp.MIME_PNG, (err, buff) => {
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buff.length
          });
          res.end(buff);
        })
      }
    });
  } else {
    console.log('No URL provided falling back to Netflix logo');
    const fallback = await getFallback();
    await fallback.quality(100).getBuffer(Jimp.MIME_PNG, (err, buff) => {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buff.length
      });
      res.end(buff);
    })
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;