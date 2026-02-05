const express = require('express');
const { PeerServer } = require('peer');

const app = express();
const PORT = 3000;

app.use(express.static('.'));

PeerServer({
  port: 9000,
  path: '/',
  allow_discovery: false,
});

app.listen(PORT, () => {
  console.log(`🌐 الموقع شغال على: http://localhost:${PORT}`);
  console.log('🎧 سيرفر PeerJS شغال على المنفذ 9000');
});
