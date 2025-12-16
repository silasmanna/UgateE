import { router } from "expo-router";
import {
  ChevronRight,
  RefreshCw,
  Search,
  ShieldAlert,
  Star,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

  // Loading states
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isViewAllLoading, setIsViewAllLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [loadingProductName, setLoadingProductName] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);

  const { addToCart } = useCart();
  const {
    user,
    categories,
    products,
    isLoadingCategories,
    isLoadingProducts,
    categoriesError,
    productsError,
    fetchCategories,
    fetchProducts,
  } = useAuth();

  // Fetch data on mount if not already loaded
  useEffect(() => {
    if (categories.length === 0 && !isLoadingCategories && !categoriesError) {
      fetchCategories();
    }
    if (products.length === 0 && !isLoadingProducts && !productsError) {
      fetchProducts();
    }
  }, []);

  // Optional: A single log to confirm products have categories after loading
  useEffect(() => {
    if (products.length > 0 && products[0].category !== undefined) {
      console.log(
        "✅ Homepage received products with categories. Filter should work."
      );
    }
  }, [products]);

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 8);

  // Filter products by category first
  const categoryFilteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  // Then filter by search query
  const filteredProducts = searchQuery.trim()
    ? categoryFilteredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : categoryFilteredProducts;

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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

  // Check if user can access a product based on access level
  const canAccessProduct = (product) => {
    const userTier = getUserTier();
    const isVerified = isUserVerified();

    if (!userTier) return false;

    if (!product.accessLevel || product.accessLevel === "OTC") {
      return true;
    }

    if (product.accessLevel === "PATENT_ONLY") {
      if (userTier === "PATENT" || userTier === "PHARMACIST") {
        return isVerified;
      }
      return false;
    }

    if (product.accessLevel === "PRESCRIPTION_ONLY") {
      if (userTier === "PHARMACIST") {
        return isVerified;
      }
      return false;
    }

    return false;
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
    }, 300);
  };

  const handleViewAllCategories = () => {
    setIsViewAllLoading(true);
    setTimeout(() => {
      setShowAllCategories(!showAllCategories);
      setIsViewAllLoading(false);
    }, 300);
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
    }, 300);
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
        Alert.alert(
          "Added to Cart",
          `${product.name} has been added to your cart.`,
          [
            { text: "Continue Shopping", style: "cancel" },
            {
              text: "View Cart",
              onPress: () => router.push("/cart"),
            },
          ]
        );
      }, 500);
    },
    [addToCart, user]
  );

  const handleRetry = () => {
    if (categoriesError) fetchCategories();
    if (productsError) fetchProducts();
  };

  // Loading State
  if (isLoadingCategories || isLoadingProducts) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Loading medicines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (categoriesError || productsError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {categoriesError || productsError}
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for medicines..."
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Results Info */}
        {searchQuery.trim() && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              {totalProducts === 0
                ? `No results found for "${searchQuery}"`
                : `Showing ${
                    currentProducts.length
                  } of ${totalProducts} result${
                    totalProducts === 1 ? "" : "s"
                  } for "${searchQuery}"`}
            </Text>
          </View>
        )}

        {/* Categories Section */}
        {!searchQuery.trim() && categories.length > 0 && (
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

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.productsHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim()
                ? "Search Results"
                : selectedCategory === "All"
                ? "All Products"
                : selectedCategory}
            </Text>
            <Text style={styles.productsCount}>
              {totalProducts} {totalProducts === 1 ? "product" : "products"}
              {totalProducts > itemsPerPage && (
                <Text style={styles.paginationInfo}>
                  {" "}
                  ({currentPage} of {totalPages})
                </Text>
              )}
            </Text>
          </View>

          {totalProducts === 0 ? (
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
                {currentProducts.map((product) => {
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
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
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
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <TouchableOpacity
                            key={page}
                            style={[
                              styles.pageNumber,
                              currentPage === page && styles.pageNumberActive,
                            ]}
                            onPress={() => setCurrentPage(page)}
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
                      currentPage === totalPages &&
                        styles.paginationButtonDisabled,
                    ]}
                    onPress={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <Text
                      style={[
                        styles.paginationButtonText,
                        currentPage === totalPages &&
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
});

export default MedicineHomepage;
