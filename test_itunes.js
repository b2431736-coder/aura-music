const https = require('https');

https.get('https://itunes.apple.com/search?term=pop&entity=song&limit=2', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log(data));
});
