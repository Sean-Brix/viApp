import express from 'express';

const app = express();
const PORT = 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

console.log('About to listen...');

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('After listen call');

setInterval(() => {
  console.log('Still alive...');
}, 5000);
