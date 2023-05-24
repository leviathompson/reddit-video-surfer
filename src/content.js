let posts = [];
let currentIndex = -1;

// Create the overlay and media elements
let overlay = document.getElementById('overlay');
let contentWrapper = document.getElementById('contentWrapper');
let content = document.getElementById('content');
let count = document.getElementById('count');
let total = document.getElementById('total');

document.getElementById('fetchPosts').addEventListener('click', function () {
  let subs = document.getElementById('subreddits').value.split(',');
  let sort = document.getElementById('sort').value;
  let t = document.getElementById('time').value;

  fetchPosts(subs, sort, t);
});

// Fetch posts from specific subreddits
function fetchPosts(subs, sort, t) {
  fetch(`/fetchPosts?subs=${subs}&sort=${sort}&t=${t}`)
    .then((response) => response.json())
    .then((data) => {
      posts = data;
      currentIndex = -1;
      nextPost();
    })
    .catch((error) => console.error('Error:', error));
}

// Update the overlay and display the image or video
function displayPost(post) {
  contentWrapper.innerHTML = ''; // Clear the contentWrapper

  if (post.data.is_video) {
    content = document.createElement('video');
    content.autoplay = true;
    content.controls = true;
    content.src = post.data.secure_media.reddit_video.fallback_url;
  } else {
    content = document.createElement('img');
    content.src = post.data.url;
  }

  content.style.objectFit = 'contain';
  content.style.maxWidth = '100%';
  content.style.maxHeight = '100%';
  contentWrapper.appendChild(content);
  overlay.style.display = 'flex';
}

// Navigate to the next image or video
function nextPost() {
  if (posts.length === 0) {
    console.log('No posts available');
    return;
  }

  currentIndex = (currentIndex + 1) % posts.length;
  let post = posts[currentIndex];

  // Now display the post as an overlay
  displayPost(post);
  count.innerHTML = currentIndex + 1;
  total.innerHTML = posts.length;
}

// Navigate to the previous image or video
function previousPost() {
  if (currentIndex === 0) {
    console.log('No previous posts');
    return;
  }

  currentIndex = (currentIndex - 1) % posts.length;
  let post = posts[currentIndex];

  // Now display the post as an overlay
  displayPost(post);
  count.innerHTML = currentIndex + 1;
  total.innerHTML = posts.length;
}

document.addEventListener('keydown', function (event) {
  const key = event.key; // "ArrowRight", "ArrowLeft", etc.

  switch (key) {
    case 'ArrowRight':
      nextPost();
      break;
    case 'ArrowLeft':
      previousPost();
      break;
  }
});

// Fetch posts when the script is loaded
let subredditMatch = window.location.pathname.match(/\/r\/([^/]+)/);
let multiRedditMatch = window.location.pathname.match(
  /\/user\/[^/]+\/m\/([^/]+)/
);
let userMatch = window.location.pathname.match(/\/user\/([^/]+)/);
let sortMatch = window.location.pathname.match(
  /\/(hot|new|rising|controversial|top)/
);
let tMatch = window.location.search.match(/\bt=([^&]+)/);

let subs = [];
if (subredditMatch) {
  subs = subredditMatch[1].split('+');
} else if (multiRedditMatch) {
  // Fetch the multireddit data to get the subreddits
  fetch(
    `https://www.reddit.com/user/${userMatch[1]}/m/${multiRedditMatch[1]}.json`
  )
    .then((response) => response.json())
    .then((data) => {
      subs = data.data.subreddits.map((sub) => sub.name);
      fetchPosts(
        subs,
        sortMatch ? sortMatch[1] : 'hot',
        tMatch ? tMatch[1] : 'all'
      );
    })
    .catch((error) => console.error('Error:', error));
} else {
  subs = ['all'];
}

let sort = sortMatch ? sortMatch[1] : 'hot';
let t = tMatch ? tMatch[1] : 'all';

fetchPosts(subs, sort, t);
