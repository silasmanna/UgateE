import { router, useFocusEffect, usePathname } from "expo-router";
import {
  ChevronRight,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Star,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import KYCVerificationModal from "../../components/KYCVerificationModal";
import LoadingModal from "../../components/loadingModal";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/cartContext";

const MedicineHomepage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedFilter, setSelectedFilter] = useState("Home");

  const filterTabs = [
    { id: "Home", label: "Home", icon: "🏠" },
    { id: "Sales", label: "Sales", icon: "💰" },
    { id: "Popular", label: "Popular", icon: "🔥" },
    { id: "Brand", label: "Brand", icon: "⭐" },
    { id: "New", label: "New", icon: "✨" },
  ];
  // Loading states
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isViewAllLoading, setIsViewAllLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [loadingProductName, setLoadingProductName] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Add ref for ScrollView
  const scrollViewRef = useRef(null);

  const { addToCart, isInCart, getItemQuantity } = useCart();
  const {
    user,
    categories,
    products,
    productsMeta,
    brands,
    isLoadingCategories,
    isLoadingProducts,
    isLoadingBrands,
    categoriesError,
    productsError,
    brandsError,
    fetchCategories,
    fetchProducts,
    fetchBrands,
  } = useAuth();

  // Handle back button press

  const pathname = usePathname();
  // Handle back button press - ONLY when on home screen
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        // Check if we're actually on the home tab
        const isOnHomeTab =
          pathname === "/(tabs)" ||
          pathname === "/(tabs)/" ||
          pathname === "/(tabs)/index";

        if (isOnHomeTab) {
          setShowExitModal(true);
          return true; // Prevent default back behavior and show exit modal
        }

        // If not on home tab, allow default back navigation
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      // Cleanup on unmount or when screen loses focus
      return () => backHandler.remove();
    }, [pathname])
  );

  const handleExitApp = () => {
    setShowExitModal(false);
    BackHandler.exitApp();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // Fetch data on mount if not already loaded
  useEffect(() => {
    if (categories.length === 0 && !isLoadingCategories && !categoriesError) {
      fetchCategories();
    }
    if (products.length === 0 && !isLoadingProducts && !productsError) {
      fetchProducts(1, itemsPerPage);
    }
    if (brands.length === 0 && !isLoadingBrands && !brandsError) {
      fetchBrands();
    }
  }, []);

  // Fetch products when page changes
  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage]);

  // FIXED: Separate filtering for main grid vs horizontal sections
  // This filters products for the MAIN GRID only
  const getFilteredProducts = useCallback(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply brand filter
    if (selectedBrand) {
      filtered = filtered.filter(
        (product) =>
          product.brand &&
          product.brand.toLowerCase() === selectedBrand.name.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
    }

    // Apply filter based on selected tab
    if (selectedFilter === "Sales") {
      filtered = filtered.filter((p) => p.discount && p.discount > 0);
      filtered = filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (selectedFilter === "Popular") {
      filtered = filtered.filter((p) => p.sold && p.sold > 0);
      filtered = filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (selectedFilter === "Brand") {
      if (!selectedBrand) {
        filtered = filtered.filter((p) => p.brand && p.brand.trim() !== "");
      }
      filtered = filtered.sort((a, b) => {
        if (a.brand < b.brand) return -1;
        if (a.brand > b.brand) return 1;
        return (b.sold || 0) - (a.sold || 0);
      });
    } else if (selectedFilter === "New") {
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((p) => {
        if (!p.createdAt) return true;
        return new Date(p.createdAt) >= thirtyDaysAgo;
      });
    }

    return filtered;
  }, [products, selectedCategory, selectedBrand, searchQuery, selectedFilter]);

  // NEW: Separate functions for horizontal sections
  const getSalesProducts = useCallback(() => {
    return products
      .filter((p) => p.discount && p.discount > 0)
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 10);
  }, [products]);

  const getPopularProducts = useCallback(() => {
    return products
      .filter((p) => p.sold && p.sold > 0)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);
  }, [products]);

  const filteredProducts = getFilteredProducts();
  const salesProducts = getSalesProducts();
  const popularProducts = getPopularProducts();
  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 8);

  // FIXED: Reset to page 1 when filters change and fetch new data
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // If already on page 1, just refetch
      fetchProducts(1, itemsPerPage);
    }
  }, [searchQuery, selectedCategory, selectedBrand, selectedFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (productsMeta.totalPages || 1)) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    }
  };

  const formatPrice = (price) => {
    return `₦${price.toLocaleString()}`;
  };

  // Get user account tier
  const getUserTier = () => {
    if (!user) return null;
    const tier = user.account_tier || user.type || user.buyer_type;
    return tier ? tier.toUpperCase() : null;
  };

  // Check if user is verified
  const isUserVerified = () => {
    if (!user) return false;
    return user.verification_status === "VERIFIED";
  };

  // Get restriction type for a product
  const getProductRestriction = (product) => {
    const userTier = getUserTier();
    const isVerified = isUserVerified();

    if (!product.accessLevel || product.accessLevel === "OTC") {
      return null;
    }

    if (!userTier) {
      return {
        type: "LOGIN_REQUIRED",
        message: "Login Required",
        buttonText: "Login",
      };
    }

    const isLicensedUser = userTier === "PATENT" || userTier === "PHARMACIST";
    if (isLicensedUser && !isVerified) {
      return {
        type: "VERIFICATION_REQUIRED",
        message: "Verification Required",
        buttonText: "Verify Account",
      };
    }

    if (product.accessLevel === "PATENT_ONLY") {
      if (userTier === "REGULAR") {
        return {
          type: "LICENSE_REQUIRED",
          message: "License Required",
          buttonText: "License Required",
        };
      }
      return null;
    }

    if (product.accessLevel === "PRESCRIPTION_ONLY") {
      if (userTier === "REGULAR") {
        return {
          type: "LICENSE_REQUIRED",
          message: "License Required",
          buttonText: "License Required",
        };
      }
      if (userTier === "PATENT") {
        return {
          type: "UPGRADE_REQUIRED",
          message: "Pharmacy License Required",
          buttonText: "Upgrade Required",
        };
      }
      return null;
    }

    return null;
  };

  const handleCategoryPress = (categoryName) => {
    setIsCategoryLoading(true);
    setTimeout(() => {
      setSelectedCategory(categoryName);
      setIsCategoryLoading(false);
    }, 100);
  };

  const handleViewAllCategories = () => {
    setIsViewAllLoading(true);
    setTimeout(() => {
      setShowAllCategories(!showAllCategories);
      setIsViewAllLoading(false);
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleProductPress = useCallback((product) => {
    setLoadingProductName(product.name);
    setIsProductLoading(true);
    setTimeout(() => {
      router.push(`/product/${product.id}`);
      setIsProductLoading(false);
      setLoadingProductName("");
    }, 100);
  }, []);

  const handleAddToCart = useCallback(
    (e, product) => {
      e.stopPropagation();
      const restriction = getProductRestriction(product);

      if (restriction?.type === "VERIFICATION_REQUIRED") {
        setShowKYCModal(true);
        return;
      }

      if (restriction?.type === "LOGIN_REQUIRED") {
        Alert.alert(
          "Login Required",
          "Please login to purchase this product.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () => router.push("/login"),
            },
          ]
        );
        return;
      }

      if (restriction?.type === "LICENSE_REQUIRED") {
        Alert.alert(
          "License Required",
          "This medication requires a pharmacy or patent medicine license to purchase. Please register as a licensed user to continue.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Upgrade",
              onPress: () => router.push("/upgrade"),
            },
          ]
        );
        return;
      }

      if (restriction?.type === "UPGRADE_REQUIRED") {
        Alert.alert(
          "Pharmacy License Required",
          "This prescription medication requires a full pharmacy license. Please upgrade your account or contact support.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Upgrade",
              onPress: () => router.push("/upgrade"),
            },
          ]
        );
        return;
      }

      if (!product.inStock) {
        Alert.alert("Out of Stock", "This product is currently out of stock.");
        return;
      }

      setAddingProductId(product.id);
      setTimeout(() => {
        addToCart(product, 1);
        setAddingProductId(null);
      }, 100);
    },
    [addToCart, user]
  );

  const handleBrandPress = (brand) => {
    setSelectedBrand(brand);
    setSelectedCategory("All");
    setSelectedFilter("Brand");
  };

  const handleClearBrand = () => {
    setSelectedBrand(null);
  };

  const handleRetry = () => {
    if (categoriesError) fetchCategories();
    if (productsError) fetchProducts(currentPage, itemsPerPage);
    if (brandsError) fetchBrands();
  };

  // Loading State
  if (isLoadingCategories || isLoadingProducts || isLoadingBrands) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (categoriesError || productsError || brandsError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {categoriesError || productsError || brandsError}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RefreshCw size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Exit App Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exitModalContent}>
            <Text style={styles.exitModalTitle}>Exit App?</Text>
            <Text style={styles.exitModalMessage}>
              Are you sure you want to exit the app?
            </Text>
            <View style={styles.exitModalButtons}>
              <TouchableOpacity
                style={styles.exitModalButtonCancel}
                onPress={handleCancelExit}
              >
                <Text style={styles.exitModalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exitModalButtonExit}
                onPress={handleExitApp}
              >
                <Text style={styles.exitModalButtonExitText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterTab,
                selectedFilter === tab.id && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(tab.id)}
            >
              <Text style={styles.filterTabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === tab.id && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {selectedFilter === tab.id && (
                <View style={styles.filterTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Brand Banner - Show when a brand is selected */}
        {selectedBrand && (
          <View style={styles.selectedBrandBanner}>
            <View style={styles.selectedBrandInfo}>
              <Text style={styles.selectedBrandLabel}>
                Showing products from:
              </Text>
              <Text style={styles.selectedBrandName}>{selectedBrand.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.clearBrandButton}
              onPress={handleClearBrand}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Brands Section - Only show when Brand filter is active and no specific brand selected */}
        {!searchQuery.trim() &&
          selectedFilter === "Brand" &&
          !selectedBrand &&
          brands.length > 0 && (
            <View style={styles.brandsSection}>
              <View style={styles.brandsHeader}>
                <Text style={styles.sectionTitle}>Shop by Brand</Text>
                {brands.length > 8 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => setShowAllBrands(!showAllBrands)}
                  >
                    <Text style={styles.viewAllText}>
                      {showAllBrands ? "Show less" : "View all brands"}
                    </Text>
                    <ChevronRight size={16} color="#50C878" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.brandsGrid}>
                {(showAllBrands ? brands : brands.slice(0, 8)).map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={[
                      styles.brandCard,
                      selectedBrand?.id === brand.id && styles.brandCardActive,
                    ]}
                    onPress={() => handleBrandPress(brand)}
                  >
                    <View style={styles.brandImageContainer}>
                      {brand.image ? (
                        <Image
                          source={{ uri: brand.image }}
                          style={styles.brandImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.brandImagePlaceholder}>
                          <Text style={styles.brandInitial}>
                            {brand.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.brandName,
                        selectedBrand?.id === brand.id &&
                          styles.brandNameActive,
                      ]}
                      numberOfLines={2}
                    >
                      {brand.name}
                    </Text>
                    {selectedBrand?.id === brand.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              {filteredProducts.length === 0
                ? `No results found for "${searchQuery}"`
                : `Showing ${filteredProducts.length} result${
                    filteredProducts.length === 1 ? "" : "s"
                  } for "${searchQuery}"`}
            </Text>
          </View>
        )}

        {/* Categories Section */}
        {!searchQuery.trim() &&
          selectedFilter === "Home" &&
          !selectedBrand &&
          categories.length > 0 && (
            <View style={styles.categoriesSection}>
              <View style={styles.categoriesHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                {categories.length > 8 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={handleViewAllCategories}
                  >
                    <Text style={styles.viewAllText}>
                      {showAllCategories ? "Show less" : "View all categories"}
                    </Text>
                    <ChevronRight size={16} color="#50C878" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.categoriesGrid}>
                {displayedCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.name &&
                        styles.categoryCardActive,
                    ]}
                    onPress={() => handleCategoryPress(category.name)}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: category.color },
                      ]}
                    >
                      <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.categoryName,
                        selectedCategory === category.name &&
                          styles.categoryNameActive,
                      ]}
                      numberOfLines={2}
                    >
                      {category.name}
                    </Text>
                    {selectedCategory === category.name && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        {/* Sales Products Section - Only show on Home tab */}
        {!searchQuery.trim() &&
          !selectedBrand &&
          selectedFilter === "Home" &&
          salesProducts.length > 0 && (
            <View style={styles.horizontalSection}>
              <View style={styles.horizontalSectionHeader}>
                <Text style={styles.sectionTitle}>Sales</Text>
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => setSelectedFilter("Sales")}
                >
                  <Text style={styles.viewMoreText}>View More</Text>
                  <ChevronRight size={16} color="#50C878" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {salesProducts.map((product) => {
                  const restriction = getProductRestriction(product);
                  const hasRestriction = restriction !== null;

                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.horizontalProductCard}
                      onPress={() => handleProductPress(product)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.horizontalProductImage}>
                        {product.image ? (
                          <Image
                            source={{ uri: product.image }}
                            style={styles.productImageActual}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.productImagePlaceholder}>💊</Text>
                        )}
                        {!product.inStock && (
                          <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>
                              Out of Stock
                            </Text>
                          </View>
                        )}
                        {product.accessLevel &&
                          product.accessLevel !== "OTC" && (
                            <View style={styles.licenseBadge}>
                              <ShieldAlert size={10} color="#fff" />
                              <Text style={styles.licenseBadgeText}>
                                {product.accessLevel === "PATENT_ONLY"
                                  ? "Rx"
                                  : "Rx+"}
                              </Text>
                            </View>
                          )}
                        {product.originalPrice && product.discount > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              {Math.round(product.discount)}%
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.horizontalProductInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.name}
                        </Text>

                        {product.rating && product.reviews > 0 && (
                          <View style={styles.ratingRow}>
                            <Star size={12} color="#FFB800" fill="#FFB800" />
                            <Text style={styles.ratingText}>
                              {product.rating}
                            </Text>
                            <Text style={styles.reviewsText}>
                              ({product.reviews})
                            </Text>
                          </View>
                        )}

                        <View style={styles.priceRow}>
                          <Text style={styles.price}>
                            {formatPrice(product.price)}
                          </Text>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <Text style={styles.originalPrice}>
                                {formatPrice(product.originalPrice)}
                              </Text>
                            )}
                        </View>

                        {isInCart(product.id) ? (
                          <View style={styles.quantityControlCompact}>
                            <TouchableOpacity
                              style={styles.quantityButtonCompact}
                              onPress={(e) => {
                                e.stopPropagation();
                                const currentQty = getItemQuantity(product.id);
                                if (currentQty > 1) {
                                  addToCart(product, -1);
                                }
                              }}
                            >
                              <Minus size={14} color="#50C878" />
                            </TouchableOpacity>
                            <Text style={styles.quantityTextCompact}>
                              {getItemQuantity(product.id)}
                            </Text>
                            <TouchableOpacity
                              style={styles.quantityButtonCompact}
                              onPress={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                            >
                              <Plus size={14} color="#50C878" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.addToCartButton,
                              hasRestriction && styles.restrictedButton,
                              restriction?.type === "VERIFICATION_REQUIRED" &&
                                styles.verificationButton,
                              restriction?.type === "UPGRADE_REQUIRED" &&
                                styles.upgradeButton,
                              addingProductId === product.id &&
                                styles.disabledButton,
                            ]}
                            onPress={(e) => handleAddToCart(e, product)}
                            disabled={addingProductId === product.id}
                          >
                            {hasRestriction ? (
                              <View style={styles.buttonContent}>
                                <ShieldAlert size={12} color="#fff" />
                                <Text style={styles.restrictedButtonText}>
                                  {restriction.buttonText}
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.addToCartButtonText}>
                                {addingProductId === product.id
                                  ? "Adding..."
                                  : "Add to Cart"}
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

        {/* Popular Products Section - Only show on Home tab */}
        {!searchQuery.trim() &&
          !selectedBrand &&
          selectedFilter === "Home" &&
          popularProducts.length > 0 && (
            <View style={styles.horizontalSection}>
              <View style={styles.horizontalSectionHeader}>
                <Text style={styles.sectionTitle}>Popular</Text>
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => setSelectedFilter("Popular")}
                >
                  <Text style={styles.viewMoreText}>View More</Text>
                  <ChevronRight size={16} color="#50C878" />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {popularProducts.map((product) => {
                  const restriction = getProductRestriction(product);
                  const hasRestriction = restriction !== null;

                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.horizontalProductCard}
                      onPress={() => handleProductPress(product)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.horizontalProductImage}>
                        {product.image ? (
                          <Image
                            source={{ uri: product.image }}
                            style={styles.productImageActual}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.productImagePlaceholder}>💊</Text>
                        )}
                        {!product.inStock && (
                          <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>
                              Out of Stock
                            </Text>
                          </View>
                        )}
                        {product.accessLevel &&
                          product.accessLevel !== "OTC" && (
                            <View style={styles.licenseBadge}>
                              <ShieldAlert size={10} color="#fff" />
                              <Text style={styles.licenseBadgeText}>
                                {product.accessLevel === "PATENT_ONLY"
                                  ? "Rx"
                                  : "Rx+"}
                              </Text>
                            </View>
                          )}
                        {product.originalPrice && product.discount > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              {Math.round(product.discount)}%
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.horizontalProductInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.name}
                        </Text>

                        {product.rating && product.reviews > 0 && (
                          <View style={styles.ratingRow}>
                            <Star size={12} color="#FFB800" fill="#FFB800" />
                            <Text style={styles.ratingText}>
                              {product.rating}
                            </Text>
                            <Text style={styles.reviewsText}>
                              ({product.reviews})
                            </Text>
                          </View>
                        )}

                        <View style={styles.priceRow}>
                          <Text style={styles.price}>
                            {formatPrice(product.price)}
                          </Text>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <Text style={styles.originalPrice}>
                                {formatPrice(product.originalPrice)}
                              </Text>
                            )}
                        </View>

                        {isInCart(product.id) ? (
                          <View style={styles.quantityControlCompact}>
                            <TouchableOpacity
                              style={styles.quantityButtonCompact}
                              onPress={(e) => {
                                e.stopPropagation();
                                const currentQty = getItemQuantity(product.id);
                                if (currentQty > 1) {
                                  addToCart(product, -1);
                                }
                              }}
                            >
                              <Minus size={14} color="#50C878" />
                            </TouchableOpacity>
                            <Text style={styles.quantityTextCompact}>
                              {getItemQuantity(product.id)}
                            </Text>
                            <TouchableOpacity
                              style={styles.quantityButtonCompact}
                              onPress={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                            >
                              <Plus size={14} color="#50C878" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.addToCartButton,
                              hasRestriction && styles.restrictedButton,
                              restriction?.type === "VERIFICATION_REQUIRED" &&
                                styles.verificationButton,
                              restriction?.type === "UPGRADE_REQUIRED" &&
                                styles.upgradeButton,
                              addingProductId === product.id &&
                                styles.disabledButton,
                            ]}
                            onPress={(e) => handleAddToCart(e, product)}
                            disabled={addingProductId === product.id}
                          >
                            {hasRestriction ? (
                              <View style={styles.buttonContent}>
                                <ShieldAlert size={12} color="#fff" />
                                <Text style={styles.restrictedButtonText}>
                                  {restriction.buttonText}
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.addToCartButtonText}>
                                {addingProductId === product.id
                                  ? "Adding..."
                                  : "Add to Cart"}
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim()
                ? "Search Results"
                : selectedBrand
                ? `${selectedBrand.name} Products`
                : selectedFilter === "Popular"
                ? "Popular"
                : selectedFilter === "Sales"
                ? "Sales"
                : selectedFilter === "Brand"
                ? "All Brands"
                : selectedCategory === "All"
                ? "All Products"
                : selectedCategory}
            </Text>
            <Text style={styles.productsCount}>
              {productsMeta.total}
              {productsMeta.total === 1 ? "product" : "products"}
              {productsMeta.totalPages > 1 && (
                <Text style={styles.paginationInfo}>
                  (Page {productsMeta.page} of {productsMeta.totalPages})
                </Text>
              )}
            </Text>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim()
                  ? `No products found matching "${searchQuery}"`
                  : "No products found in this category"}
              </Text>
              {searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={handleClearSearch}
                >
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.productsGrid}>
                {filteredProducts.map((product) => {
                  const restriction = getProductRestriction(product);
                  const hasRestriction = restriction !== null;

                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.productCard}
                      onPress={() => handleProductPress(product)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.productImage}>
                        {product.image ? (
                          <Image
                            source={{ uri: product.image }}
                            style={styles.productImageActual}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.productImagePlaceholder}>💊</Text>
                        )}
                        {!product.inStock && (
                          <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>
                              Out of Stock
                            </Text>
                          </View>
                        )}
                        {product.accessLevel &&
                          product.accessLevel !== "OTC" && (
                            <View style={styles.licenseBadge}>
                              <ShieldAlert size={10} color="#fff" />
                              <Text style={styles.licenseBadgeText}>
                                {product.accessLevel === "PATENT_ONLY"
                                  ? "Rx"
                                  : "Rx+"}
                              </Text>
                            </View>
                          )}
                        {product.originalPrice && product.discount > 0 && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                              {Math.round(product.discount)}%
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.name}
                        </Text>

                        {product.rating && product.reviews > 0 && (
                          <View style={styles.ratingRow}>
                            <Star size={12} color="#FFB800" fill="#FFB800" />
                            <Text style={styles.ratingText}>
                              {product.rating}
                            </Text>
                            <Text style={styles.reviewsText}>
                              ({product.reviews})
                            </Text>
                          </View>
                        )}

                        <View style={styles.priceRow}>
                          <Text style={styles.price}>
                            {formatPrice(product.price)}
                          </Text>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <Text style={styles.originalPrice}>
                                {formatPrice(product.originalPrice)}
                              </Text>
                            )}
                        </View>

                        {isInCart(product.id) ? (
                          <View style={styles.quantityControlCompact}>
                            <TouchableOpacity
                              style={styles.quantityButtonCompact}
                              onPress={(e) => {
                                e.stopPropagation();
                                const currentQty = getItemQuantity(product.id);
                                if (currentQty > 1) {
                                  addToCart(product, -1);
                                }
                              }}
                            >
                              <Minus size={14} color="#50C878" />
                            </TouchableOpacity>
                            <Text style={styles.quantityTextCompact}>
                              {getItemQuantity(product.id)}
                            </Text>
                            <TouchableOpacity
                              style={styles.quantityButtonCompact}
                              onPress={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                            >
                              <Plus size={14} color="#50C878" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.addToCartButton,
                              hasRestriction && styles.restrictedButton,
                              restriction?.type === "VERIFICATION_REQUIRED" &&
                                styles.verificationButton,
                              restriction?.type === "UPGRADE_REQUIRED" &&
                                styles.upgradeButton,
                              addingProductId === product.id &&
                                styles.disabledButton,
                            ]}
                            onPress={(e) => handleAddToCart(e, product)}
                            disabled={addingProductId === product.id}
                          >
                            {hasRestriction ? (
                              <View style={styles.buttonContent}>
                                <ShieldAlert size={12} color="#fff" />
                                <Text style={styles.restrictedButtonText}>
                                  {restriction.buttonText}
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.addToCartButtonText}>
                                {addingProductId === product.id
                                  ? "Adding..."
                                  : "Add to Cart"}
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Pagination controls */}
              {productsMeta.totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingProducts}
                  >
                    <Text
                      style={[
                        styles.paginationButtonText,
                        currentPage === 1 &&
                          styles.paginationButtonTextDisabled,
                      ]}
                    >
                      Previous
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.pageNumbers}>
                    {Array.from(
                      { length: productsMeta.totalPages },
                      (_, index) => index + 1
                    ).map((page) => {
                      if (
                        page === 1 ||
                        page === productsMeta.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <TouchableOpacity
                            key={page}
                            style={[
                              styles.pageNumber,
                              currentPage === page && styles.pageNumberActive,
                            ]}
                            onPress={() => handlePageChange(page)}
                            disabled={isLoadingProducts}
                          >
                            <Text
                              style={[
                                styles.pageNumberText,
                                currentPage === page &&
                                  styles.pageNumberTextActive,
                              ]}
                            >
                              {page}
                            </Text>
                          </TouchableOpacity>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <Text key={page} style={styles.pageDots}>
                            ...
                          </Text>
                        );
                      }
                      return null;
                    })}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      !productsMeta.hasNext && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => handlePageChange(currentPage + 1)}
                    disabled={!productsMeta.hasNext || isLoadingProducts}
                  >
                    <Text
                      style={[
                        styles.paginationButtonText,
                        !productsMeta.hasNext &&
                          styles.paginationButtonTextDisabled,
                      ]}
                    >
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Loading Modals */}
      <LoadingModal visible={isCategoryLoading} message="Loading category..." />
      <LoadingModal
        visible={isViewAllLoading}
        message={
          showAllCategories
            ? "Showing fewer categories..."
            : "Loading all categories..."
        }
      />
      <LoadingModal
        visible={isProductLoading}
        message={`Loading ${loadingProductName}...`}
      />
      <LoadingModal visible={!!addingProductId} message={`Adding to cart...`} />

      {/* KYC Verification Modal */}
      <KYCVerificationModal
        visible={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        userType={user?.type || user?.buyer_type || user?.account_tier}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#50C878",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  exitModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 320,
  },
  exitModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  exitModalMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  exitModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  exitModalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  exitModalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  exitModalButtonExit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  exitModalButtonExitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
  },
  filterTabsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 8,
  },
  filterTabsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    gap: 6,
    position: "relative",
  },
  filterTabActive: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#50C878",
  },
  filterTabIcon: {
    fontSize: 16,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  filterTabTextActive: {
    color: "#50C878",
    fontWeight: "700",
  },
  filterTabIndicator: {
    position: "absolute",
    bottom: -9,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#50C878",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchResultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F0F9FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchResultsText: {
    fontSize: 14,
    color: "#1E88E5",
  },
  categoriesSection: {
    paddingTop: 16,
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#50C878",
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  categoryCard: {
    width: "25%",
    padding: 8,
    alignItems: "center",
  },
  categoryCardActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  categoryNameActive: {
    color: "#50C878",
    fontWeight: "600",
  },
  selectedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#50C878",
    marginTop: 4,
  },
  productsSection: {
    paddingTop: 16,
  },
  productsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productsCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  paginationInfo: {
    color: "#999",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: "#50C878",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  productCard: {
    width: "50%",
    padding: 8,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  productImageActual: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    fontSize: 64,
    textAlign: "center",
    lineHeight: 160,
  },

  outOfStockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  licenseBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  licenseBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  discountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#FF5722",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  productInfo: {
    paddingTop: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  reviewsText: {
    fontSize: 12,
    color: "#999",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#50C878",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    backgroundColor: "#50C878",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  restrictedButton: {
    backgroundColor: "#FF6B6B",
  },
  verificationButton: {
    backgroundColor: "#FF9800",
  },
  upgradeButton: {
    backgroundColor: "#9C27B0",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  restrictedButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  horizontalSection: {
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  horizontalSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewMoreText: {
    fontSize: 14,
    color: "#50C878",
    fontWeight: "600",
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  horizontalProductCard: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  horizontalProductImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  horizontalProductInfo: {
    padding: 12,
  },
  quantityControlCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0fff4",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#50C878",
  },
  quantityButtonCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#50C878",
  },
  quantityTextCompact: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#50C878",
    minWidth: 30,
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#50C878",
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  paginationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  paginationButtonTextDisabled: {
    color: "#999",
  },
  pageNumbers: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  pageNumberActive: {
    backgroundColor: "#50C878",
  },
  pageNumberText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  pageNumberTextActive: {
    color: "#fff",
  },
  pageDots: {
    fontSize: 14,
    color: "#999",
  },
  selectedBrandBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#50C878",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBrandInfo: {
    flex: 1,
  },
  selectedBrandLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 2,
  },
  selectedBrandName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  clearBrandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  brandsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  brandCard: {
    width: "23%",
    marginHorizontal: "1%",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brandCardActive: {
    borderColor: "#50C878",
    backgroundColor: "#f0fdf4",
    shadowColor: "#50C878",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  brandImageContainer: {
    width: 50,
    height: 50,
    marginBottom: 8,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  brandImage: {
    width: "100%",
    height: "100%",
  },
  brandImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#50C878",
    justifyContent: "center",
    alignItems: "center",
  },
  brandInitial: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  brandName: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  brandNameActive: {
    color: "#50C878",
    fontWeight: "600",
  },
});

export default MedicineHomepage;
