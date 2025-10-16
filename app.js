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
