const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dnvfrvyfq',
  api_key: '258186611618255',
  api_secret: 'KEFutTrydnEOkNHxoO07EpRUVYc'
});

cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', function(error, result) {
  console.log('No folder Error:', error);
});
