import {
  router,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

// --- API CONFIGURATION ---
const API_BASE_URL = "https://api.allwecure.com";
const LOGIN_API_URL = `${API_BASE_URL}/auth/buyer/login`;
const REGISTER_API_URL = `${API_BASE_URL}/auth/buyer/register`;
const REFRESH_TOKEN_URL = `${API_BASE_URL}/auth/refresh`;
const GET_USER_URL = `${API_BASE_URL}/auth/buyer/me`;
const VERIFY_OTP_URL = `${API_BASE_URL}/auth/verify-otp`;
const RESEND_OTP_URL = `${API_BASE_URL}/auth/resend-otp`;
const PRODUCTS_URL = `${API_BASE_URL}/buyer/products`;
const CATEGORIES_URL = `${API_BASE_URL}/categories`;
const BRANDS_URL = `${API_BASE_URL}/brands`;
const CHECKOUT_URL = `${API_BASE_URL}/buyer/orders`;
const ORDERS_URL = `${API_BASE_URL}/buyer/orders`;
const UPDATE_URL = `${API_BASE_URL}/buyers/account`;
const FORGOT_PASSWORD_URL = `${API_BASE_URL}/auth/forgot-password`;
const RESET_PASSWORD_URL = `${API_BASE_URL}/auth/reset-password`;
const CHANGE_PASSWORD_URL = `${API_BASE_URL}/auth/change-password`;
const CANCEL_ORDER_URL = `${API_BASE_URL}/buyer/orders/:id/cancel`;

// Category icon mapping
const CATEGORY_ICON_MAP = {
  antibiotics: "💊",
  analgesics: "💉",
  "anti-allergy": "🤧",
  "anti-fungal": "🦠",
  "anti-malaria": "🦟",
  "anti-ulcer": "💊",
  "anti-biotics": "💊",
  "anti-diarrheal-drugs": "💊",
  "anti-helmitic": "🪱",
  "anti-infective": "🦠",
  antiseptics: "🧴",
  "chronic-disease-drugs": "💊",
  corticosteroids: "💊",
};

// Category color mapping
const CATEGORY_COLOR_MAP = {
  antibiotics: "#E3F2FD",
  analgesics: "#F3E5F5",
  "anti-allergy": "#FFF9C4",
  "anti-fungal": "#E8F5E9",
  "anti-malaria": "#FCE4EC",
  "anti-ulcer": "#E0F7FA",
  "anti-biotics": "#F1F8E9",
  "anti-diarrheal-drugs": "#FFF3E0",
  "anti-helmitic": "#F3E5F5",
  "anti-infective": "#E8EAF6",
  antiseptics: "#FFEBEE",
  "chronic-disease-drugs": "#E1F5FE",
  corticosteroids: "#F9FBE7",
};

// SecureStore functions
const saveToken = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    console.log(`✅ Token saved: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to save token ${key}:`, error);
  }
};

const saveUserData = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
    console.log(`✅ User data saved: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to save user data ${key}:`, error);
  }
};

const saveLastActiveTime = async (timestamp) => {
  try {
    await SecureStore.setItemAsync("lastActiveTime", timestamp.toString());
    console.log(`✅ Last active time saved: ${timestamp}`);
  } catch (error) {
    console.error("❌ Failed to save last active time:", error);
  }
};

const getToken = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`❌ Failed to get token ${key}:`, error);
    return null;
  }
};

const getUserData = async (key) => {
  try {
    const data = await SecureStore.getItemAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`❌ Failed to get user data ${key}:`, error);
    return null;
  }
};

const getLastActiveTime = async () => {
  try {
    const time = await SecureStore.getItemAsync("lastActiveTime");
    return time ? parseInt(time) : null;
  } catch (error) {
    console.error("❌ Failed to get last active time:", error);
    return null;
  }
};

const deleteToken = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    console.log(`✅ Token deleted: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to delete token ${key}:`, error);
  }
};

const deleteUserData = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    console.log(`✅ User data deleted: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to delete user data ${key}:`, error);
  }
};

