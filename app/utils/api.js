// utils/api.js
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "https://api.allwecure.com";

// Helper functions
const getAccessToken = async () => {
  return await SecureStore.getItemAsync("accessToken");
};

const getRefreshToken = async () => {
  return await SecureStore.getItemAsync("refreshToken");
};

const saveTokens = async (accessToken, refreshToken) => {
  await SecureStore.setItemAsync("accessToken", accessToken);
  await SecureStore.setItemAsync("refreshToken", refreshToken);
};

const clearTokens = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("userData");
};

// Refresh access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    await saveTokens(data.access_token, data.refresh_token);

    return data.access_token;
  } catch (error) {
    await clearTokens();
    router.replace("/(tabs)/login");
    throw error;
  }
};

/**
 * Main API fetch wrapper with automatic token refresh
 *
 * @param {string} endpoint - API endpoint (e.g., '/buyer/products')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Parsed response data
 */
export const apiFetch = async (endpoint, options = {}) => {
  const accessToken = await getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401, try to refresh token and retry
  if (response.status === 401) {
    try {
      console.log("🔄 Access token expired, refreshing...");
      const newAccessToken = await refreshAccessToken();

      // Retry with new token
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      console.log("✅ Request retried with new token");
    } catch (refreshError) {
      console.error("❌ Token refresh failed:", refreshError);
      throw refreshError;
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
};

/**
 * API functions for your endpoints
 */

// Get current user info
export const getCurrentUser = async () => {
  return await apiFetch("/auth/buyer/me");
};

// Get all products
export const getProducts = async () => {
  return await apiFetch("/buyer/products");
};

// Get single product
export const getProduct = async (id) => {
  return await apiFetch(`/buyer/products/${id}`);
};

// Upload KYC documents
export const uploadKYC = async (formData) => {
  const accessToken = await getAccessToken();

  let response = await fetch(`${API_BASE_URL}/kyc/upload`, {
    method: "POST",
    headers: {
      // NOTE: Do not set 'Content-Type': 'multipart/form-data' here.
      // Fetch will automatically set the correct boundary and Content-Type
      // when the body is a FormData object.
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  // Handle token refresh for KYC upload
  if (response.status === 401) {
    try {
      console.log("🔄 Access token expired, refreshing for KYC upload...");
      const newAccessToken = await refreshAccessToken();
      response = await fetch(`${API_BASE_URL}/kyc/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
        body: formData,
      });
      console.log("✅ KYC upload retried with new token");
    } catch (refreshError) {
      console.error("❌ KYC token refresh failed:", refreshError);
      throw refreshError;
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "KYC upload failed");
  }

  return data;
};

// Upgrade account
export const upgradeAccount = async (upgradeData) => {
  return await apiFetch("/buyers/account/upgrade", {
    method: "POST",
    body: JSON.stringify(upgradeData),
  });
};

export default apiFetch;
