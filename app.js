// 🧠 Arz App – Complete JS Functionality with Advanced Features + Backend Connection
const API_BASE_URL = 'http://localhost:5000/api'; // Backend API base URL

let user = JSON.parse(localStorage.getItem("arzUser")) || { 
    username: "Guest", 
    profilePic: "https://via.placeholder.com/40x40/00bcd4/ffffff?text=G",
    email: "",
    password: "",
    following: [],
    bookmarks: []
};

let posts = JSON.parse(localStorage.getItem("arzPosts")) || [];
let currentTheme = localStorage.getItem("arzTheme") || "dark";
let currentPage = 1;
const postsPerPage = 6;
let notifications = JSON.parse(localStorage.getItem("arzNotifications")) || [];

// 🚀 Initial Render
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

async function initializeApp() {
    // Set theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Check if user is logged in
    const savedUser = localStorage.getItem("arzUser");
    if (savedUser) {
        user = JSON.parse(savedUser);
    }
    
    // Test backend connection
    await testBackendConnection();
    
    // Initialize all systems
    initializeThemeToggle();
    initializeNotifications();
    initializeSearch();
    setupInfiniteScroll();
    setupLazyLoading();
    
    // Render content based on page
    if (document.querySelector('.feed')) {
        await loadPostsFromBackend();
        renderPosts();
        setupInteractions();
    }
    
    if (document.getElementById('uploadForm')) {
        setupUploadForm();
    }
    
    if (document.querySelector('#login form')) {
        setupLoginForm();
    }
    
    if (document.getElementById('registerForm')) {
        setupRegisterForm();
    }
    
    if (document.querySelector('.contact-form')) {
        setupContactForm();
    }
    
    if (document.querySelector('.donate-page')) {
        setupDonation();
    }
    
    if (document.querySelector('.profile-page')) {
        renderUserProfile();
    }
    
    if (document.getElementById('searchInput')) {
        initializeSearch();
    }
    
    updateUIForLoginStatus();
}

// 🔗 Backend Connection Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    if (options.body) {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function testBackendConnection() {
    try {
        const response = await apiRequest('/test');
        console.log('✅ Backend connected:', response);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        showNotification('Backend server not connected. Using local storage.', 'warning');
        return false;
    }
}

async function loadPostsFromBackend() {
    try {
        const data = await apiRequest('/posts');
        if (data.posts && data.posts.length > 0) {
            posts = data.posts;
            localStorage.setItem("arzPosts", JSON.stringify(posts));
        } else {
            // If no posts from backend, create samples
            createSamplePosts();
        }
        return posts;
    } catch (error) {
        console.error('Error loading posts from backend:', error);
        // Fallback to local storage posts
        if (posts.length === 0) {
            createSamplePosts();
        }
        return posts;
    }
}

async function savePostToBackend(postData) {
    try {
        const data = await apiRequest('/posts', {
            method: 'POST',
            body: postData
        });
        return data;
    } catch (error) {
        console.error('Error saving post to backend:', error);
        // Fallback to local storage
        return { post: postData };
    }
}

async function updatePostInBackend(postId, updateData) {
    try {
        const data = await apiRequest(`/posts/${postId}`, {
            method: 'PUT',
            body: updateData
        });
        return data;
    } catch (error) {
        console.error('Error updating post in backend:', error);
        // Fallback to local storage
        return { success: true };
    }
}

// 👤 User Authentication Functions
async function registerUser(userData) {
    try {
        const data = await apiRequest('/register', {
            method: 'POST',
            body: userData
        });
        
        user = data.user;
        localStorage.setItem('arzUser', JSON.stringify(user));
        showNotification('Registration successful!', 'success');
        
        return data;
    } catch (error) {
        throw error;
    }
}

async function loginUser(credentials) {
    try {
        const data = await apiRequest('/login', {
            method: 'POST',
            body: credentials
        });
        
        user = data.user;
        localStorage.setItem('arzUser', JSON.stringify(user));
        showNotification('Login successful!', 'success');
        
        return data;
    } catch (error) {
        throw error;
    }
}

