const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

app.get('/fetchPosts', async (req, res) => {
  try {
    let subs = req.query.subs ? req.query.subs.split(',') : ['all'];
    let sort = req.query.sort || 'hot';
    let t = req.query.t || 'all';

    let fetches = subs.map((subreddit) => {
      let url = `https://www.reddit.com/r/${subreddit.trim()}/${sort}.json`;
      if (sort === 'top' || sort === 'controversial') {
        url += `?t=${t}`;
      }
      return axios.get(url).then((response) => {
        // Filter posts for those containing images or videos
        return response.data.data.children.filter(
          (post) => post.data.post_hint === 'image' || post.data.is_video
        );
      });
    });

    let results = await Promise.all(fetches);
    let posts = [].concat(...results);

    res.json(posts);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching posts');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
