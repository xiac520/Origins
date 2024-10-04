const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/get', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.get(url);
    res.json({ contents: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch the URL' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});