function logoutUser() {
    user = {
        username: "Guest", 
        profilePic: "https://via.placeholder.com/40x40/00bcd4/ffffff?text=G",
        email: "",
        password: "",
        following: [],
        bookmarks: []
    };
    localStorage.removeItem('arzUser');
    showNotification('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Update UI based on login status
function updateUIForLoginStatus() {
    const loginBtn = document.querySelector('a[href="login.html"]');
    const registerBtn = document.querySelector('a[href="register.html"]');
    const uploadBtn = document.querySelector('a[href="upload.html"]');
    const profileBtn = document.querySelector('a[href="profile.html"]');
    
    if (user && user.username !== "Guest") {
        // User is logged in
        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.onclick = logoutUser;
        }
        if (registerBtn) {
            registerBtn.textContent = user.username;
            registerBtn.href = 'profile.html';
        }
        if (uploadBtn) {
            uploadBtn.style.display = 'block';
        }
        if (profileBtn) {
            profileBtn.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.href = 'login.html';
            loginBtn.onclick = null;
        }
        if (registerBtn) {
            registerBtn.textContent = 'Register';
            registerBtn.href = 'register.html';
        }
        if (uploadBtn) {
            uploadBtn.style.display = 'none';
        }
        if (profileBtn) {
            profileBtn.style.display = 'none';
        }
    }
}

// 🌙 Theme Toggle Functionality
function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('arzTheme', currentTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    
    showNotification('Theme changed to ' + currentTheme + ' mode', 'success');
}

// 🔔 Notification System
function initializeNotifications() {
    updateNotificationBadge();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--card-bg);
                color: var(--text-color);
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border-left: 4px solid var(--accent-color);
                z-index: 10000;
                max-width: 300px;
                animation: slideInRight 0.3s ease;
            }
            .notification-success { border-left-color: #4CAF50; }
            .notification-error { border-left-color: #f44336; }
            .notification-warning { border-left-color: #ff9800; }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .notification-close {
                background: none;
                border: none;
                color: var(--text-color);
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Add to notifications array
    const notificationObj = {
        id: Date.now(),
        type,
        message,
        timestamp: new Date().toISOString(),
        read: false
    };
    notifications.unshift(notificationObj);
    localStorage.setItem('arzNotifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// 🔍 Search and Filter System
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPosts);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterPosts);
    }
}

function filterPosts() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!searchInput || !categoryFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchTerm || 
                            post.title.toLowerCase().includes(searchTerm) || 
                            post.content.toLowerCase().includes(searchTerm) ||
                            post.author.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || post.category === category;
        return matchesSearch && matchesCategory;
    });
    
    renderFilteredPosts(filteredPosts);
}

function renderFilteredPosts(filteredPosts) {
    const feed = document.querySelector(".feed");
    if (!feed) return;
    
    feed.innerHTML = "";
    
    if (filteredPosts.length === 0) {
        feed.innerHTML = '<div class="no-posts"><p>No posts found matching your criteria</p></div>';
        return;
    }
    
    filteredPosts.forEach((post) => {
        const postCard = createPostCard(post);
        feed.appendChild(postCard);
    });
    
    setupInteractions();
}

// 📜 Infinite Scroll
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            loadMorePosts();
        }
    });
}

function loadMorePosts() {
    const startIndex = currentPage * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const morePosts = posts.slice(startIndex, endIndex);
    
    if (morePosts.length > 0) {
        renderMorePosts(morePosts);
        currentPage++;
        showNotification('Loaded more posts', 'info');
    }
}

function renderMorePosts(morePosts) {
    const feed = document.querySelector(".feed");
    if (!feed) return;
    
    morePosts.forEach((post) => {
        const postCard = createPostCard(post);
        feed.appendChild(postCard);
    });
    
    setupInteractions();
}

