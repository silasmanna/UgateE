import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ShieldAlert,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import KYCVerificationModal from "../../components/KYCVerificationModal";
import LoadingModal from "../../components/loadingModal";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/cartContext";

const ProductsPage = ({ route }) => {
  const { category } = useLocalSearchParams();
  const [initialCategory, setinitialCategory] = useState(category || "All");

  const { addToCart } = useCart();
  const {
    user,
    products,
    categories: authCategories, // Get categories from auth context
    isLoadingProducts,
    productsError,
    fetchProducts,
    fetchCategories,
  } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductName, setLoadingProductName] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);

  useEffect(() => {
    setinitialCategory(category || "All");
  }, [category]);

  // Fetch products and categories on mount if not already loaded
  useEffect(() => {
    if (products.length === 0 && !isLoadingProducts && !productsError) {
      fetchProducts();
    }
    if (authCategories.length === 0) {
      fetchCategories();
    }
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  // FIX: Use categories from AuthContext instead of undefined medicineCategories
  const categories = authCategories.map((cat) => cat.name);

  const priceRanges = [
    { id: "1", label: "All", min: 0, max: 999999 },
    { id: "2", label: "Under ₦1,000", min: 0, max: 1000 },
    { id: "3", label: "₦1,000 - ₦2,500", min: 1000, max: 2500 },
    { id: "4", label: "₦2,500 - ₦5,000", min: 2500, max: 5000 },
    { id: "5", label: "₦5,000 - ₦10,000", min: 5000, max: 10000 },
    { id: "6", label: "Above ₦10,000", min: 10000, max: 999999 },
  ];

  // Use products from AuthContext
  const allProducts = products;

  // Filter products by category first
  const categoryFilteredProducts =
    selectedCategory === "All"
      ? allProducts
      : allProducts.filter((product) => product.category === selectedCategory);

  // Then filter by search query
  const filteredProducts = categoryFilteredProducts.filter((product) => {
    const selectedRange = priceRanges.find(
      (range) => range.label === selectedPriceRange
    );
    const priceMatch =
      !selectedRange ||
      selectedPriceRange === "All" ||
      (product.price >= selectedRange.min &&
        product.price <= selectedRange.max);

    return priceMatch;
  });

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
  }, [selectedCategory, selectedPriceRange]);

  const formatPrice = (price) => {
    return `₦${price.toLocaleString()}`;
  };

  // Get user account tier
  const getUserTier = () => {
    if (!user) return null;
    // Check both 'type' and 'account_tier' fields
    const tier = user.account_tier || user.type || user.buyer_type;
    return tier ? String(tier).toUpperCase() : null; // Ensure tier is a string
  };

  // Check if user is verified
  const isUserVerified = () => {
    if (!user) return false;
    return user.verified === true || user.verification_status === "VERIFIED";
  };

  // Check if user can access a product based on access level
  const canAccessProduct = (product) => {
    const userTier = getUserTier();
    const isVerified = isUserVerified();

    // No user logged in
    if (!userTier) return false;

    // If product has no access level or is OTC, everyone can access
    if (!product.accessLevel || product.accessLevel === "OTC") {
      return true;
    }

    // PATENT_ONLY products
    if (product.accessLevel === "PATENT_ONLY") {
      // Only PATENT and PHARMACY users can access
      if (userTier === "PATENT" || userTier === "PHARMACIST") {
        return isVerified; // Must be verified
      }
      return false;
    }

    // PRESCRIPTION_ONLY products
    if (product.accessLevel === "PRESCRIPTION_ONLY") {
      // Only PHARMACY users can access
      if (userTier === "PHARMACIST") {
        return isVerified; // Must be verified
      }
      return false;
    }

    return false;
  };

  // Get restriction type for a product
  const getProductRestriction = (product) => {
    const userTier = getUserTier();
    const isVerified = isUserVerified();

    // No access level means no restriction
    if (!product.accessLevel || product.accessLevel === "OTC") {
      return null;
    }

    // User not logged in
    if (!userTier) {
      return {
        type: "LOGIN_REQUIRED",
        message: "Login Required",
        buttonText: "Login",
      };
    }

    // Check verification status for licensed users
    const isLicensedUser = userTier === "PATENT" || userTier === "PHARMACIST";
    if (isLicensedUser && !isVerified) {
      return {
        type: "VERIFICATION_REQUIRED",
        message: "Verification Required",
        buttonText: "Verify Account",
      };
    }

    // PATENT_ONLY products
    if (product.accessLevel === "PATENT_ONLY") {
      if (userTier === "REGULAR") {
        return {
          type: "LICENSE_REQUIRED",
          message: "License Required",
          buttonText: "License Required",
        };
      }
      // PATENT and PHARMACY users with verification can access
      return null;
    }

    // PRESCRIPTION_ONLY products
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
      // PHARMACY users with verification can access
      return null;
    }

    return null;
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handlePriceSelect = (priceRange) => {
    setSelectedPriceRange(priceRange);
    setShowPriceModal(false);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedPriceRange("All");
  };

  const handleProductPress = useCallback((product) => {
    setLoadingProductName(String(product.name || "Product")); // Ensure name is a string
    setIsLoading(true);

    setTimeout(() => {
      router.push(`/product/${product.id}`);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProductName("");
      }, 300);
    }, 300);
  }, []);

  const handleAddToCart = useCallback(
    (e, product) => {
      e.stopPropagation();
      const restriction = getProductRestriction(product);

      // Handle verification requirement
      if (restriction?.type === "VERIFICATION_REQUIRED") {
        setShowKYCModal(true);
        return;
      }

      // Handle login requirement
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

      // Handle license requirement (for REGULAR users)
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

      // Handle upgrade requirement (for PATENT users trying to buy PRESCRIPTION_ONLY)
      if (restriction?.type === "UPGRADE_REQUIRED") {
        Alert.alert(
          "Pharmacy License Required",
          "This prescription medication requires a full pharmacy license. Please upgrade your account or contact support.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Upgrade",
              onPress: () => router.push("/register"),
            },
          ]
        );
        return;
      }

      // Check stock
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
          `${String(product.name || "Item")} has been added to your cart.`,
          [
            { text: "Continue Shopping", style: "cancel" },
            {
              text: "View Cart",
              onPress: () => router.push("/cart"),
            },
          ]
        );
      }, 1000);
    },
    [addToCart, user]
  );

  const handleRefresh = () => {
    fetchProducts();
  };

  // Show loading state while fetching products
  if (isLoadingProducts && products.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#54ade5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Products</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if products failed to load
  if (productsError && products.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#54ade5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Products</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load products</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#54ade5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {String(selectedCategory)}
          </Text>
          <ChevronDown size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowPriceModal(true)}
        >
          <SlidersHorizontal size={18} color="#666" />
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {String(
              selectedPriceRange === "All" ? "Price" : selectedPriceRange
            )}
          </Text>
          <ChevronDown size={18} color="#666" />
        </TouchableOpacity>

        {(selectedCategory !== "All" || selectedPriceRange !== "All") && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {totalProducts} {totalProducts === 1 ? "product" : "products"}
          {totalProducts > itemsPerPage && (
            <Text style={styles.paginationInfo}>
              {" "}
              ({currentPage} of {totalPages})
            </Text>
          )}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {totalProducts === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your filters
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.productsGrid}>
              {currentProducts.map((product) => {
                const restriction = getProductRestriction(product);
                const hasRestriction = restriction !== null;
                const isAdding = addingProductId === product.id;

                // Calculate discount percentage as a string
                const discountPercentage = product.originalPrice
                  ? `${Math.round(
                      (1 - product.price / product.originalPrice) * 100
                    )}%`
                  : null;

                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => handleProductPress(product)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.productImage}>
                      {/* Handle both emoji and URL images */}
                      {product.image && product.image.startsWith("http") ? (
                        <Image
                          source={{ uri: product.image }}
                          style={styles.productImageActual}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.productImagePlaceholder}>
                          {product.image || "💊"}
                        </Text>
                      )}
                      {!product.inStock && (
                        <View style={styles.outOfStockBadge}>
                          <Text style={styles.outOfStockText}>
                            Out of Stock
                          </Text>
                        </View>
                      )}
                      {/* Use accessLevel instead of requires_license */}
                      {product.accessLevel && product.accessLevel !== "OTC" && (
                        <View style={styles.licenseBadge}>
                          <ShieldAlert size={10} color="#fff" />
                          <Text style={styles.licenseBadgeText}>
                            {product.accessLevel === "PATENT_ONLY"
                              ? "Rx"
                              : "Rx+"}
                          </Text>
                        </View>
                      )}
                      {discountPercentage && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            {discountPercentage}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {String(product.name || "Unnamed Product")}
                      </Text>

                      {/* FIX APPLIED HERE: Use explicit checks (not just truthiness) to prevent rendering numerical 0 */}
                      {product.rating !== null &&
                        product.rating !== undefined &&
                        product.reviews !== null &&
                        product.reviews !== undefined && (
                          <View style={styles.ratingRow}>
                            <Star size={12} color="#FFB800" fill="#FFB800" />
                            <Text style={styles.ratingText}>
                              {String(product.rating)}
                            </Text>
                            <Text style={styles.reviewsText}>
                              ({String(product.reviews)})
                            </Text>
                          </View>
                        )}
                      {/* END OF FIX */}

                      <View style={styles.priceRow}>
                        <Text style={styles.price}>
                          {formatPrice(product.price)}
                        </Text>
                        {product.originalPrice && (
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
                          isAdding && styles.disabledButton,
                        ]}
                        onPress={(e) => handleAddToCart(e, product)}
                        disabled={isAdding}
                      >
                        {hasRestriction ? (
                          <View style={styles.buttonContent}>
                            <ShieldAlert size={12} color="#fff" />
                            <Text style={styles.restrictedButtonText}>
                              {String(restriction?.buttonText || "Restricted")}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.addToCartButtonText}>
                            {isAdding ? "Adding..." : "Add to Cart"}
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
                      currentPage === 1 && styles.paginationButtonTextDisabled,
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
                    // Show limited page numbers for better UX
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

            {/* Refresh button */}
            {products.length > 0 && (
              <View style={styles.refreshContainer}>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                  disabled={isLoadingProducts}
                >
                  {isLoadingProducts ? (
                    <ActivityIndicator size="small" color="#50C878" />
                  ) : (
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Category Filter Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={String(category)}
                  style={styles.modalOption}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedCategory === category &&
                        styles.modalOptionTextActive,
                    ]}
                  >
                    {String(category)}
                  </Text>
                  {selectedCategory === category && (
                    <View style={styles.modalOptionCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Price Filter Modal */}
      <Modal
        visible={showPriceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Price Range</Text>
              <TouchableOpacity onPress={() => setShowPriceModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={String(range.id)}
                  style={styles.modalOption}
                  onPress={() => handlePriceSelect(range.label)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedPriceRange === range.label &&
                        styles.modalOptionTextActive,
                    ]}
                  >
                    {String(range.label)}
                  </Text>
                  {selectedPriceRange === range.label && (
                    <View style={styles.modalOptionCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Loading Modals */}
      <LoadingModal
        visible={isLoading}
        message={`Loading ${loadingProductName}...`}
      />

      <LoadingModal
        visible={!!addingProductId}
        message="Adding medication to cart..."
      />

      {/* KYC Verification Modal */}
      <KYCVerificationModal
        visible={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        userType={String(
          user?.type || user?.buyer_type || user?.account_tier || ""
        )}
      />
    </SafeAreaView>
  );
};

// Add the styles here (copy your existing styles)
const styles = StyleSheet.create({
  // ... (keep all your existing styles)
});

export default ProductsPage;
