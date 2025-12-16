import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Minus,
  Package,
  Plus,
  ShieldAlert,
  ShoppingCart,
  Star,
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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import KYCVerificationModal from "../../components/KYCVerificationModal";
import LoadingModal from "../../components/loadingModal";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/cartContext";

// Modified function to use products from AuthContext
const findProductById = (id, products) => {
  if (!products || !Array.isArray(products)) return null;
  return products.find((p) => p.id.toString() === id.toString());
};

const ProductDetail = () => {
  const params = useLocalSearchParams();
  const productId = params.id;
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { user, products } = useAuth(); // Get both user and products from auth context

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isGoingBack, setIsGoingBack] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Pass products to the function
    const foundProduct = findProductById(productId, products);
    setProduct(foundProduct);
    setQuantity(1);
    setLoading(false);
  }, [productId, products]); // Add products to dependency array

  const formatPrice = (price) => `₦${price.toLocaleString()}`;

  // NEW ACCESS LEVEL LOGIC
  // Get user account tier
  const getUserTier = () => {
    if (!user) return null;
    // Check both 'type' and 'account_tier' fields
    const tier = user.account_tier || user.type || user.buyer_type;
    return tier ? tier.toUpperCase() : null;
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

  const handleBack = useCallback(() => {
    if (isGoingBack) return;
    setIsGoingBack(true);
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/(tabs)");
      }
    }, 50);
  }, [isGoingBack]);

  const incrementQuantity = () => {
    setIsUpdatingQuantity(true);
    setTimeout(() => {
      setQuantity((q) => q + 1);
      setIsUpdatingQuantity(false);
    }, 500);
  };

  const decrementQuantity = () => {
    setIsUpdatingQuantity(true);
    setTimeout(() => {
      setQuantity((q) => Math.max(1, q - 1));
      setIsUpdatingQuantity(false);
    }, 500);
  };

  // UPDATED ADD TO CART HANDLER
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const restriction = getProductRestriction(product);

    // Handle verification requirement
    if (restriction?.type === "VERIFICATION_REQUIRED") {
      setShowKYCModal(true);
      return;
    }

    // Handle login requirement
    if (restriction?.type === "LOGIN_REQUIRED") {
      Alert.alert("Login Required", "Please login to purchase this product.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          onPress: () => router.push("/login"),
        },
      ]);
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
            onPress: () => router.push("/upgrade"),
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

    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart(product, quantity);
      setIsAddingToCart(false);

      Alert.alert(
        "Added to Cart",
        `${quantity} ${quantity === 1 ? "item" : "items"} added to your cart.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          {
            text: "View Cart",
            onPress: () => router.push("/cart"),
          },
        ]
      );
      setQuantity(1);
    }, 1000);
  }, [product, quantity, addToCart, user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backButtonBottom}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Go Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = product.price * quantity;
  const discount =
    product.originalPrice && product.originalPrice !== product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  // Get restriction information for the product
  const restriction = getProductRestriction(product);
  const hasRestriction = restriction !== null;
  const canAddToCart = !hasRestriction && product.inStock;

  // Determine button text and style based on restriction
  const getButtonConfig = () => {
    if (restriction?.type === "VERIFICATION_REQUIRED") {
      return {
        text: "Verification Required",
        icon: ShieldAlert,
        style: styles.verificationRequiredButton,
      };
    }
    if (restriction?.type === "LICENSE_REQUIRED") {
      return {
        text: "License Required",
        icon: ShieldAlert,
        style: styles.licenseRequiredButton,
      };
    }
    if (restriction?.type === "UPGRADE_REQUIRED") {
      return {
        text: "Upgrade Required",
        icon: ShieldAlert,
        style: styles.upgradeRequiredButton,
      };
    }
    return {
      text: isAddingToCart ? "Adding to Cart..." : "Add to Cart",
      icon: ShoppingCart,
      style: styles.addToCartButton,
    };
  };

  const buttonConfig = getButtonConfig();

  // Function to render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} color="#FFC107" fill="#FFC107" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} color="#FFC107" fill="none" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty${i}`} size={16} color="#E0E0E0" fill="none" />
      );
    }

    return stars;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {isGoingBack && (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Going back...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={isGoingBack}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Product Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {/* Handle URL images */}
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImageActual}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.imagePlaceholder}>💊</Text>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
          {!product.inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
          {/* Keep access level badge */}
          {product.accessLevel && product.accessLevel !== "OTC" && (
            <View style={styles.licenseBadge}>
              <ShieldAlert size={14} color="#fff" />
              <Text style={styles.licenseBadgeText}>
                {product.accessLevel === "PATENT_ONLY" ? "Rx" : "Rx+"}
              </Text>
            </View>
          )}
        </View>

        {/* License Warning Banner */}
        {restriction?.type === "LICENSE_REQUIRED" && (
          <View style={styles.licenseWarning}>
            <ShieldAlert size={20} color="#ff6b00" />
            <View style={styles.licenseWarningContent}>
              <Text style={styles.licenseWarningTitle}>
                Prescription Medication
              </Text>
              <Text style={styles.licenseWarningText}>
                This medication requires a pharmacy or patent medicine license
                to purchase. Please register as a licensed user.
              </Text>
            </View>
          </View>
        )}

        {/* Verification Warning Banner */}
        {restriction?.type === "VERIFICATION_REQUIRED" && (
          <View style={styles.verificationWarning}>
            <ShieldAlert size={20} color="#FF9800" />
            <View style={styles.licenseWarningContent}>
              <Text style={styles.verificationWarningTitle}>
                Verification Required
              </Text>
              <Text style={styles.verificationWarningText}>
                Your account needs to be verified to purchase prescription
                medications. Complete KYC verification process to unlock access.
              </Text>
            </View>
          </View>
        )}

        {/* Upgrade Warning Banner */}
        {restriction?.type === "UPGRADE_REQUIRED" && (
          <View style={styles.upgradeWarning}>
            <ShieldAlert size={20} color="#9C27B0" />
            <View style={styles.licenseWarningContent}>
              <Text style={styles.upgradeWarningTitle}>
                Pharmacy License Required
              </Text>
              <Text style={styles.upgradeWarningText}>
                This medication requires a full pharmacy license. Please upgrade
                your account or contact support.
              </Text>
            </View>
          </View>
        )}

        {/* Product Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.skuText}>SKU: {product.sku}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {renderStars(product.rating || 0)}
            </View>
            <Text style={styles.ratingText}>
              {product.rating || 0} ({product.reviews || 0} reviews)
            </Text>
            {product.sold > 0 && (
              <Text style={styles.soldText}> • {product.sold} sold</Text>
            )}
          </View>

          {product.stockCount && (
            <View style={styles.stockRow}>
              <Package size={16} color="#666" />
              <Text style={styles.stockText}>
                {product.stockCount} units available
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {product.meta?.activeIngredient && (
            <>
              <Text style={styles.sectionTitle}>Active Ingredient</Text>
              <Text style={styles.descriptionText}>
                {product.meta.activeIngredient}
              </Text>
              <View style={styles.divider} />
            </>
          )}
        </View>

        {/* Price and Quantity */}
        <View style={styles.priceQuantityCard}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price per unit</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              {product.originalPrice &&
                product.originalPrice !== product.price && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </Text>
                )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  (isUpdatingQuantity || hasRestriction) &&
                    styles.disabledButton,
                ]}
                onPress={decrementQuantity}
                disabled={isUpdatingQuantity || hasRestriction}
              >
                {isUpdatingQuantity ? (
                  <ActivityIndicator size={20} color="#50C878" />
                ) : (
                  <Minus
                    size={20}
                    color={hasRestriction ? "#ccc" : "#50C878"}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  (isUpdatingQuantity || hasRestriction) &&
                    styles.disabledButton,
                ]}
                onPress={incrementQuantity}
                disabled={isUpdatingQuantity || hasRestriction}
              >
                {isUpdatingQuantity ? (
                  <ActivityIndicator size={20} color="#50C878" />
                ) : (
                  <Plus size={20} color={hasRestriction ? "#ccc" : "#50C878"} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Usage Instructions */}
        {product.meta && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Usage Instructions</Text>
            {product.meta.adultUsage && (
              <>
                <Text style={styles.subSectionTitle}>For Adults:</Text>
                <Text style={styles.sectionContent}>
                  {product.meta.adultUsage}
                </Text>
              </>
            )}
            {product.meta.administrationUsage && (
              <>
                <Text style={[styles.subSectionTitle, { marginTop: 12 }]}>
                  Administration:
                </Text>
                <Text style={styles.sectionContent}>
                  {product.meta.administrationUsage}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Warnings & Side Effects */}
        {product.meta && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Warnings & Side Effects</Text>

            {product.meta.warnings && product.meta.warnings.length > 0 && (
              <>
                <Text style={styles.subSectionTitle}>Warnings:</Text>
                {product.meta.warnings.map((warning, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{warning}</Text>
                  </View>
                ))}
              </>
            )}

            {product.meta.sideEffects &&
              product.meta.sideEffects.length > 0 && (
                <>
                  <Text style={[styles.subSectionTitle, { marginTop: 12 }]}>
                    Possible Side Effects:
                  </Text>
                  {product.meta.sideEffects.map((effect, index) => (
                    <View key={index} style={styles.bulletPoint}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{effect}</Text>
                    </View>
                  ))}
                </>
              )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>
            Total ({quantity} {quantity === 1 ? "item" : "items"})
          </Text>
          <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
        </View>
        <TouchableOpacity
          style={[
            buttonConfig.style,
            !canAddToCart &&
              !restriction?.type === "VERIFICATION_REQUIRED" &&
              styles.addToCartButtonDisabled,
            isAddingToCart && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size={20} color="#fff" />
          ) : (
            <>
              <buttonConfig.icon size={20} color="#fff" />
              <Text style={styles.addToCartButtonText}>
                {buttonConfig.text}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <LoadingModal
        visible={isAddingToCart}
        message="Adding medication to cart..."
      />

      <LoadingModal
        visible={isUpdatingQuantity}
        message="Updating quantity..."
      />

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
    backgroundColor: "#f9f9f9",
  },
  fullScreenLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    fontWeight: "600",
  },
  backButtonBottom: {
    backgroundColor: "#50C878",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  imageContainer: {
    height: 280,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 8,
  },
  imagePlaceholder: {
    fontSize: 120,
  },
  productImageActual: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#e91e63",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  licenseBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "#ff6b00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  licenseBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  licenseWarning: {
    backgroundColor: "#fff5e6",
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b00",
    flexDirection: "row",
    gap: 12,
  },
  licenseWarningContent: {
    flex: 1,
  },
  licenseWarningTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ff6b00",
    marginBottom: 4,
  },
  licenseWarningText: {
    fontSize: 13,
    color: "#8b4000",
    lineHeight: 18,
  },
  verificationWarning: {
    backgroundColor: "#fff3e0",
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    flexDirection: "row",
    gap: 12,
  },
  verificationWarningTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 4,
  },
  verificationWarningText: {
    fontSize: 13,
    color: "#e65100",
    lineHeight: 18,
  },
  upgradeWarning: {
    backgroundColor: "#f3e5f5",
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#9C27B0",
    flexDirection: "row",
    gap: 12,
  },
  upgradeWarningTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#9C27B0",
    marginBottom: 4,
  },
  upgradeWarningText: {
    fontSize: 13,
    color: "#6a1b9a",
    lineHeight: 18,
  },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  skuText: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  soldText: {
    fontSize: 14,
    color: "#999",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  stockText: {
    fontSize: 13,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  priceQuantityCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 8,
  },
  priceSection: {
    marginBottom: 0,
  },
  priceLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#50C878",
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityLabel: {
    fontSize: 15,
    color: "#000",
    fontWeight: "600",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0fff4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#50C878",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    minWidth: 32,
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 10,
  },
  bullet: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  addToCartButton: {
    backgroundColor: "#50C878",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#ccc",
  },
  licenseRequiredButton: {
    backgroundColor: "#ff6b00",
  },
  verificationRequiredButton: {
    backgroundColor: "#FF9800",
  },
  upgradeRequiredButton: {
    backgroundColor: "#9C27B0",
  },
  disabledButton: {
    opacity: 0.6,
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProductDetail;
