const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'krishna-crackers',
  api_key: '258186611618255',
  api_secret: 'KEFutTrydnEOkNHxoO07EpRUVYc'
});

cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', {
  folder: 'Krishna Crackers',
  resource_type: 'image'
}, function(error, result) {
  console.log('krishna-crackers Error:', error);
});

cloudinary.config({
  cloud_name: 'krishnacrackers',
  api_key: '258186611618255',
  api_secret: 'KEFutTrydnEOkNHxoO07EpRUVYc'
});

cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', {
  folder: 'Krishna Crackers',
  resource_type: 'image'
}, function(error, result) {
  console.log('krishnacrackers Error:', error);
});
