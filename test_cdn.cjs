const https = require('https');

const req = https.get('https://aac.saavncdn.com/262/29c4e8a97c366de2dafed13b42b4370a_320.mp4', (res) => {
    console.log(res.statusCode);
    console.log(res.headers);
});
req.on('error', console.error);
