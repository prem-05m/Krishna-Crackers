const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  // formData.append('upload_preset', 'unsigned_preset_name');
  
  const timestamp = Math.round(new Date().getTime() / 1000);
  formData.append('timestamp', timestamp);
  formData.append('api_key', '258186611618255');
  
  // Signature = sha1("timestamp=" + timestamp + "API_SECRET")
  const crypto = require('crypto');
  const signature = crypto.createHash('sha1').update('timestamp=' + timestamp + 'KEFutTrydnEOkNHxoO07EpRUVYc').digest('hex');
  
  formData.append('signature', signature);
  
  const response = await fetch('https://api.cloudinary.com/v1_1/dnvfrvyfq/image/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', data);
}

testUpload();
