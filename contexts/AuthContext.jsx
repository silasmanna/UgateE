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
const API_BASE_URL = "https://api-dev.allwecure.com";
const LOGIN_API_URL = `${API_BASE_URL}/auth/buyer/login`;
const REGISTER_API_URL = `${API_BASE_URL}/auth/buyer/register`;
const REFRESH_TOKEN_URL = `${API_BASE_URL}/auth/refresh`;
const GET_USER_URL = `${API_BASE_URL}/auth/buyer/me`;
const VERIFY_OTP_URL = `${API_BASE_URL}/auth/verify-otp`;
const RESEND_OTP_URL = `${API_BASE_URL}/auth/resend-otp`;
const PRODUCTS_URL = `${API_BASE_URL}/buyer/products`;
const CATEGORIES_URL = `${API_BASE_URL}/categories`;
const CHECKOUT_URL = `${API_BASE_URL}/buyer/orders`;
const ORDERS_URL = `${API_BASE_URL}/buyer/orders`;
const UPDATE_URL = `${API_BASE_URL}/buyers/account`;
const FORGOT_PASSWORD_URL = `${API_BASE_URL}/auth/forgot-password`;
const RESET_PASSWORD_URL = `${API_BASE_URL}/auth/reset-password`;
const CHANGE_PASSWORD_URL = `${API_BASE_URL}/auth/change-password`;

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
  const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes

  // Products and Categories State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [productsError, setProductsError] = useState(null);

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
        refreshToken.substring(0, 20) + "..."
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
          "Refresh successful, but new tokens were not received."
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
          console.log("📱 App coming to foreground - checking session");
          if (user) {
            const lastActiveTime = await getLastActiveTime();
            if (lastActiveTime) {
              const timeDiff = Date.now() - lastActiveTime;
              console.log(
                `⏱️ Time since last active: ${Math.round(
                  timeDiff / 1000
                )} seconds`
              );

              // If more than 15 minutes, access token expired - refresh it
              if (timeDiff > ACCESS_TOKEN_LIFETIME) {
                console.log("⚠️ Access token expired - attempting refresh");
                try {
                  await refreshAccessToken();
                } catch (error) {
                  console.log("❌ Token refresh failed - logging out");
                }
              } else {
                console.log("✅ Session still valid");
              }
            }
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Initial check for stored tokens
  useEffect(() => {
    async function loadTokens() {
      try {
        const storedAccessToken = await getToken("accessToken");
        const storedRefreshToken = await getToken("refreshToken");
        const storedUserData = await getUserData("userData");
        const lastActiveTime = await getLastActiveTime();

        if (storedAccessToken && storedRefreshToken && storedUserData) {
          if (lastActiveTime) {
            const timeDiff = Date.now() - lastActiveTime;

            if (timeDiff > ACCESS_TOKEN_LIFETIME) {
              console.log(
                "⚠️ Access token expired on startup - attempting refresh"
              );
              try {
                const newAccessToken = await refreshAccessToken();
                setUser({
                  accessToken: newAccessToken,
                  refreshToken: storedRefreshToken,
                  ...storedUserData,
                });
              } catch (error) {
                console.log("❌ Token refresh failed on startup");
                await clearAuthData();
                setUser(null);
              }
            } else {
              console.log("✅ Restoring valid session");
              setUser({
                accessToken: storedAccessToken,
                refreshToken: storedRefreshToken,
                ...storedUserData,
              });
            }
          } else {
            console.log("⚠️ No last active time - clearing session");
            await clearAuthData();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Failed to load stored tokens:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    }

    if (isNavigationReady && !hasCheckedAuth) {
      loadTokens();
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

  // Fetch Products (Requires auth)

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);

      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log("🛍️ Fetching products...");
      let response = await fetch(PRODUCTS_URL, {
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
        response = await fetch(PRODUCTS_URL, {
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
          image:
            product.image_url && product.image_url[0]
              ? product.image_url[0]
              : null,
          inStock: product.inStock,
          stockCount: product.stockCount,
          sold: product.sold || 0,
          brand: product.brand || "",
          sku: product.sku,
          accessLevel: product.accessLevel,
          meta: product.meta,
          category: categoryName,
          rating: 4.5,
          reviews: product.sold || 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };
      });

      setProducts(transformedProducts);
      console.log(`✅ Fetched ${transformedProducts.length} products`);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setProductsError(error.message);
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
        image:
          product.image_url && product.image_url[0]
            ? product.image_url[0]
            : null,
        inStock: product.inStock,
        stockCount: product.stockCount,
        sold: product.sold,
        brand: product.brand,
        sku: product.sku,
        accessLevel: product.accessLevel,
        meta: product.meta,
        expiryDate: product.expiry_date,
        category: product.categories[0].name,
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
          result
        );
        setOrders([]);
        return [];
      }

      // ⭐ CRITICAL MAPPING FIX FOR API RESPONSE ⭐
      const transformedOrders = apiOrders.map((order) => ({
        id: order.orderId,
        orderNumber: order.orderId,
        date: order.date,
        paymentStatus: order.paymentStatus,
        total: parseFloat(order.totalAmount),

        // Fields with default values / fallback
        status: order.paymentStatus,
        items: order.items || [],
        shippingAddress: order.shipping_address || null,
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
  ]); // ⭐ DEPENDENCY ARRAY IS KEY ⭐

  // --- CHECKOUT LOGIC ---
  const checkout = async (cartItems, shippingAddress) => {
    try {
      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      // Create required JSON structure
      const checkoutData = {
        cartItems: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress,
      };

      console.log("🛒 Processing checkout...");
      console.log("📦 Checkout data:", JSON.stringify(checkoutData, null, 2));

      let response = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(checkoutData),
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for checkout...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(CHECKOUT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            Authorization: `Bearer ${newAccessToken}`,
          },
          body: JSON.stringify(checkoutData),
        });
      }

      const result = await response.json();
      console.log("📦 Checkout response:", JSON.stringify(result, null, 2));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to process checkout");
      }

      console.log("✅ Checkout successful");
      return result;
    } catch (error) {
      console.error("❌ Checkout error:", error);
      throw error;
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

        // Throw error to show message in login screen
        throw new Error(
          "Email not verified. Please verify your email to continue."
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
        accessToken ? "✅ received" : "❌ missing"
      );
      console.log(
        "🔑 Refresh token:",
        refreshToken ? "✅ received" : "❌ missing"
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
        await saveLastActiveTime(Date.now());

        setUser({ accessToken, refreshToken, ...minimalUserData });

        // Fetch products and categories after login
        fetchCategories();
        fetchProducts();
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
      await saveLastActiveTime(Date.now());

      setUser({ accessToken, refreshToken, ...userData });
      console.log("✅ Sign in successful, navigating...");

      // Fetch products and categories after login
      fetchCategories();
      fetchProducts();
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
      const accessToken = await getToken("accessToken");

      if (!accessToken) {
        throw new Error("No access token available");
      }

      console.log("👤 Refreshing user data...");

      let response = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing for user data...");
        const newAccessToken = await refreshAccessToken();

        // Retry with new token
        response = await fetch(`${API_BASE_URL}/auth/buyer/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      }

      const profileData = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
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

      // Update state
      setUser((prev) => ({ ...prev, ...userData }));

      // Update stored data
      await saveUserData("userData", userData);

      console.log("✅ User data refreshed successfully");
      return userData;
    } catch (error) {
      console.error("❌ Error refreshing user data:", error);
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
          "Network request failed. Please check your internet connection and try again."
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
          "Verification successful, but tokens were not received."
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
        JSON.stringify(result, null, 2)
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
        JSON.stringify(result, null, 2)
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
        JSON.stringify(result, null, 2)
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
    fetchProductById,
    // Orders
    orders,
    isLoadingOrders,
    ordersError,
    fetchOrders,
    // Checkout
    checkout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
