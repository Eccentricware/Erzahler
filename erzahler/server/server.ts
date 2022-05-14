import express from 'express';

const erzhaler = express();
const port: number = 8000;

erzhaler.get('/', (req, res) => {
  const testFeedBack: string = `Who is up for an interactive story?`;
  res.send(testFeedBack);
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});