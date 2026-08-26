const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dnvfrvyfq',
  api_key: '258186611618255',
  api_secret: 'KEFutTrydnEOkNHxoO07EpRUVYc'
});

cloudinary.api.ping(function(error, result) {
  console.log(error || result);
});
