const express = require("express");
const request = require('request').defaults({ encoding: null });
const sizeOf = require('buffer-image-size');
const { createCanvas, loadImage } = require('@napi-rs/canvas')

const app = express();

app.get("/", (req, res) => {
  request.get(req.query.url, async function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const buffer = Buffer.from(body)
      const {width, height} = sizeOf(buffer);

      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')

      loadImage(buffer).then(async (image) => {
        ctx.drawImage(image, 0, 0, width, height)
        const pngData = await canvas.encode('png')
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': pngData.length
        });
        res.end(pngData);
      })

    }
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;