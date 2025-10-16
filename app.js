// 🧠 Arz App – Complete JS Functionality with Advanced Features
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

// 🚀 Initial Render
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    // Set theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Check if user is logged in
    const savedUser = localStorage.getItem("arzUser");
    if (savedUser) {
        user = JSON.parse(savedUser);
    }
    
    // Initialize all systems
    initializeThemeToggle();
    
    // Render content based on page
    if (document.querySelector('.feed')) {
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
        setupImagePreview();
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
}

// ✅ FIXED: Profile Photo Preview Feature
function setupImagePreview() {
    const profilePicInput = document.getElementById('profilePic');
    if (!profilePicInput) return;
    
    const previewContainer = document.createElement('div');
    previewContainer.className = 'image-preview-container';
    previewContainer.innerHTML = `
        <div class="image-preview">
            <img id="profilePreview" src="" alt="Profile Preview" style="display: none;">
            <div class="placeholder-text">Your photo will appear here</div>
        </div>
    `;
    
    profilePicInput.parentNode.insertBefore(previewContainer, profilePicInput.nextSibling);
    
    const styles = `
        .image-preview-container {
            margin: 15px 0;
            text-align: center;
        }
        .image-preview {
            width: 150px;
            height: 150px;
            border: 3px dashed var(--accent-color);
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: var(--nav-bg);
            position: relative;
        }
        .image-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        .placeholder-text {
            color: #9ca3af;
            font-size: 0.9em;
        }
        .custom-file-btn {
            background: var(--accent-color);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            display: inline-block;
            margin: 10px 0;
            transition: 0.3s;
            border: none;
            font-size: 1em;
        }
        .custom-file-btn:hover {
            background: var(--hover-color);
            transform: translateY(-2px);
        }
        #profilePic {
            display: none;
        }
    `;
    
    if (!document.querySelector('#preview-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'preview-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    const customButton = document.createElement('button');
    customButton.type = 'button';
    customButton.className = 'custom-file-btn';
    customButton.innerHTML = '📷 Choose Profile Photo';
    customButton.onclick = () => profilePicInput.click();
    
    previewContainer.appendChild(customButton);
    
    profilePicInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewImg = document.getElementById('profilePreview');
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                document.querySelector('.placeholder-text').style.display = 'none';
                showNotification('Profile photo selected successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
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
function showNotification(message, type = 'info') {
    // Remove existing notifications first
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
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

// 📜 Posts Rendering
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
}

function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.innerHTML = `
        <div class="post-header">
            <img src="${post.authorPic || 'https://via.placeholder.com/40x40/00bcd4/ffffff?text=U'}" 
                 alt="profile" class="profile-pic" 
                 onerror="this.src='https://via.placeholder.com/40x40/00bcd4/ffffff?text=U'"/>
            <div>
                <h3>${post.title}</h3>
                <p>By: ${post.author}</p>
                <p class="category">${post.category}</p>
            </div>
        </div>

        ${post.image ? `
            <img src="${post.image}" alt="${post.title}" class="post-image" 
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

// 🧩 Setup All Interactions - ✅ FIXED DOUBLE EVENT LISTENERS
function setupInteractions() {
    // First remove all existing event listeners by replacing elements
    document.querySelectorAll('.like-btn, .dislike-btn, .comment-toggle, .add-comment, .bookmark-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    setupLikeButtons();
    setupDislikeButtons();
    setupCommentToggles();
    setupCommentButtons();
    setupBookmarkButtons();
}

// ✅ FIXED: Like Functionality - NO DOUBLE COUNTING
function setupLikeButtons() {
    document.querySelectorAll(".like-btn").forEach((btn) => {
        btn.addEventListener("click", function() {
            const postId = parseInt(this.getAttribute("data-id"));
            const post = posts.find((p) => p.id === postId);
            if (post) {
                post.likes = (post.likes || 0) + 1;
                localStorage.setItem("arzPosts", JSON.stringify(posts));
                this.innerHTML = `👍 Like (${post.likes})`;
                showNotification('Liked the post!', 'success');
                
                // Disable button temporarily to prevent double clicking
                this.disabled = true;
                setTimeout(() => {
                    this.disabled = false;
                }, 1000);
            }
        });
    });
}

// ✅ FIXED: Dislike Functionality - NO DOUBLE COUNTING
function setupDislikeButtons() {
    document.querySelectorAll(".dislike-btn").forEach((btn) => {
        btn.addEventListener("click", function() {
            const postId = parseInt(this.getAttribute("data-id"));
            const post = posts.find((p) => p.id === postId);
            if (post) {
                post.dislikes = (post.dislikes || 0) + 1;
                localStorage.setItem("arzPosts", JSON.stringify(posts));
                this.innerHTML = `👎 Dislike (${post.dislikes})`;
                
                // Disable button temporarily to prevent double clicking
                this.disabled = true;
                setTimeout(() => {
                    this.disabled = false;
                }, 1000);
            }
        });
    });
}

// ✅ FIXED: Comment System - PROPERLY WORKING
function setupCommentToggles() {
    document.querySelectorAll(".comment-toggle").forEach((btn) => {
        btn.addEventListener("click", function() {
            const postId = this.getAttribute("data-id");
            const section = document.getElementById(`comments-${postId}`);
            
            if (section.style.display === "none" || !section.style.display) {
                section.style.display = "block";
                renderComments(parseInt(postId));
                showNotification('💬 Comment section opened', 'info');
            } else {
                section.style.display = "none";
            }
        });
    });
}

function setupCommentButtons() {
    document.querySelectorAll(".add-comment").forEach((btn) => {
        btn.addEventListener("click", function() {
            const postId = parseInt(this.getAttribute("data-id"));
            const input = document.querySelector(`.comment-input[data-id="${postId}"]`);
            const text = input.value.trim();
            
            if (!text) {
                showNotification('❌ Please write a comment first!', 'error');
                input.focus();
                return;
            }

            addCommentToPost(postId, text);
            input.value = "";
        });
    });
    
    // Enter key support
    document.querySelectorAll(".comment-input").forEach(input => {
        input.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                const postId = parseInt(this.getAttribute("data-id"));
                const text = this.value.trim();
                
                if (text) {
                    addCommentToPost(postId, text);
                    this.value = "";
                }
            }
        });
    });
}

function addCommentToPost(postId, text) {
    const post = posts.find((p) => p.id === postId);
    if (!post) {
        showNotification('❌ Post not found!', 'error');
        return;
    }

    if (!Array.isArray(post.comments)) {
        post.comments = [];
    }

    const newComment = {
        id: Date.now(),
        username: user.username,
        profilePic: user.profilePic,
        text: text,
        time: new Date().toISOString(),
        replies: []
    };

    post.comments.push(newComment);
    localStorage.setItem("arzPosts", JSON.stringify(posts));
    renderComments(postId);
    
    // Update comment count
    const commentBtn = document.querySelector(`.comment-toggle[data-id="${postId}"]`);
    if (commentBtn) {
        commentBtn.innerHTML = `💬 Comments (${post.comments.length})`;
    }
    
    showNotification('💬 Comment added successfully!', 'success');
}

function renderComments(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    
    const section = document.getElementById(`comments-list-${postId}`);
    if (!section) return;
    
    section.innerHTML = "";

    if (!post.comments || post.comments.length === 0) {
        section.innerHTML = '<p style="color: #9ca3af; text-align: center;">No comments yet. Be the first to comment!</p>';
        return;
    }

    post.comments.forEach((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment";
        commentDiv.innerHTML = `
            <div class="comment-header">
                <img src="${comment.profilePic}" alt="profile" class="comment-pic" 
                     onerror="this.src='https://via.placeholder.com/35x35/00bcd4/ffffff?text=U'"/>
                <strong>${comment.username}</strong>
                <small>${new Date(comment.time).toLocaleDateString()}</small>
            </div>
            <p>${comment.text}</p>
        `;
        section.appendChild(commentDiv);
    });
}

// 📚 Bookmark System
function setupBookmarkButtons() {
    document.querySelectorAll(".bookmark-btn").forEach((btn) => {
        btn.addEventListener("click", function() {
            const postId = parseInt(this.getAttribute("data-id"));
            toggleBookmark(postId);
        });
    });
}

function isBookmarked(postId) {
    return user.bookmarks && user.bookmarks.includes(postId);
}

function toggleBookmark(postId) {
    if (!user.bookmarks) user.bookmarks = [];
    
    const index = user.bookmarks.indexOf(postId);
    if (index > -1) {
        user.bookmarks.splice(index, 1);
        showNotification('📑 Bookmark removed', 'info');
    } else {
        user.bookmarks.push(postId);
        showNotification('🔖 Post bookmarked!', 'success');
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

// 📝 Register Form Setup
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
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
        
        reader.onload = function(e) {
            const newUser = {
                username: username,
                email: email,
                password: password,
                profilePic: e.target.result,
                following: [],
                bookmarks: []
            };
            
            localStorage.setItem('arzUser', JSON.stringify(newUser));
            user = newUser;
            
            showNotification('Account created successfully! Welcome to Arz!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        };
        
        reader.onerror = function() {
            showNotification('Error reading profile picture!', 'error');
        };
        
        reader.readAsDataURL(file);
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

// 📤 Upload Form Setup
function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const content = document.getElementById('description').value;
        const fileInput = document.getElementById('fileInput');
        
        if (!title || !category || !content) {
            showNotification('Please fill all fields!', 'error');
            return;
        }
        
        if (fileInput.files.length === 0) {
            showNotification('Please select an image!', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const newPost = {
                id: Date.now(),
                title: title,
                content: content,
                category: category,
                image: e.target.result,
                likes: 0,
                dislikes: 0,
                comments: [],
                author: user.username,
                authorPic: user.profilePic,
                timestamp: new Date().toISOString(),
                views: 0
            };
            
            posts.unshift(newPost);
            localStorage.setItem("arzPosts", JSON.stringify(posts));
            
            showNotification('Post created successfully!', 'success');
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
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        
        if (!email || !password) {
            showNotification('Please fill all fields!', 'error');
            return;
        }
        
        const storedUser = localStorage.getItem('arzUser');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.email === email && userData.password === password) {
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

// 📊 Sample Posts
function createSamplePosts() {
    const samplePosts = [
        {
            id: 1,
            title: "Sunset Dreams",
            content: "The beauty of nature always inspires me to create beautiful artwork that captures the essence of peace and tranquility.",
            category: "Photography",
            image: "",
            likes: 12,
            dislikes: 1,
            comments: [
                {
                    id: 1,
                    username: "ArtLover",
                    profilePic: "https://via.placeholder.com/35x35/ff4081/ffffff?text=A",
                    text: "Amazing capture! The colors are breathtaking.",
                    time: new Date().toISOString(),
                    replies: []
                }
            ],
            author: "NatureLover",
            authorPic: "https://via.placeholder.com/40x40/ff4081/ffffff?text=N",
            timestamp: new Date().toISOString(),
            views: 45
        },
        {
            id: 2,
            title: "Whispers of Night",
            content: "The stars whisper secrets to the night, while the moon listens silently. In the darkness, creativity finds its light.",
            category: "Poetry",
            image: "",
            likes: 25,
            dislikes: 2,
            comments: [
                {
                    id: 1,
                    username: "Ali",
                    profilePic: "https://via.placeholder.com/35x35/00bcd4/ffffff?text=A",
                    text: "Beautiful lines! This really touched my heart.",
                    time: new Date().toISOString(),
                    replies: []
                }
            ],
            author: "WordWeaver",
            authorPic: "https://via.placeholder.com/40x40/00bcd4/ffffff?text=W",
            timestamp: new Date().toISOString(),
            views: 89
        }
    ];
    
    posts = samplePosts;
    localStorage.setItem("arzPosts", JSON.stringify(posts));
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
    
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}
// 👤 Profile Page Rendering - Add this to your existing app.js
function renderUserProfile() {
    const profileContainer = document.querySelector('.profile-page');
    if (!profileContainer) return;
    
    const currentUser = JSON.parse(localStorage.getItem('arzUser')) || {
        username: "Guest",
        profilePic: "https://via.placeholder.com/150/00bcd4/ffffff?text=User",
        email: "Not set"
    };
    
    // Get user's posts
    const allPosts = JSON.parse(localStorage.getItem('arzPosts')) || [];
    const userPosts = allPosts.filter(post => post.author === currentUser.username);
    
    profileContainer.innerHTML = `
        <div class="profile-header">
            <div class="profile-image-section">
                <img src="${currentUser.profilePic}" alt="Profile" class="profile-large" 
                     onerror="this.src='https://via.placeholder.com/150/00bcd4/ffffff?text=User'">
                <button class="edit-profile-btn" onclick="editProfile()">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
            </div>
            
            <div class="profile-info">
                <h2>${currentUser.username}</h2>
                <p class="user-email">${currentUser.email || "Email not set"}</p>
                <p class="user-bio">Creative soul sharing art, poetry, and dreams with the world. ✨</p>
                
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-number">${userPosts.length}</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${calculateTotalLikes(userPosts)}</span>
                        <span class="stat-label">Likes</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${calculateTotalComments(userPosts)}</span>
                        <span class="stat-label">Comments</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${currentUser.following ? currentUser.following.length : 0}</span>
                        <span class="stat-label">Following</span>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="action-btn primary" onclick="window.location.href='upload.html'">
                        <i class="fas fa-plus"></i> Create New Post
                    </button>
                    <button class="action-btn secondary" onclick="shareProfile()">
                        <i class="fas fa-share-alt"></i> Share Profile
                    </button>
                </div>
            </div>
        </div>
        
        <div class="profile-content">
            <div class="content-section">
                <h3><i class="fas fa-images"></i> My Creations</h3>
                
                ${userPosts.length > 0 ? `
                    <div class="posts-grid">
                        ${userPosts.map(post => `
                            <div class="profile-post-card" onclick="viewPost(${post.id})">
                                ${post.image ? `
                                    <img src="${post.image}" alt="${post.title}" class="post-thumbnail"
                                         onerror="this.style.display='none'">
                                ` : ''}
                                <div class="post-content">
                                    <h4>${post.title}</h4>
                                    <p class="post-category">${post.category}</p>
                                    <p class="post-excerpt">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                                    <div class="post-meta">
                                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                                        <span><i class="fas fa-comment"></i> ${post.comments ? post.comments.length : 0}</span>
                                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-camera"></i>
                        <h4>No Posts Yet</h4>
                        <p>Share your first creation with the world!</p>
                        <button class="create-first-post" onclick="window.location.href='upload.html'">
                            Create Your First Post
                        </button>
                    </div>
                `}
            </div>
            
            <div class="content-section">
                <h3><i class="fas fa-bookmark"></i> Bookmarked Posts</h3>
                <div class="bookmarks-section">
                    ${currentUser.bookmarks && currentUser.bookmarks.length > 0 ? `
                        <div class="bookmarks-list">
                            ${currentUser.bookmarks.map(bookmarkId => {
                                const bookmarkedPost = allPosts.find(p => p.id === bookmarkId);
                                return bookmarkedPost ? `
                                    <div class="bookmark-item" onclick="viewPost(${bookmarkedPost.id})">
                                        <div class="bookmark-info">
                                            <h5>${bookmarkedPost.title}</h5>
                                            <p>By ${bookmarkedPost.author}</p>
                                        </div>
                                        <i class="fas fa-bookmark bookmarked"></i>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-bookmark"></i>
                            <p>No bookmarks yet</p>
                            <small>Bookmark posts you love to find them later</small>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Helper functions for profile page
function calculateTotalLikes(userPosts) {
    return userPosts.reduce((total, post) => total + (post.likes || 0), 0);
}

function calculateTotalComments(userPosts) {
    return userPosts.reduce((total, post) => total + (post.comments ? post.comments.length : 0), 0);
}

function editProfile() {
    showNotification('🛠️ Profile editing feature coming soon!', 'info');
}

function shareProfile() {
    const currentUser = JSON.parse(localStorage.getItem('arzUser')) || { username: "Guest" };
    const profileUrl = `${window.location.origin}${window.location.pathname}?user=${currentUser.username}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Check out ${currentUser.username}'s profile on Arz`,
            text: `View ${currentUser.username}'s creative work on Arz`,
            url: profileUrl
        });
    } else {
        navigator.clipboard.writeText(profileUrl);
        showNotification('📋 Profile link copied to clipboard!', 'success');
    }
}

function viewPost(postId) {
    showNotification('🔍 Opening post...', 'info');
    // You can implement post detail view here
}
// 👤 Edit Profile Feature - Replace the existing editProfile function
function editProfile() {
    const currentUser = JSON.parse(localStorage.getItem('arzUser')) || {
        username: "Guest",
        profilePic: "https://via.placeholder.com/150/00bcd4/ffffff?text=User",
        email: "",
        bio: "Creative soul sharing art, poetry, and dreams with the world. ✨"
    };

    // Create edit profile modal
    const modal = document.createElement('div');
    modal.className = 'edit-profile-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit Profile</h3>
                <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            
            <div class="modal-body">
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="editUsername">Username</label>
                        <input type="text" id="editUsername" value="${currentUser.username}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" value="${currentUser.email || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editBio">Bio</label>
                        <textarea id="editBio" placeholder="Tell us about yourself..." rows="3">${currentUser.bio || 'Creative soul sharing art, poetry, and dreams with the world. ✨'}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="editProfilePic">Profile Picture</label>
                        <div class="file-upload-container">
                            <div class="current-photo">
                                <img src="${currentUser.profilePic}" id="currentProfilePic" 
                                     onerror="this.src='https://via.placeholder.com/150/00bcd4/ffffff?text=User'">
                                <span>Current Photo</span>
                            </div>
                            <div class="upload-actions">
                                <input type="file" id="editProfilePic" accept="image/*" style="display: none;">
                                <button type="button" class="upload-btn" onclick="document.getElementById('editProfilePic').click()">
                                    <i class="fas fa-camera"></i> Change Photo
                                </button>
                                <div class="image-preview" id="newPhotoPreview" style="display: none;">
                                    <img id="newProfilePreview">
                                    <span>New Photo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" onclick="this.closest('.edit-profile-modal').remove()">Cancel</button>
                        <button type="submit" class="save-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add modal styles
    if (!document.querySelector('#edit-profile-styles')) {
        const styles = document.createElement('style');
        styles.id = 'edit-profile-styles';
        styles.textContent = `
            .edit-profile-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .edit-profile-modal .modal-content {
                background: var(--card-bg);
                border-radius: 15px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 30px;
                border-bottom: 1px solid var(--nav-bg);
            }
            
            .modal-header h3 {
                color: var(--accent-color);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .close-modal {
                background: none;
                border: none;
                color: var(--text-color);
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-modal:hover {
                background: var(--nav-bg);
            }
            
            .modal-body {
                padding: 30px;
            }
            
            .form-group {
                margin-bottom: 25px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--text-color);
                font-weight: 600;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid var(--nav-bg);
                border-radius: 8px;
                background: var(--nav-bg);
                color: var(--text-color);
                font-size: 1em;
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--accent-color);
                background: var(--bg-color);
            }
            
            .file-upload-container {
                display: flex;
                gap: 20px;
                align-items: flex-start;
            }
            
            .current-photo,
            .image-preview {
                text-align: center;
                flex: 1;
            }
            
            .current-photo img,
            .image-preview img {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid var(--accent-color);
                margin-bottom: 8px;
            }
            
            .current-photo span,
            .image-preview span {
                display: block;
                color: #9ca3af;
                font-size: 0.9em;
            }
            
            .upload-actions {
                flex: 2;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .upload-btn {
                background: var(--accent-color);
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
            }
            
            .upload-btn:hover {
                background: var(--hover-color);
                transform: translateY(-2px);
            }
            
            .form-actions {
                display: flex;
                gap: 15px;
                margin-top: 30px;
            }
            
            .cancel-btn,
            .save-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1em;
                transition: all 0.3s ease;
            }
            
            .cancel-btn {
                background: var(--nav-bg);
                color: var(--text-color);
                border: 2px solid transparent;
            }
            
            .cancel-btn:hover {
                border-color: var(--accent-color);
            }
            
            .save-btn {
                background: var(--accent-color);
                color: white;
            }
            
            .save-btn:hover {
                background: var(--hover-color);
                transform: translateY(-2px);
            }
            
            @media (max-width: 768px) {
                .file-upload-container {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .upload-actions {
                    width: 100%;
                }
                
                .form-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Handle profile picture change
    document.getElementById('editProfilePic').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewImg = document.getElementById('newProfilePreview');
                const previewContainer = document.getElementById('newPhotoPreview');
                
                previewImg.src = e.target.result;
                previewContainer.style.display = 'block';
                
                showNotification('New profile photo selected!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('editUsername').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const bio = document.getElementById('editBio').value.trim();
        const profilePicInput = document.getElementById('editProfilePic');
        
        if (!username) {
            showNotification('Please enter a username!', 'error');
            return;
        }

        // Update user data
        const updatedUser = {
            ...currentUser,
            username: username,
            email: email,
            bio: bio
        };

        // Handle new profile picture
        if (profilePicInput.files[0]) {
            const file = profilePicInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                updatedUser.profilePic = e.target.result;
                saveProfileChanges(updatedUser, modal);
            };
            
            reader.onerror = function() {
                showNotification('Error reading profile picture!', 'error');
            };
            
            reader.readAsDataURL(file);
        } else {
            saveProfileChanges(updatedUser, modal);
        }
    });
}

function saveProfileChanges(updatedUser, modal) {
    // Update all posts by this user with new username and profile pic
    const allPosts = JSON.parse(localStorage.getItem('arzPosts')) || [];
    const updatedPosts = allPosts.map(post => {
        if (post.author === updatedUser.username || post.author === updatedUser.oldUsername) {
            return {
                ...post,
                author: updatedUser.username,
                authorPic: updatedUser.profilePic
            };
        }
        return post;
    });
    
    // Update comments by this user
    updatedPosts.forEach(post => {
        if (post.comments) {
            post.comments.forEach(comment => {
                if (comment.username === updatedUser.username || comment.username === updatedUser.oldUsername) {
                    comment.username = updatedUser.username;
                    comment.profilePic = updatedUser.profilePic;
                }
            });
        }
    });
    
    // Save updated data
    localStorage.setItem('arzUser', JSON.stringify(updatedUser));
    localStorage.setItem('arzPosts', JSON.stringify(updatedPosts));
    
    // Close modal and refresh profile
    modal.remove();
    showNotification('✅ Profile updated successfully!', 'success');
    
    // Refresh the profile page after a short delay
    setTimeout(() => {
        if (document.querySelector('.profile-page')) {
            renderUserProfile();
        }
    }, 1000);
}

// Also update the renderUserProfile function to include bio
function renderUserProfile() {
    const profileContainer = document.querySelector('.profile-page');
    if (!profileContainer) return;
    
    const currentUser = JSON.parse(localStorage.getItem('arzUser')) || {
        username: "Guest",
        profilePic: "https://via.placeholder.com/150/00bcd4/ffffff?text=User",
        email: "Not set",
        bio: "Creative soul sharing art, poetry, and dreams with the world. ✨"
    };
    
    // Get user's posts
    const allPosts = JSON.parse(localStorage.getItem('arzPosts')) || [];
    const userPosts = allPosts.filter(post => post.author === currentUser.username);
    
    profileContainer.innerHTML = `
        <div class="profile-header">
            <div class="profile-image-section">
                <img src="${currentUser.profilePic}" alt="Profile" class="profile-large" 
                     onerror="this.src='https://via.placeholder.com/150/00bcd4/ffffff?text=User'">
                <button class="edit-profile-btn" onclick="editProfile()">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
            </div>
            
            <div class="profile-info">
                <h2>${currentUser.username}</h2>
                <p class="user-email">${currentUser.email || "Email not set"}</p>
                <p class="user-bio">${currentUser.bio || "Creative soul sharing art, poetry, and dreams with the world. ✨"}</p>
                
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-number">${userPosts.length}</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${calculateTotalLikes(userPosts)}</span>
                        <span class="stat-label">Likes</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${calculateTotalComments(userPosts)}</span>
                        <span class="stat-label">Comments</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${currentUser.following ? currentUser.following.length : 0}</span>
                        <span class="stat-label">Following</span>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="action-btn primary" onclick="window.location.href='upload.html'">
                        <i class="fas fa-plus"></i> Create New Post
                    </button>
                    <button class="action-btn secondary" onclick="shareProfile()">
                        <i class="fas fa-share-alt"></i> Share Profile
                    </button>
                </div>
            </div>
        </div>
        
        <div class="profile-content">
            <div class="content-section">
                <h3><i class="fas fa-images"></i> My Creations</h3>
                
                ${userPosts.length > 0 ? `
                    <div class="posts-grid">
                        ${userPosts.map(post => `
                            <div class="profile-post-card" onclick="viewPost(${post.id})">
                                ${post.image ? `
                                    <img src="${post.image}" alt="${post.title}" class="post-thumbnail"
                                         onerror="this.style.display='none'">
                                ` : ''}
                                <div class="post-content">
                                    <h4>${post.title}</h4>
                                    <p class="post-category">${post.category}</p>
                                    <p class="post-excerpt">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                                    <div class="post-meta">
                                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                                        <span><i class="fas fa-comment"></i> ${post.comments ? post.comments.length : 0}</span>
                                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="fas fa-camera"></i>
                        <h4>No Posts Yet</h4>
                        <p>Share your first creation with the world!</p>
                        <button class="create-first-post" onclick="window.location.href='upload.html'">
                            Create Your First Post
                        </button>
                    </div>
                `}
            </div>
            
            <div class="content-section">
                <h3><i class="fas fa-bookmark"></i> Bookmarked Posts</h3>
                <div class="bookmarks-section">
                    ${currentUser.bookmarks && currentUser.bookmarks.length > 0 ? `
                        <div class="bookmarks-list">
                            ${currentUser.bookmarks.map(bookmarkId => {
                                const bookmarkedPost = allPosts.find(p => p.id === bookmarkId);
                                return bookmarkedPost ? `
                                    <div class="bookmark-item" onclick="viewPost(${bookmarkedPost.id})">
                                        <div class="bookmark-info">
                                            <h5>${bookmarkedPost.title}</h5>
                                            <p>By ${bookmarkedPost.author}</p>
                                        </div>
                                        <i class="fas fa-bookmark bookmarked"></i>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-bookmark"></i>
                            <p>No bookmarks yet</p>
                            <small>Bookmark posts you love to find them later</small>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}
