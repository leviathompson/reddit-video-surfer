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
let exit = document.createElement('span');
exit.innerHTML = 'x';
exit.style.cursor = 'pointer';
content.style.maxWidth = '100%';
content.style.maxHeight = '100%';
overlay.appendChild(content);
overlay.appendChild(exit);

// Remove the overlay when clicked
exit.addEventListener('click', () => {
    overlay.style.display = 'none';
});

// Fetch posts from specific subreddits
function fetchPosts(subreddits, sort='hot', t='all') {
    let fetches = subreddits.map(subreddit => {
        let url = `https://www.reddit.com/r/${subreddit}/${sort}.json`;
        if (sort === 'top' || sort === 'controversial') {
            url += `?t=${t}`;
        }
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                // Filter posts for those containing images or videos
                return data.data.children.filter(post => post.data.post_hint === 'image' || post.data.is_video);
            });
    });

    Promise.all(fetches)
        .then(results => {
            posts = [].concat(...results);  // Merge the results
            currentIndex = -1;
            nextPost();
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
            content.style.maxWidth = '100%';
            content.style.maxHeight = '100%';
            overlay.appendChild(content);
        }
        content.src = post.data.secure_media.reddit_video.fallback_url;
    } else {
        if (content.tagName !== 'IMG') {
            content = document.createElement('img');
            content.style.maxWidth = '100%';
            content.style.maxHeight = '100%';
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
}

document.addEventListener('keydown', function(event) {
    const key = event.key;  // "ArrowRight", "ArrowLeft", etc.

    switch (key) {
        case "ArrowRight":
            nextPost();
            break;
        case "ArrowLeft":
            previousPost();
            break;
    }
});


// Fetch posts when the script is loaded
let subredditMatch = window.location.pathname.match(/\/r\/([^/]+)/);
let multiRedditMatch = window.location.pathname.match(/\/user\/[^/]+\/m\/([^/]+)/);
let userMatch = window.location.pathname.match(/\/user\/([^/]+)/);
let sortMatch = window.location.pathname.match(/\/(hot|new|rising|controversial|top)/);
let tMatch = window.location.search.match(/\bt=([^&]+)/);

let subs = [];
if (subredditMatch) {
    subs = subredditMatch[1].split('+');
} else if (multiRedditMatch) {
    // Fetch the multireddit data to get the subreddits
    fetch(`https://www.reddit.com/user/${userMatch[1]}/m/${multiRedditMatch[1]}.json`)
        .then(response => response.json())
        .then(data => {
            subs = data.data.subreddits.map(sub => sub.name);
            fetchPosts(subs, sortMatch ? sortMatch[1] : 'hot', tMatch ? tMatch[1] : 'all');
        })
        .catch(error => console.error('Error:', error));
} else {
    subs = ['all'];
}

let sort = sortMatch ? sortMatch[1] : 'hot';
let t = tMatch ? tMatch[1] : 'all';

fetchPosts(subs, sort, t);