// 🖼️ Lazy Loading Images
function setupLazyLoading() {
    const images = document.querySelectorAll('.post-image[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 🖋️ Post Creation Functions
async function addPost(title, content, category, image = "") {
    const newPost = {
        id: Date.now(),
        title,
        content,
        category,
        image,
        likes: 0,
        dislikes: 0,
        comments: [],
        author: user.username,
        authorPic: user.profilePic,
        timestamp: new Date().toISOString(),
        views: 0
    };
    
    // Try to save to backend first
    try {
        const savedPost = await savePostToBackend(newPost);
        posts.unshift(savedPost.post || newPost);
    } catch (error) {
        // Fallback to local storage
        posts.unshift(newPost);
    }
    
    localStorage.setItem("arzPosts", JSON.stringify(posts));
    renderPosts();
    
    showNotification('Post created successfully!', 'success');
    return newPost;
}

// 🏞️ Render Posts
function renderPosts() {
    const feed = document.querySelector(".feed");
    if (!feed) return;
    
    if (posts.length === 0) {
        createSamplePosts();
    }
    
    feed.innerHTML = "";
    
    const postsToShow = posts.slice(0, currentPage * postsPerPage);
    
    postsToShow.forEach((post) => {
        const postCard = createPostCard(post);
        feed.appendChild(postCard);
    });

    setupInteractions();
    setupLazyLoading();
}

function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.innerHTML = `
        <div class="post-header">
            <img src="${post.authorPic || user.profilePic}" alt="profile" class="profile-pic" 
                 onerror="this.src='https://via.placeholder.com/40x40/00bcd4/ffffff?text=U'"/>
            <div>
                <h3>${post.title}</h3>
                <p>By: ${post.author || user.username}</p>
                <p class="category">${post.category}</p>
            </div>
        </div>

        ${post.image ? `
            <img src="${post.image}" alt="${post.title}" class="post-image" 
                 data-src="${post.image}" 
                 onclick="openImageModal('${post.image}')"
                 onerror="this.style.display='none'"/>
        ` : ""}
        
        <p>${post.content}</p>

        <div class="post-stats">
            <span>👁️ ${post.views || 0} views</span>
            <span>⭐ ${post.likes || 0} likes</span>
        </div>

        <div class="post-actions">
            <button class="like-btn" data-id="${post.id}">
                👍 Like (${post.likes || 0})
            </button>
            <button class="dislike-btn" data-id="${post.id}">
                👎 Dislike (${post.dislikes || 0})
            </button>
            <button class="comment-toggle" data-id="${post.id}">
                💬 Comments (${post.comments ? post.comments.length : 0})
            </button>
            <button class="bookmark-btn" data-id="${post.id}">
                ${isBookmarked(post.id) ? '🔖' : '📑'} Bookmark
            </button>
        </div>

        <div class="comments-section" id="comments-${post.id}" style="display:none;">
            <div class="comments-list" id="comments-list-${post.id}"></div>
            <input type="text" placeholder="Write a comment..." class="comment-input" data-id="${post.id}" />
            <button class="add-comment" data-id="${post.id}">Post Comment</button>
        </div>
    `;
    return postCard;
}

// 📚 Bookmark System
function isBookmarked(postId) {
    return user.bookmarks && user.bookmarks.includes(postId);
}

function toggleBookmark(postId) {
    if (!user.bookmarks) user.bookmarks = [];
    
    const index = user.bookmarks.indexOf(postId);
    if (index > -1) {
        user.bookmarks.splice(index, 1);
        showNotification('Post removed from bookmarks', 'info');
    } else {
        user.bookmarks.push(postId);
        showNotification('Post bookmarked!', 'success');
    }
    
    localStorage.setItem('arzUser', JSON.stringify(user));
    updateBookmarkButton(postId);
}

function updateBookmarkButton(postId) {
    const bookmarkBtn = document.querySelector(`.bookmark-btn[data-id="${postId}"]`);
    if (bookmarkBtn) {
        bookmarkBtn.innerHTML = `${isBookmarked(postId) ? '🔖' : '📑'} Bookmark`;
    }
}

// 🖼️ Image Modal
function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <img src="${imageSrc}" alt="Full size">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add modal styles
    if (!document.querySelector('#modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .image-modal .modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            .image-modal img {
                max-width: 100%;
                max-height: 100%;
                border-radius: 10px;
            }
            .close-modal {
                position: absolute;
                top: -40px;
                right: 0;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 18px;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// 👤 User Profile System
function renderUserProfile() {
    const profileContainer = document.querySelector('.profile-page');
    if (!profileContainer) return;
    
    const userPosts = posts.filter(post => post.author === user.username);
    
    profileContainer.innerHTML = `
        <div class="profile-header">
            <img src="${user.profilePic}" alt="Profile" class="profile-large">
            <div class="profile-info">
                <h2>${user.username}</h2>
                <p>Member since ${new Date().getFullYear()}</p>
                <div class="stats">
                    <span>Posts: ${userPosts.length}</span>
                    <span>Likes: ${calculateTotalLikes(userPosts)}</span>
                    <span>Following: ${user.following ? user.following.length : 0}</span>
                </div>
            </div>
        </div>
        
        <div class="user-posts">
            <h3>My Creations</h3>
            <div class="posts-grid">
                ${userPosts.length > 0 ? 
                    userPosts.map(post => `
                        <div class="profile-post-card">
                            <h4>${post.title}</h4>
                            <p class="category">${post.category}</p>
                            <p>${post.content.substring(0, 100)}...</p>
                            <div class="post-stats">
                                <span>👍 ${post.likes}</span>
                                <span>💬 ${post.comments ? post.comments.length : 0}</span>
                            </div>
                        </div>
                    `).join('') : 
                    '<p class="no-posts">No posts yet. <a href="upload.html">Create your first post!</a></p>'
                }
            </div>
        </div>
    `;
}

function calculateTotalLikes(userPosts) {
    return userPosts.reduce((total, post) => total + (post.likes || 0), 0);
}

// 🧩 Setup All Interactions
function setupInteractions() {
    setupLikeButtons();
    setupDislikeButtons();
    setupCommentToggles();
    setupCommentButtons();
    setupBookmarkButtons();
}

function setupBookmarkButtons() {
    document.querySelectorAll(".bookmark-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const postId = parseInt(btn.getAttribute("data-id"));
            toggleBookmark(postId);
        });
    });
}

