const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'made-up-cloud-name-12345',
  api_key: '258186611618255',
  api_secret: 'KEFutTrydnEOkNHxoO07EpRUVYc'
});

cloudinary.api.ping(function(error, result) {
  console.log('Made up ping result:', error || result);
});
