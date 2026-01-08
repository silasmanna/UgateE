// --- ENVIRONMENT CONFIGURATION ---
// Replace with your actual API base URL
// For development, you might use: http://192.168.1.100:8000/v1
// For production, you might use: https://api.yourdomain.com/v1
export const API_BASE_URL = __DEV__
  ? "http://192.168.1.100:8000/" // Development URL
  : "https://api.allwecure.com/"; // Production URL

// Toggle for testing without API
export const USE_MOCK_DATA = false;

// --- API ENDPOINTS ---
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/buyer/login`,
  REGISTER: `${API_BASE_URL}/auth/buyer/register`,
  ME: `${API_BASE_URL}/auth/buyer/me`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,

  // Buyer Account
  UPGRADE: `${API_BASE_URL}/buyers/account/upgrade`,
  UPDATE_PROFILE: `${API_BASE_URL}/buyers/profile`,

  // KYC
  KYC_UPLOAD: `${API_BASE_URL}/kyc/upload`,
  KYC_STATUS: `${API_BASE_URL}/kyc/status`,

  // Products
  PRODUCTS: `${API_BASE_URL}/buyer/products`,
  PRODUCT_DETAIL: (id) => `${API_BASE_URL}/buyer/products/${id}`,
  PRODUCT_SEARCH: `${API_BASE_URL}/buyer/products/search`,

  // Orders
  ORDERS: `${API_BASE_URL}/buyer/orders`,
  ORDER_DETAIL: (id) => `${API_BASE_URL}/buyer/orders/${id}`,
  CREATE_ORDER: `${API_BASE_URL}/buyer/orders`,
  CANCEL_ORDER: (id) => `${API_BASE_URL}/buyer/orders/${id}/cancel`,

  // Cart
  CART: `${API_BASE_URL}/buyer/cart`,
  ADD_TO_CART: `${API_BASE_URL}/buyer/cart/add`,
  UPDATE_CART_ITEM: (id) => `${API_BASE_URL}/buyer/cart/items/${id}`,
  REMOVE_FROM_CART: (id) => `${API_BASE_URL}/buyer/cart/items/${id}`,
  CLEAR_CART: `${API_BASE_URL}/buyer/cart/clear`,

  // Addresses
  ADDRESSES: `${API_BASE_URL}/buyer/addresses`,
  ADD_ADDRESS: `${API_BASE_URL}/buyer/addresses`,
  UPDATE_ADDRESS: (id) => `${API_BASE_URL}/buyer/addresses/${id}`,
  DELETE_ADDRESS: (id) => `${API_BASE_URL}/buyer/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id) => `${API_BASE_URL}/buyer/addresses/${id}/default`,

  // Wishlist
  WISHLIST: `${API_BASE_URL}/buyer/wishlist`,
  ADD_TO_WISHLIST: `${API_BASE_URL}/buyer/wishlist/add`,
  REMOVE_FROM_WISHLIST: (id) => `${API_BASE_URL}/buyer/wishlist/${id}`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/buyer/notifications`,
  MARK_NOTIFICATION_READ: (id) =>
    `${API_BASE_URL}/buyer/notifications/${id}/read`,
  MARK_ALL_READ: `${API_BASE_URL}/buyer/notifications/read-all`,

  // Support
  CONTACT_US: `${API_BASE_URL}/support/contact`,
  FAQ: `${API_BASE_URL}/support/faq`,
};

// --- API REQUEST TIMEOUT ---
export const API_TIMEOUT = 30000; // 30 seconds

// --- SESSION CONFIGURATION ---
export const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
export const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes (refresh before expiry)