const deleteLastActiveTime = async () => {
  try {
    await SecureStore.deleteItemAsync("lastActiveTime");
    console.log("✅ Last active time deleted");
  } catch (error) {
    console.error("❌ Failed to delete last active time:", error);
  }
};

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function useProtectedRoute(user) {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isNavigationReady = navigationState?.key != null;

  useEffect(() => {
    // Navigation handled in layout
  }, [user, segments, isNavigationReady]);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const navigationState = useRootNavigationState();
  const appState = useRef(AppState.currentState);

  // Products and Categories State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [productsMeta, setProductsMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
  });

  // Brands state
  const [brands, setBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [brandsError, setBrandsError] = useState(null);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const isNavigationReady = navigationState?.key != null;

  useProtectedRoute(user);

  // Token refresh function
  const refreshAccessToken = async () => {
    try {
      const refreshToken = await getToken("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("🔄 Refreshing access token...");
      console.log(
        "🔑 Using refresh token:",
        refreshToken.substring(0, 20) + "...",
      );

      const response = await fetch(REFRESH_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });

      const result = await response.json();
      console.log("📦 Refresh response:", JSON.stringify(result, null, 2));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to refresh token");
      }

      // Extract new tokens from result
      const newAccessToken = result.access_token;
      const newRefreshToken = result.refresh_token;

      if (!newAccessToken || !newRefreshToken) {
        throw new Error(
          "Refresh successful, but new tokens were not received.",
        );
      }

      // Save new tokens
      await saveToken("accessToken", newAccessToken);
      await saveToken("refreshToken", newRefreshToken);
      await saveLastActiveTime(Date.now());

      console.log("✅ Token refreshed successfully");

      // Update user state with new tokens
      setUser((prev) => ({
        ...prev,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }));

      return newAccessToken;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      console.error("❌ Error details:", error.message);
      // Refresh failed - log out user
      await clearAuthData();
      setUser(null);
      router.replace("/(tabs)/login");
      throw error;
    }
  };

  // Clear all auth data
  const clearAuthData = async () => {
    await deleteToken("accessToken");
    await deleteToken("refreshToken");
    await deleteUserData("userData");
    await deleteLastActiveTime();
  };

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/active/) &&
          nextAppState.match(/inactive|background/)
        ) {
          console.log("📱 App going to background - saving timestamp");
          if (user) {
            await saveLastActiveTime(Date.now());
          }
        }

        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("📱 App coming to foreground - session persists");
          // Session persists indefinitely - no automatic expiration
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Initial check for stored tokens
  useEffect(() => {
    async function initializeApp() {
      try {
        console.log("🔄 Initializing auth state...");

        const storedAccessToken = await getToken("accessToken");
        const storedRefreshToken = await getToken("refreshToken");
        const storedUserData = await getUserData("userData");
        const lastActive = await getLastActiveTime();

        console.log(
          "📱 Stored access token:",
          storedAccessToken ? "✅ found" : "❌ not found",
        );
        console.log(
          "📱 Stored refresh token:",
          storedRefreshToken ? "✅ found" : "❌ not found",
        );
        console.log(
          "📱 Stored user data:",
          storedUserData ? "✅ found" : "❌ not found",
        );

        // If no tokens or user data, user is not logged in
        if (!storedAccessToken || !storedRefreshToken || !storedUserData) {
          console.log("❌ No valid session found");
          setUser(null);
          setIsLoading(false);
          setHasCheckedAuth(true);
          return;
        }

        // Check if session expired (30 days of inactivity)
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        if (lastActive && Date.now() - lastActive > THIRTY_DAYS) {
          console.log("⏰ Session expired (30 days inactive)");
          await clearAuthData();
          setUser(null);
          setIsLoading(false);
          setHasCheckedAuth(true);
          return;
        }

        // Verify token is still valid
        console.log("🔍 Verifying token validity...");
        const profileResponse = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedAccessToken}`,
          },
        });

        if (!profileResponse.ok) {
          console.log("❌ Token invalid or expired, attempting refresh...");

          try {
            // Try to refresh the token
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
              console.log("✅ Token refreshed successfully");
              // Token was refreshed, restore session with stored data
              await saveLastActiveTime(Date.now());
              setUser({
                accessToken: newAccessToken,
                refreshToken: storedRefreshToken,
                ...storedUserData,
              });

              // Fetch initial data
              fetchCategories();
              fetchProducts();
              fetchBrands();
              fetchOrders();
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (refreshError) {
            console.log("❌ Token refresh failed, clearing session");
            await clearAuthData();
            setUser(null);
            setIsLoading(false);
            setHasCheckedAuth(true);
            return;
          }
        } else {
          // Token is valid, restore session
          console.log("✅ Valid session found, restoring user state");
          await saveLastActiveTime(Date.now());
          setUser({
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
            ...storedUserData,
          });

          // Fetch initial data
          fetchCategories();
          fetchProducts();
          fetchBrands();
          fetchOrders();
        }

        setIsLoading(false);
        setHasCheckedAuth(true);
      } catch (error) {
        console.error("❌ Initialize Auth Error:", error.message);
        await clearAuthData();
        setUser(null);
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    }

    if (isNavigationReady && !hasCheckedAuth) {
      initializeApp();
    }
  }, [isNavigationReady, hasCheckedAuth]);

  // Fetch Categories (Requires auth)
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setCategoriesError(null);

      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log("📂 Fetching categories...");
      let response = await fetch(CATEGORIES_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for categories...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(CATEGORIES_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch categories");
      }

      // Transform API categories to app format
      const transformedCategories = result.data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: CATEGORY_ICON_MAP[cat.slug] || "💊",
        color: CATEGORY_COLOR_MAP[cat.slug] || "#E3F2FD",
      }));

      // Add "All" category at the beginning
      setCategories([
        {
          id: "all",
          name: "All",
          slug: "all",
          icon: "🏥",
          color: "#F5F5F5",
        },
        ...transformedCategories,
      ]);

      console.log(`✅ Fetched ${transformedCategories.length} categories`);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      setCategoriesError(error.message);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      setIsLoadingBrands(true);
      setBrandsError(null);

      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log("🏷️ Fetching brands...");
      let response = await fetch(BRANDS_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for brands...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(BRANDS_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch brands");
      }

      // Transform API brands to app format
      const transformedBrands = result.data.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        image: brand.image_url || null,
      }));

      setBrands(transformedBrands);
      console.log(`✅ Fetched ${transformedBrands.length} brands`);
    } catch (error) {
      console.error("❌ Error fetching brands:", error);
      setBrandsError(error.message);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Fetch Products (Requires auth)

  const fetchProducts = async (page = 1, limit = 20, searchQuery = "") => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);

      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      // Build URL with search parameter
      let url = `${PRODUCTS_URL}?page=${page}&limit=${limit}`;
      if (searchQuery && searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      console.log(
        `🛍️ Fetching products (page ${page}, limit ${limit}, search: "${searchQuery}")...`,
      );
      let response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for products...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch products");
      }

      // Transform API products to app format
      const transformedProducts = result.data.map((product) => {
        // Safely extract category name
        let categoryName = "Uncategorized";
        if (
          product.categories &&
          Array.isArray(product.categories) &&
          product.categories.length > 0
        ) {
          if (product.categories[0] && product.categories[0].name) {
            categoryName = product.categories[0].name;
          }
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          originalPrice: product.originalPrice
            ? parseFloat(product.originalPrice)
            : null,
          discount: product.discount ? parseFloat(product.discount) : 0,
          // 🔥 KEEP FIRST IMAGE FOR THUMBNAILS
          image:
            product.image_url && product.image_url[0]
              ? product.image_url[0]
              : null,
          // 🔥 ADD FULL IMAGE ARRAY FOR CAROUSEL
          image_url:
            product.image_url && Array.isArray(product.image_url)
              ? product.image_url
              : product.image_url && product.image_url[0]
                ? [product.image_url[0]]
                : [],
          inStock: product.inStock,
          stockCount: product.stockCount,
          sold: product.sold || 0,
          brand: product.brand || "",
          property: product.property,
          spec: product.spec,
          location: product.location,
          sku: product.sku,
          accessLevel: product.accessLevel,
          meta: product.meta,
          expiryDate: product.expiry_date
            ? new Date(product.expiry_date).toLocaleDateString("en-GB")
            : null,
          category: categoryName,
          rating: 4.5,
          reviews: product.sold || 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };
      });

      setProducts(transformedProducts);

      // Store pagination metadata
      setProductsMeta({
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        hasNext: result.meta.hasNext,
      });

      console.log(
        `✅ Fetched ${transformedProducts.length} products (Page ${result.meta.page} of ${result.meta.totalPages})`,
      );
      return { products: transformedProducts, meta: result.meta };
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setProductsError(error.message);
      return { products: [], meta: null };
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch single product by ID (Requires auth)

  const fetchProductById = async (productId) => {
    try {
      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log(`🛍️ Fetching product ${productId}...`);
      let response = await fetch(`${PRODUCTS_URL}/${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for product...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(`${PRODUCTS_URL}/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch product");
      }

      const product = result.data;
      console.log(product);

      // Safely extract category name
      let categoryName = "Uncategorized";
      if (
        product.categories &&
        Array.isArray(product.categories) &&
        product.categories.length > 0
      ) {
        if (product.categories[0] && product.categories[0].name) {
          categoryName = product.categories[0].name;
        }
      }

      // Transform to app format
      const transformedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: product.originalPrice
          ? parseFloat(product.originalPrice)
          : null,
        discount: product.discount ? parseFloat(product.discount) : 0,
        // 🔥 KEEP FIRST IMAGE FOR THUMBNAILS
        image:
          product.image_url && product.image_url[0]
            ? product.image_url[0]
            : null,
        // 🔥 ADD FULL IMAGE ARRAY FOR CAROUSEL
        image_url:
          product.image_url && Array.isArray(product.image_url)
            ? product.image_url
            : product.image_url && product.image_url[0]
              ? [product.image_url[0]]
              : [],
        inStock: product.inStock,
        stockCount: product.stockCount,
        sold: product.sold,
        brand: product.brand,
        property: product.property,
        location: product.location,
        spec: product.spec,
        sku: product.sku,
        accessLevel: product.accessLevel,
        meta: product.meta,
        expiryDate: product.expiry_date
          ? new Date(product.expiry_date).toLocaleDateString("en-GB")
          : null,
        category: categoryName,
        rating: 4.5,
        reviews: product.sold || 0,
      };

      console.log(`✅ Fetched product: ${transformedProduct.name}`);
      return transformedProduct;
    } catch (error) {
      console.error("❌ Error fetching product:", error);
      throw error;
    }
  };

  // --- FETCH ORDERS LOGIC ---
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      setOrdersError(null);

      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        console.log("No access token available, aborting fetch.");
        setOrdersError("User not authenticated.");
        return [];
      }

      console.log("📦 Fetching orders...");
      let response = await fetch(ORDERS_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Token refresh logic remains correct
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for orders...");
        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          throw new Error("Failed to refresh token.");
        }

        response = await fetch(ORDERS_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch orders");
      }

      const apiOrders = result.orders;

      if (!Array.isArray(apiOrders)) {
        console.warn(
          "API response structure unexpected: 'orders' is not an array.",
          result,
        );
        setOrders([]);
        return [];
      }

      // ⭐ CRITICAL MAPPING FIX FOR API RESPONSE ⭐
      const transformedOrders = apiOrders.map((order) => ({
        id: order.orderId,
        orderNumber: order.orderNumber,
        date: order.date,
        paymentStatus: order.paymentStatus,
        total: parseFloat(order.totalAmount),

        // Fields with default values / fallback
        status: order.paymentStatus,
        items: order.items || [],
        shippingAddress: order.shipping_address || null,
        buyerNote: order.buyerNote || null,
        deliveryStatus: order.delivery_status || null,
      }));

      setOrders(transformedOrders);
      console.log(`✅ Fetched ${transformedOrders.length} orders`);
      return transformedOrders;
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setOrdersError(error.message);
      // Optionally throw error: throw error;
    } finally {
      setIsLoadingOrders(false);
    }
  }, [
    getToken,
    refreshAccessToken,
    setOrders,
    setIsLoadingOrders,
    setOrdersError,
  ]);

  // CANCEL ORDERS LOGIC
  const cancelOrder = async (orderId) => {
    try {
      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log(`🚫 Cancelling order ${orderId}...`);

      // Replace :id with actual orderId
      const url = CANCEL_ORDER_URL.replace(":id", orderId);

      let response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for order cancellation...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel order");
      }

      console.log(`✅ Order ${orderId} cancelled successfully`);

      // Refresh orders list to update UI
      await fetchOrders();

      return {
        success: true,
        message: result.message || "Order cancelled successfully",
        data: result.data,
      };
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      throw error;
    }
  };

  // INITIALIZE AUTH STATE - Check for existing session on app startup
  const initializeAuth = async () => {
    try {
      console.log("🔄 Initializing auth state...");

      // Get stored tokens and user data
      const accessToken = await getToken("accessToken");
      const refreshToken = await getToken("refreshToken");
      const userData = await getUserData("userData");
      const lastActiveTime = await getLastActiveTime();

      console.log(
        "📱 Stored access token:",
        accessToken ? "✅ found" : "❌ not found",
      );
      console.log(
        "📱 Stored refresh token:",
        refreshToken ? "✅ found" : "❌ not found",
      );
      console.log(
        "📱 Stored user data:",
        userData ? "✅ found" : "❌ not found",
      );

      // If no tokens or user data, user is not logged in
      if (!accessToken || !refreshToken || !userData) {
        console.log("❌ No valid session found");
        setUser(null);
        setIsLoading(false);
        return false;
      }

      // Check if session is still valid (optional: add expiry check)
      // For example, auto-logout after 30 days of inactivity
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (lastActiveTime && Date.now() - lastActiveTime > THIRTY_DAYS) {
        console.log("⏰ Session expired (30 days inactive)");
        // Clear storage
        await saveToken("accessToken", null);
        await saveToken("refreshToken", null);
        await saveUserData("userData", null);
        await saveLastActiveTime(null);
        setUser(null);
        setIsLoading(false);
        return false;
      }

      // Verify token is still valid by making a request to profile endpoint
      console.log("🔍 Verifying token validity...");
      const profileResponse = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        console.log("❌ Token invalid or expired");

        // Try to refresh the token
        console.log("🔄 Attempting to refresh token...");
        const refreshSuccess = await refreshAccessToken(refreshToken);

        if (!refreshSuccess) {
          // Refresh failed, clear everything
          await saveToken("accessToken", null);
          await saveToken("refreshToken", null);
          await saveUserData("userData", null);
          await saveLastActiveTime(null);
          setUser(null);
          setIsLoading(false);
          return false;
        }

        // Refresh succeeded, continue with restored session
        console.log("✅ Token refreshed successfully");
      }

      // Token is valid, restore session
      console.log("✅ Valid session found, restoring user state");

      // Update last active time
      await saveLastActiveTime(Date.now());

      // Set user state
      setUser({ accessToken, refreshToken, ...userData });

      // Fetch initial data
      console.log("📦 Fetching initial data...");
      fetchCategories();
      fetchProducts();
      fetchBrands();
      fetchOrders();

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("❌ Initialize Auth Error:", error.message);

      // Clear everything on error
      await saveToken("accessToken", null);
      await saveToken("refreshToken", null);
      await saveUserData("userData", null);
      await saveLastActiveTime(null);

      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  // --- CHECKOUT LOGIC ---
  const checkout = async (cartItems, shippingAddress, buyerNote = "") => {
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 30000; // 30 seconds

    try {
      // Validate inputs
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      if (
        !shippingAddress ||
        typeof shippingAddress !== "string" ||
        !shippingAddress.trim()
      ) {
        throw new Error("Shipping address is required");
      }

      // Validate cart items structure
      const invalidItems = cartItems.filter(
        (item) => !item.id || !item.quantity || item.quantity <= 0,
      );

      if (invalidItems.length > 0) {
        throw new Error("Some cart items have invalid data");
      }

      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Create required JSON structure
      const checkoutData = {
        cartItems: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress.trim(),
      };

      // Only include buyerNote if it has actual content
      const trimmedNote = buyerNote?.trim();
      if (trimmedNote && trimmedNote.length > 0) {
        checkoutData.buyerNote = trimmedNote;
      }

      console.log("🛒 Processing checkout...");
      console.log("📦 Checkout data:", JSON.stringify(checkoutData, null, 2));

      // Attempt checkout with retry logic
      let lastError = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 Retry attempt ${attempt}/${MAX_RETRIES}...`);
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }

          const result = await performCheckoutRequest(
            checkoutData,
            accessToken,
            TIMEOUT_MS,
          );

          console.log("✅ Checkout successful");
          return result;
        } catch (error) {
          lastError = error;

          // Don't retry for certain errors
          if (
            error.message.includes("Authentication required") ||
            error.message.includes("Cart is empty") ||
            error.message.includes("Shipping address") ||
            error.message.includes("invalid data") ||
            error.status === 400 || // Bad request
            error.status === 403 || // Forbidden
            error.status === 404 // Not found
          ) {
            throw error; // Don't retry these
          }

          // If this was the last attempt, throw the error
          if (attempt === MAX_RETRIES) {
            throw error;
          }

          console.log(`⚠️ Attempt ${attempt + 1} failed, retrying...`);
        }
      }

      // This should never be reached, but just in case
      throw lastError || new Error("Checkout failed after multiple attempts");
    } catch (error) {
      console.error("❌ Checkout error:", error);

      // Provide user-friendly error messages
      if (
        error.message.includes("Network request failed") ||
        error.name === "TypeError"
      ) {
        throw new Error(
          "Network error. Please check your internet connection and try again.",
        );
      }

      if (error.name === "AbortError" || error.message.includes("timeout")) {
        throw new Error(
          "Request timed out. Please check your connection and try again.",
        );
      }

      // Re-throw the error with the original message
      throw error;
    }
  };

  // Helper function to perform the actual checkout request
  const performCheckoutRequest = async (
    checkoutData,
    accessToken,
    timeoutMs,
  ) => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(checkoutData),
        signal: controller.signal,
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for checkout...");

        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          const error = new Error(
            "Authentication required. Please log in again.",
          );
          error.status = 401;
          throw error;
        }

        // Retry with new token
        response = await fetch(CHECKOUT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
          body: JSON.stringify(checkoutData),
          signal: controller.signal,
        });
      }

      // Parse response
      let result;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        result = {
          success: false,
          message: text || "Invalid response from server",
        };
      }

      console.log("📦 Checkout response:", JSON.stringify(result, null, 2));

      // Check if response is ok
      if (!response.ok) {
        const errorMessage =
          result.message ||
          result.error ||
          `Checkout failed: ${response.status} ${response.statusText}`;

        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      // Validate response structure
      if (result.success === false) {
        const error = new Error(
          result.message || "Checkout was not successful",
        );
        error.status = response.status;
        throw error;
      }

      // If success field doesn't exist but response is ok, assume success
      if (result.success === undefined) {
        console.log(
          "⚠️ Response doesn't have 'success' field, assuming success based on HTTP status",
        );
        result.success = true;
      }

      return result;
    } finally {
      // Always clear the timeout
      clearTimeout(timeoutId);
    }
  };
  // Simplified UPDATE USER PROFILE DATA function
  const updateProfile = async (profileData) => {
    try {
      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log("👤 Updating profile...");

      let response = await fetch(UPDATE_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for profile update...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(UPDATE_URL, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
          body: JSON.stringify(profileData),
        });
      }

      if (response.status === 200) {
        console.log("Profile updated");
        return true;
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("❌ Profile update error:", error);
      throw error;
    }
  };
  // SIGN IN LOGIC
  const role = "BUYER";
  const signIn = async (email, password) => {
    try {
      console.log("🔐 Signing in to:", LOGIN_API_URL);
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("📦 Full response:", JSON.stringify(result, null, 2));

      // Check if email is not verified (403 error)
      if (
        response.status === 403 &&
        (result.message?.toLowerCase().includes("verify") ||
          result.error?.toLowerCase() === "forbidden")
      ) {
        console.log("📧 Email not verified - redirecting to OTP screen");

        await new Promise((resolve) => setTimeout(resolve, 100));

        router.replace({
          pathname: "/verify-otp",
          params: { email: email },
        });

        throw new Error(
          "Email not verified. Please verify your email to continue.",
        );
      }

      if (!response.ok || !result.success) {
        const errorMessage =
          result.message ||
          result.error ||
          "Login failed. Please check your credentials.";
        throw new Error(errorMessage);
      }

      // Extract tokens from result.data
      const accessToken = result.data?.access_token;
      const refreshToken = result.data?.refresh_token;

      console.log(
        "🔑 Access token:",
        accessToken ? "✅ received" : "❌ missing",
      );
      console.log(
        "🔑 Refresh token:",
        refreshToken ? "✅ received" : "❌ missing",
      );

      if (!accessToken || !refreshToken) {
        throw new Error("Login successful, but tokens were not received.");
      }

      console.log("✅ Tokens received, fetching profile...");

      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profileData = await profileResponse.json();
      console.log("👤 Profile data:", JSON.stringify(profileData, null, 2));

      if (!profileResponse.ok) {
        console.warn("⚠️ Profile fetch failed, using minimal data");
        const minimalUserData = {
          email: email,
          name: email.split("@")[0],
          business_name: email.split("@")[0],
          type: "regular",
          buyer_type: "regular",
          account_tier: "REGULAR",
          verified: true,
          verification_status: "VERIFIED",
        };

        await saveToken("accessToken", accessToken);
        await saveToken("refreshToken", refreshToken);
        await saveUserData("userData", minimalUserData);
        await saveLastActiveTime(Date.now()); // ✅ Save last active time

        setUser({ accessToken, refreshToken, ...minimalUserData });

        // Fetch products and categories after login
        fetchCategories();
        fetchProducts();
        fetchBrands();
        fetchOrders();

        router.replace("/(tabs)");
        return;
      }

      // Transform profile data
      const userData = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        business_name: profileData.name,
        type: (profileData.account_tier || "REGULAR").toLowerCase(),
        buyer_type: (profileData.account_tier || "REGULAR").toLowerCase(),
        account_tier: profileData.account_tier,
        phone: profileData.phone,
        address: profileData.address,
        verified: profileData.verification_status === "VERIFIED",
        verification_status: profileData.verification_status,
        isBlocked: profileData.isBlocked || false,
      };

      console.log("💾 Saving tokens and user data...");
      await saveToken("accessToken", accessToken);
      await saveToken("refreshToken", refreshToken);
      await saveUserData("userData", userData);
      await saveLastActiveTime(Date.now()); // ✅ Save last active time

      setUser({ accessToken, refreshToken, ...userData });
      console.log("✅ Sign in successful, navigating...");

      // Fetch products and categories after login
      fetchCategories();
      fetchProducts();
      fetchBrands();
      fetchOrders();

      await new Promise((resolve) => setTimeout(resolve, 100));

      router.replace("/(tabs)");
    } catch (error) {
      console.error("❌ Sign In Error:", error.message);
      setUser(null);
      throw error;
    }
  };

  // REFRESH USER DATA
  const refreshUserData = async () => {
    try {
      let accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log("👤 Refreshing user data...");
      console.log("🔑 Using token:", accessToken.substring(0, 20) + "...");

      let response = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("📊 Profile response status:", response.status);

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for user data...");

        try {
          const newAccessToken = await refreshAccessToken();

          if (!newAccessToken) {
            throw new Error("Failed to refresh token");
          }

          // Retry with new token
          response = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          console.log(
            "📊 Profile response status after refresh:",
            response.status,
          );
          accessToken = newAccessToken;
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          throw new Error("Session expired. Please log in again.");
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Profile fetch failed:", errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const profileData = await response.json();
      console.log(
        "👤 Profile data received:",
        JSON.stringify(profileData, null, 2),
      );

      // Check if the response has the expected structure
      if (!profileData || (!profileData.id && !profileData.email)) {
        console.error("❌ Invalid profile data structure:", profileData);
        throw new Error("Invalid profile data received");
      }

      // Transform profile data
      const userData = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        business_name: profileData.name,
        type: (profileData.account_tier || "REGULAR").toLowerCase(),
        buyer_type: (profileData.account_tier || "REGULAR").toLowerCase(),
        account_tier: profileData.account_tier,
        phone: profileData.phone,
        address: profileData.address,
        verified: profileData.verification_status === "VERIFIED",
        verification_status: profileData.verification_status,
        isBlocked: profileData.isBlocked || false,
      };

      // Update state with new data while keeping tokens
      setUser((prev) => ({
        ...prev,
        accessToken: accessToken, // Use the current valid token
        ...userData,
      }));

      // Update stored data
      await saveUserData("userData", userData);
      await saveLastActiveTime(Date.now());

      console.log("✅ User data refreshed successfully");
      return userData;
    } catch (error) {
      console.error("❌ Error refreshing user data:", error);
      console.error("❌ Error details:", error.message);

      // Don't throw - return cached data instead
      console.log("⚠️ Using cached user data");
      const cachedData = await getUserData("userData");
      if (cachedData) {
        return cachedData;
      }

      throw error;
    }
  };

  // REGISTER LOGIC
  const register = async (registrationData) => {
    try {
      console.log("📝 Starting registration process...");
      console.log("📍 API URL:", REGISTER_API_URL);

      const requestBody = {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        password: registrationData.password,
        address: registrationData.address,
        account_tier: registrationData.account_tier,
      };

      // Add optional fields if they exist
      if (registrationData.contact_person) {
        requestBody.contact_person = registrationData.contact_person;
      }
      if (registrationData.state) {
        requestBody.state = registrationData.state;
      }
      if (registrationData.lga) {
        requestBody.lga = registrationData.lga;
      }
      if (registrationData.referral_code) {
        requestBody.referral_code = registrationData.referral_code;
      }

      console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));

      let response;
      try {
        console.log("🌐 Making network request...");
        response = await fetch(REGISTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        console.log("✅ Network request completed");
        console.log("📊 Response status:", response.status);
        console.log("📊 Response ok:", response.ok);
      } catch (fetchError) {
        console.error("❌ Network request failed:", fetchError);
        console.error("❌ Error name:", fetchError.name);
        console.error("❌ Error message:", fetchError.message);
        throw new Error(
          "Network request failed. Please check your internet connection and try again.",
        );
      }

      let result;
      try {
        const responseText = await response.text();
        console.log("📝 Raw response:", responseText);

        if (!responseText) {
          throw new Error("Empty response from server");
        }

        result = JSON.parse(responseText);
        console.log("📦 Parsed response:", JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!response.ok || !result.success) {
        const errorMessage =
          result.message ||
          result.error ||
          result.errors?.[0]?.message ||
          `Registration failed with status ${response.status}`;
        console.error("❌ Registration failed:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("✅ Registration successful");

      // Return success with email so RegisterScreen can handle navigation
      return {
        success: true,
        email: registrationData.email,
      };
    } catch (error) {
      console.error("❌ Registration Error:", error.message);
      console.error("❌ Error stack:", error.stack);
      throw error;
    }
  };

  // --- VERIFY OTP LOGIC ---
  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    try {
      console.log("🔐 Verifying OTP...");
      const response = await fetch(VERIFY_OTP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, role }),
      });

      const result = await response.json();
      console.log("📦 Verify OTP response:", JSON.stringify(result, null, 2));

      if (!response.ok || !result.success) {
        const errorMessage =
          result.message || result.error || "OTP verification failed.";
        throw new Error(errorMessage);
      }

      const accessToken = result.data?.access_token || result.access_token;
      const refreshToken = result.data?.refresh_token || result.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error(
          "Verification successful, but tokens were not received.",
        );
      }

      console.log("✅ OTP verified, fetching profile...");

      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profileData = await profileResponse.json();

      let userData;
      if (!profileResponse.ok) {
        console.warn("⚠️ Profile fetch failed, using minimal data");
        userData = {
          email: email,
          name: email.split("@")[0],
          business_name: email.split("@")[0],
          type: "regular",
          buyer_type: "regular",
          account_tier: "REGULAR",
          verified: true,
          verification_status: "VERIFIED",
        };
      } else {
        userData = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          business_name: profileData.name,
          type: (profileData.account_tier || "REGULAR").toLowerCase(),
          buyer_type: (profileData.account_tier || "REGULAR").toLowerCase(),
          account_tier: profileData.account_tier,
          phone: profileData.phone,
          address: profileData.address,
          verified: true,
          verification_status: "VERIFIED",
          isBlocked: profileData.isBlocked || false,
        };
      }

      console.log("💾 Saving tokens and user data...");
      await saveToken("accessToken", accessToken);
      await saveToken("refreshToken", refreshToken);
      await saveUserData("userData", userData);
      await saveLastActiveTime(Date.now());

      setUser({ accessToken, refreshToken, ...userData });
      console.log("✅ OTP verification successful, navigating...");

      // Fetch products and categories after verification
      fetchCategories();
      fetchProducts();
      fetchOrders(); // Fetch orders after verification

      router.replace("/(tabs)");
    } catch (error) {
      console.error("❌ OTP Verification Error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- RESEND OTP LOGIC ---
  const resendOTP = async (email) => {
    try {
      console.log("📨 Resending OTP...");
      const response = await fetch(RESEND_OTP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      const result = await response.json();
      console.log("📦 Resend OTP response:", JSON.stringify(result, null, 2));

      if (!response.ok || !result.success) {
        const errorMessage =
          result.message || result.error || "Failed to resend OTP.";
        throw new Error(errorMessage);
      }

      console.log("✅ OTP resent successfully");
    } catch (error) {
      console.error("❌ Resend OTP Error:", error.message);
      throw error;
    }
  };

  // --- FORGOT PASSWORD LOGIC ---
  const forgotPassword = async (email) => {
    try {
      console.log("🔐 Requesting password reset...");
      const response = await fetch(FORGOT_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role: "BUYER",
        }),
      });

      const result = await response.json();
      console.log(
        "📦 Forgot password response:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok || !result.success) {
        const errorMessage =
          result.message || result.error || "Failed to send reset code.";
        throw new Error(errorMessage);
      }

      console.log("✅ Password reset code sent successfully");
      return result;
    } catch (error) {
      console.error("❌ Forgot Password Error:", error.message);
      throw error;
    }
  };

  // --- RESET PASSWORD LOGIC ---
  const resetPassword = async (email, otp, newPassword) => {
    setIsLoading(true);
    try {
      console.log("🔐 Resetting password...");
      const response = await fetch(RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role: "BUYER",
          otp,
          newPassword,
        }),
      });

      const result = await response.json();
      console.log(
        "📦 Reset password response:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok || !result.success) {
        const errorMessage =
          result.message || result.error || "Failed to reset password.";
        throw new Error(errorMessage);
      }

      console.log("✅ Password reset successful");
      return result;
    } catch (error) {
      console.error("❌ Reset Password Error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  // --- CHANGE PASSWORD LOGIC ---
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log("🔐 Changing password...");
      let response = await fetch(CHANGE_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for password change...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(CHANGE_PASSWORD_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        });
      }

      const result = await response.json();
      console.log(
        "📦 Change password response:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok || !result.success) {
        const errorMessage =
          result.message || result.error || "Failed to change password.";
        throw new Error(errorMessage);
      }

      console.log("✅ Password changed successfully");
      return result;
    } catch (error) {
      console.error("❌ Change Password Error:", error.message);
      throw error;
    }
  };

  // --- SIGN OUT LOGIC ---
  const signOut = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log("👋 Signing out...");
      await clearAuthData();
      setUser(null);

      // Clear products, categories, and orders
      setProducts([]);
      setCategories([]);
      setOrders([]);

      router.replace("/(tabs)/login");

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("❌ Sign Out Error:", error);
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    register,
    verifyOTP,
    resendOTP,
    refreshAccessToken,
    updateProfile,
    refreshUserData,
    forgotPassword,
    resetPassword,
    changePassword,
    // Products and Categories
    categories,
    products,
    isLoadingCategories,
    isLoadingProducts,
    categoriesError,
    productsError,
    fetchCategories,
    fetchProducts,
    productsMeta,
    fetchProductById,
    // Brands
    brands,
    isLoadingBrands,
    brandsError,
    fetchBrands,
    // Orders
    orders,
    isLoadingOrders,
    ordersError,
    fetchOrders,
    cancelOrder,
    // Checkout
    checkout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