// 👍 Like Functionality
function setupLikeButtons() {
    document.querySelectorAll(".like-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const postId = parseInt(btn.getAttribute("data-id"));
            const post = posts.find((p) => p.id === postId);
            if (post) {
                post.likes = (post.likes || 0) + 1;
                
                // Try to update in backend
                try {
                    await updatePostInBackend(postId, { likes: post.likes });
                } catch (error) {
                    // Fallback to local storage
                    localStorage.setItem("arzPosts", JSON.stringify(posts));
                }
                
                btn.innerText = `👍 Like (${post.likes})`;
                showNotification('Liked the post!', 'success');
            }
        });
    });
}

// 👎 Dislike Functionality
function setupDislikeButtons() {
    document.querySelectorAll(".dislike-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const postId = parseInt(btn.getAttribute("data-id"));
            const post = posts.find((p) => p.id === postId);
            if (post) {
                post.dislikes = (post.dislikes || 0) + 1;
                
                // Try to update in backend
                try {
                    await updatePostInBackend(postId, { dislikes: post.dislikes });
                } catch (error) {
                    // Fallback to local storage
                    localStorage.setItem("arzPosts", JSON.stringify(posts));
                }
                
                btn.innerText = `👎 Dislike (${post.dislikes})`;
            }
        });
    });
}

// 💬 Comment System
function setupCommentToggles() {
    document.querySelectorAll(".comment-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const postId = btn.getAttribute("data-id");
            const section = document.getElementById(`comments-${postId}`);
            const isHidden = section.style.display === "none";
            section.style.display = isHidden ? "block" : "none";
            
            if (isHidden) {
                renderComments(parseInt(postId));
            }
        });
    });
}

function setupCommentButtons() {
    document.querySelectorAll(".add-comment").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const postId = parseInt(btn.getAttribute("data-id"));
            const input = btn.previousElementSibling;
            const text = input.value.trim();
            
            if (!text) {
                showNotification('Please write a comment!', 'error');
                return;
            }

            await addCommentToPost(postId, text);
            input.value = "";
        });
    });
    
    document.querySelectorAll(".comment-input").forEach(input => {
        input.addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                const postId = parseInt(input.getAttribute("data-id"));
                const text = input.value.trim();
                
                if (text) {
                    await addCommentToPost(postId, text);
                    input.value = "";
                }
            }
        });
    });
}

