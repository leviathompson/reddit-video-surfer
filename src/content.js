let posts = [];
let currentIndex = -1;

// Create the overlay and media elements
let overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.zIndex = 9999;
overlay.style.left = 0;
overlay.style.top = 0;
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
overlay.style.display = 'flex';
overlay.style.justifyContent = 'center';
overlay.style.alignItems = 'center';
document.body.appendChild(overlay);

let content = document.createElement('img');
content.style.maxWidth = '80%';
content.style.maxHeight = '80%';
overlay.appendChild(content);

// Remove the overlay when clicked
overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
});

// Fetch posts from a specific subreddit
function fetchPosts(subreddit = 'all') {
    fetch(`https://www.reddit.com/r/${subreddit}.json`)
        .then(response => response.json())
        .then(data => {
            // Filter posts for those containing images or videos
            posts = data.data.children.filter(post => post.data.post_hint === 'image' || post.data.is_video);
            currentIndex = -1;
        })
        .catch(error => console.error('Error:', error));
}

// Update the overlay and display the image or video
function displayPost(post) {
    if (post.data.is_video) {
        if (content.tagName !== 'VIDEO') {
            content = document.createElement('video');
            content.autoplay = true;
            content.controls = true;
            content.style.maxWidth = '80%';
            content.style.maxHeight = '80%';
            overlay.appendChild(content);
        }
        content.src = post.data.secure_media.reddit_video.fallback_url;
    } else {
        if (content.tagName !== 'IMG') {
            content = document.createElement('img');
            content.style.maxWidth = '80%';
            content.style.maxHeight = '80%';
            overlay.appendChild(content);
        }
        content.src = post.data.url;
    }
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
}

document.addEventListener('keydown', function(event) {
    const key = event.key;  // "ArrowRight", "ArrowLeft", etc.

    switch (key) {
        case "ArrowRight":
            nextPost();
            break;
    }
});

// Fetch posts when the script is loaded
fetchPosts('pics');
