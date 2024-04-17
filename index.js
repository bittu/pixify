const express = require("express");
const webp = require('webp-converter');
const request = require('request').defaults({ encoding: null });

const app = express();

app.get("/", (req, res) => {
  // let result = webp.buffer2webpbuffer(data,"png","-q 80");
  //   result.then(function(result) {
  //     // you access the value from the promise here
  //     console.log(result)
  //   });
  request.get(req.query.url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data = Buffer.from(body).toString('base64');
      var img = Buffer.from(data, 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
      });
      res.end(img);
    }
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;