async function addCommentToPost(postId, text) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (!Array.isArray(post.comments)) {
        post.comments = [];
    }

    const newComment = {
        id: Date.now(),
        username: user.username,
        profilePic: user.profilePic,
        text,
        time: new Date().toISOString(),
        replies: []
    };

    post.comments.push(newComment);
    
    // Try to update in backend
    try {
        await updatePostInBackend(postId, { comments: post.comments });
    } catch (error) {
        // Fallback to local storage
        localStorage.setItem("arzPosts", JSON.stringify(posts));
    }
    
    renderComments(postId);
    
    const commentBtn = document.querySelector(`.comment-toggle[data-id="${postId}"]`);
    if (commentBtn) {
        commentBtn.innerText = `💬 Comments (${post.comments.length})`;
    }
    
    showNotification('Comment added!', 'success');
}

function renderComments(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    
    const section = document.querySelector(`#comments-list-${postId}`);
    if (!section) return;
    
    section.innerHTML = "";

    (post.comments || []).forEach((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment";
        commentDiv.innerHTML = `
            <div class="comment-header">
                <img src="${comment.profilePic}" alt="profile" class="comment-pic" 
                     onerror="this.src='https://via.placeholder.com/35x35/00bcd4/ffffff?text=U'"/>
                <strong>${comment.username}</strong>
            </div>
            <p>${comment.text}</p>
            <button class="reply-btn" data-cid="${comment.id}" data-pid="${postId}">↩️ Reply</button>
            
            <div class="replies">
                ${(comment.replies || []).map(reply => `
                    <div class="reply">
                        <div class="comment-header">
                            <img src="${reply.profilePic}" class="reply-pic" 
                                 onerror="this.src='https://via.placeholder.com/35x35/00bcd4/ffffff?text=U'"/>
                            <strong>${reply.username}</strong>
                        </div>
                        <p>${reply.text}</p>
                    </div>
                `).join('')}
            </div>
            
            <input type="text" placeholder="Write a reply..." class="reply-input" data-cid="${comment.id}" data-pid="${postId}" style="display:none;">
            <button class="send-reply" data-cid="${comment.id}" data-pid="${postId}" style="display:none;">Send Reply</button>
        `;
        section.appendChild(commentDiv);
    });

    setupReplyButtons();
}

function setupReplyButtons() {
    document.querySelectorAll(".reply-btn").forEach((btn) => {
        btn.onclick = () => {
            const cid = btn.getAttribute("data-cid");
            const pid = btn.getAttribute("data-pid");
            const input = btn.nextElementSibling.nextElementSibling;
            const sendBtn = input.nextElementSibling;
            
            input.style.display = "block";
            sendBtn.style.display = "block";
        };
    });

    document.querySelectorAll(".send-reply").forEach((btn) => {
        btn.onclick = async () => {
            const cid = parseInt(btn.getAttribute("data-cid"));
            const pid = parseInt(btn.getAttribute("data-pid"));
            const input = btn.previousElementSibling;
            const text = input.value.trim();
            
            if (!text) {
                showNotification('Please write a reply!', 'error');
                return;
            }

            const post = posts.find((p) => p.id === pid);
            if (!post) return;
            
            const comment = post.comments.find((c) => c.id === cid);
            if (!comment) return;
            
            if (!Array.isArray(comment.replies)) {
                comment.replies = [];
            }
            
            comment.replies.push({
                username: user.username,
                profilePic: user.profilePic,
                text
            });
            
            // Try to update in backend
            try {
                await updatePostInBackend(pid, { comments: post.comments });
            } catch (error) {
                // Fallback to local storage
                localStorage.setItem("arzPosts", JSON.stringify(posts));
            }
            
            renderComments(pid);
            
            input.value = "";
            input.style.display = "none";
            btn.style.display = "none";
            
            showNotification('Reply sent!', 'success');
        };
    });
}

// 📤 Upload Form Setup
function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const content = document.getElementById('description').value;
        const fileInput = document.getElementById('fileInput');
        
        if (!title || !category || !content) {
            showNotification('Please fill all fields!', 'error');
            return;
        }
        
        if (category === 'Select Category') {
            showNotification('Please select a category!', 'error');
            return;
        }
        
        if (fileInput.files.length === 0) {
            showNotification('Please select an image!', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            await addPost(title, content, category, e.target.result);
            form.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        };
        
        reader.onerror = function() {
            showNotification('Error reading file!', 'error');
        };
        
        reader.readAsDataURL(file);
    });
}

