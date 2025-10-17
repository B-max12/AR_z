// 🌐 App Configuration
const APP_CONFIG = {
    // Backend API URL
    API_BASE_URL: "https://kind-sloths-peel.loca.lt",
    
    // App Settings
    APP_NAME: "Arz Creative Platform",
    VERSION: "1.0.0",
    
    // Features
    ENABLE_BACKEND: true,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    POSTS_PER_PAGE: 6
};

// Make it globally available
window.APP_CONFIG = APP_CONFIG;