// 🔐 Login Form Setup
function setupLoginForm() {
    const form = document.querySelector('#login form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        
        if (!email || !password) {
            showNotification('Please fill all fields!', 'error');
            return;
        }
        
        try {
            await loginUser({ email, password });
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            // Login failed, try local storage fallback
            const storedUser = localStorage.getItem('arzUser');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.email === email && userData.password === password) {
                    user = userData;
                    localStorage.setItem('arzUser', JSON.stringify(user));
                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showNotification('Invalid email or password!', 'error');
                }
            } else {
                showNotification('No user found. Please register first.', 'error');
            }
        }
    });
}

// 📝 Register Form Setup
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const profilePicInput = document.getElementById('profilePic');
        
        if (!username || !email || !password) {
            showNotification('Please fill all fields!', 'error');
            return;
        }
        
        if (!profilePicInput.files[0]) {
            showNotification('Please upload a profile picture!', 'error');
            return;
        }

        const file = profilePicInput.files[0];
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            const userData = {
                username,
                email,
                password,
                profilePic: e.target.result,
                following: [],
                bookmarks: []
            };
            
            try {
                await registerUser(userData);
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } catch (error) {
                // Registration failed, fallback to local storage
                localStorage.setItem('arzUser', JSON.stringify(userData));
                user = userData;
                showNotification('Account created successfully (local storage)!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        };
        
        reader.onerror = function() {
            showNotification('Error reading profile picture!', 'error');
        };
        
        reader.readAsDataURL(file);
    });
}

// 📧 Contact Form Setup
function setupContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        form.reset();
    });
}

// 💰 Donation Functionality
function setupDonation() {
    const donateButtons = document.querySelectorAll('.donate-options button');
    const customAmountInput = document.querySelector('.donate-box input[type="text"]');
    const donateSubmit = document.querySelector('.donate-submit');
    
    let selectedAmount = 10;
    
    if (donateButtons) {
        donateButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                donateButtons.forEach(b => b.style.background = 'var(--accent-color)');
                this.style.background = 'var(--hover-color)';
                selectedAmount = parseInt(this.textContent.replace('$', ''));
                if (customAmountInput) {
                    customAmountInput.value = this.textContent;
                }
            });
        });
    }
    
    if (customAmountInput) {
        customAmountInput.addEventListener('input', function() {
            selectedAmount = parseInt(this.value) || 0;
        });
    }
    
    if (donateSubmit) {
        donateSubmit.addEventListener('click', function() {
            if (!selectedAmount || selectedAmount < 1) {
                showNotification('Please enter a valid amount!', 'error');
                return;
            }
            showNotification(`Thank you for your donation of $${selectedAmount}! Your support means the world to our creative community.`, 'success');
            if (customAmountInput) {
                customAmountInput.value = '';
            }
            donateButtons.forEach(b => b.style.background = 'var(--accent-color)');
        });
    }
}

// 📊 Sample Posts
function createSamplePosts() {
    const samplePosts = [
        {
            id: 1,
            title: "Welcome to Arz App!",
            content: "This is a sample post to showcase the app features. You can create posts, upload images, like, comment, and much more!",
            category: "General",
            image: "",
            likes: 15,
            dislikes: 2,
            comments: [
                {
                    id: 1,
                    username: "Admin",
                    profilePic: "https://via.placeholder.com/35x35/00bcd4/ffffff?text=A",
                    text: "Welcome everyone!",
                    time: new Date().toISOString(),
                    replies: []
                }
            ],
            author: "Admin",
            authorPic: "https://via.placeholder.com/40x40/00bcd4/ffffff?text=A",
            timestamp: new Date().toISOString(),
            views: 42
        },
        {
            id: 2,
            title: "Amazing Artwork",
            content: "Check out this beautiful digital painting I created!",
            category: "Art",
            image: "https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Art+Sample",
            likes: 28,
            dislikes: 1,
            comments: [],
            author: "Artist123",
            authorPic: "https://via.placeholder.com/40x40/ff6b6b/ffffff?text=AR",
            timestamp: new Date().toISOString(),
            views: 67
        }
    ];
    
    posts = [...samplePosts, ...posts];
    localStorage.setItem("arzPosts", JSON.stringify(posts));
}

// Export functions for global access
window.toggleTheme = toggleTheme;
window.openImageModal = openImageModal;
window.logoutUser = logoutUser;