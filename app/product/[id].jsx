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
  TextInput,
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
  const [quantityInput, setQuantityInput] = useState("1");
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
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
    setQuantityInput("1");
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
    const maxStock = product?.stockCount || 999;
    setQuantity((q) => {
      const newQuantity = Math.min(q + 1, maxStock);
      setQuantityInput(newQuantity.toString());
      return newQuantity;
    });
  };

  const decrementQuantity = () => {
    setQuantity((q) => {
      const newQuantity = Math.max(1, q - 1);
      setQuantityInput(newQuantity.toString());
      return newQuantity;
    });
  };

  const handleQuantityInputChange = (text) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    setQuantityInput(numericText);
  };

  const handleQuantityInputFocus = () => {
    setIsEditingQuantity(true);
  };

  const handleQuantityInputBlur = () => {
    setIsEditingQuantity(false);

    // Validate and update quantity
    const numValue = parseInt(quantityInput, 10);
    const maxStock = product?.stockCount || 999;

    if (isNaN(numValue) || numValue < 1) {
      // Reset to 1 if invalid
      setQuantity(1);
      setQuantityInput("1");
    } else if (numValue > maxStock) {
      // Cap at max stock
      setQuantity(maxStock);
      setQuantityInput(maxStock.toString());
      Alert.alert(
        "Stock Limit",
        `Only ${maxStock} units available. Quantity set to maximum.`
      );
    } else {
      // Valid input
      setQuantity(numValue);
    }
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

    // Add to cart immediately, no delay
    addToCart(product, quantity);

    setTimeout(() => {
      setIsAddingToCart(false);
      setQuantity(1);
      setQuantityInput("1");
    }, 200);
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
          <Text style={styles.skuText}>Spec: {product.spec}</Text>
          <Text style={styles.skuText}>Property: {product.property}</Text>
          <Text style={styles.expiryText}>
            Expiry Date: {product.expiryDate}
          </Text>

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
            </View>
          </View>

          <View style={styles.divider} />
          {/* Quantity Section */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControlWrapper}>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    hasRestriction && styles.disabledButton,
                  ]}
                  onPress={decrementQuantity}
                  disabled={hasRestriction}
                >
                  <Minus
                    size={20}
                    color={hasRestriction ? "#ccc" : "#50C878"}
                  />
                </TouchableOpacity>

                <TextInput
                  style={[
                    styles.quantityInputField,
                    isEditingQuantity && styles.quantityInputActive,
                    hasRestriction && styles.quantityInputDisabled,
                  ]}
                  value={quantityInput}
                  onChangeText={handleQuantityInputChange}
                  onFocus={handleQuantityInputFocus}
                  onBlur={handleQuantityInputBlur}
                  keyboardType="number-pad"
                  maxLength={product?.stockCount?.toString().length || 3}
                  selectTextOnFocus={true}
                  editable={!hasRestriction}
                />

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    hasRestriction && styles.disabledButton,
                  ]}
                  onPress={incrementQuantity}
                  disabled={hasRestriction}
                >
                  <Plus size={20} color={hasRestriction ? "#ccc" : "#50C878"} />
                </TouchableOpacity>
              </View>

              {product?.stockCount && (
                <Text style={styles.stockLimitText}>
                  Max: {product.stockCount}
                </Text>
              )}
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
        {/* Suggested Products Section */}
        {product.category && (
          <View style={styles.suggestedSection}>
            <View style={styles.suggestedHeader}>
              <Text style={styles.sectionTitle}>Similar Products</Text>
              <Text style={styles.suggestedSubtitle}>
                From {product.category}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedScrollContent}
            >
              {products
                .filter(
                  (p) =>
                    p.category === product.category &&
                    p.id !== product.id &&
                    p.inStock
                )
                .slice(0, 10)
                .map((suggestedProduct) => {
                  const restriction = getProductRestriction(suggestedProduct);
                  const hasRestriction = restriction !== null;

                  return (
                    <TouchableOpacity
                      key={suggestedProduct.id}
                      style={styles.suggestedProductCard}
                      onPress={() => {
                        setLoading(true);
                        // Navigate to the new product
                        router.push(`/product/${suggestedProduct.id}`);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.suggestedProductImage}>
                        {suggestedProduct.image ? (
                          <Image
                            source={{ uri: suggestedProduct.image }}
                            style={styles.productImageActual}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.productImagePlaceholder}>💊</Text>
                        )}
                        {suggestedProduct.accessLevel &&
                          suggestedProduct.accessLevel !== "OTC" && (
                            <View style={styles.licenseBadgeSmall}>
                              <ShieldAlert size={8} color="#fff" />
                              <Text style={styles.licenseBadgeTextSmall}>
                                {suggestedProduct.accessLevel === "PATENT_ONLY"
                                  ? "Rx"
                                  : "Rx+"}
                              </Text>
                            </View>
                          )}
                        {suggestedProduct.originalPrice &&
                          suggestedProduct.discount > 0 && (
                            <View style={styles.discountBadgeSmall}>
                              <Text style={styles.discountTextSmall}>
                                {Math.round(suggestedProduct.discount)}%
                              </Text>
                            </View>
                          )}
                      </View>

                      <View style={styles.suggestedProductInfo}>
                        <Text
                          style={styles.suggestedProductName}
                          numberOfLines={2}
                        >
                          {suggestedProduct.name}
                        </Text>

                        {suggestedProduct.rating &&
                          suggestedProduct.reviews > 0 && (
                            <View style={styles.ratingRowSmall}>
                              <Star size={10} color="#FFB800" fill="#FFB800" />
                              <Text style={styles.ratingTextSmall}>
                                {suggestedProduct.rating}
                              </Text>
                            </View>
                          )}

                        <View style={styles.priceRowSmall}>
                          <Text style={styles.priceSmall}>
                            {formatPrice(suggestedProduct.price)}
                          </Text>
                          {suggestedProduct.originalPrice &&
                            suggestedProduct.originalPrice >
                              suggestedProduct.price && (
                              <Text style={styles.originalPriceSmall}>
                                {formatPrice(suggestedProduct.originalPrice)}
                              </Text>
                            )}
                        </View>

                        {isInCart(suggestedProduct.id) ? (
                          <View style={styles.quantityControlCompactSmall}>
                            <TouchableOpacity
                              style={styles.quantityButtonCompactSmall}
                              onPress={(e) => {
                                e.stopPropagation();
                                const currentQty = getItemQuantity(
                                  suggestedProduct.id
                                );
                                if (currentQty > 1) {
                                  addToCart(suggestedProduct, -1);
                                }
                              }}
                            >
                              <Minus size={12} color="#50C878" />
                            </TouchableOpacity>
                            <Text style={styles.quantityTextCompactSmall}>
                              {getItemQuantity(suggestedProduct.id)}
                            </Text>
                            <TouchableOpacity
                              style={styles.quantityButtonCompactSmall}
                              onPress={(e) => {
                                e.stopPropagation();
                                addToCart(suggestedProduct, 1);
                              }}
                            >
                              <Plus size={12} color="#50C878" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.addToCartButtonSmall,
                              hasRestriction && styles.restrictedButtonSmall,
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              if (hasRestriction) {
                                Alert.alert(
                                  restriction.message,
                                  `This product requires ${restriction.buttonText}`
                                );
                              } else {
                                addToCart(suggestedProduct, 1);
                                Alert.alert(
                                  "Added to Cart",
                                  `${suggestedProduct.name} added to cart`
                                );
                              }
                            }}
                          >
                            <Text style={styles.addToCartButtonTextSmall}>
                              {hasRestriction ? restriction.buttonText : "Add"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        )}
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
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  quantityLabel: {
    fontSize: 15,
    color: "#000",
    fontWeight: "600",
    paddingTop: 8,
  },
  quantityControlWrapper: {
    alignItems: "flex-end",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityInputField: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    minWidth: 60,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  quantityInputActive: {
    borderColor: "#50C878",
    borderWidth: 2,
  },
  quantityInputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  stockLimitText: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
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
  expiryText: {
    fontSize: 13,
    color: "#000",
    marginBottom: 12,
  },
  suggestedSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 8,
  },
  suggestedHeader: {
    marginBottom: 16,
  },
  suggestedSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  suggestedScrollContent: {
    gap: 12,
  },
  suggestedProductCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  suggestedProductImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  suggestedProductInfo: {
    padding: 10,
  },
  suggestedProductName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
    minHeight: 32,
  },
  ratingRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 6,
  },
  ratingTextSmall: {
    fontSize: 11,
    fontWeight: "600",
    color: "#000",
  },
  priceRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  priceSmall: {
    fontSize: 14,
    fontWeight: "700",
    color: "#50C878",
  },
  originalPriceSmall: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },
  licenseBadgeSmall: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FF6B6B",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  licenseBadgeTextSmall: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  discountBadgeSmall: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#FF5722",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountTextSmall: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  addToCartButtonSmall: {
    backgroundColor: "#50C878",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  restrictedButtonSmall: {
    backgroundColor: "#FF6B6B",
  },
  addToCartButtonTextSmall: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  quantityControlCompactSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0fff4",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#50C878",
  },
  quantityButtonCompactSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#50C878",
  },
  quantityTextCompactSmall: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#50C878",
    minWidth: 24,
    textAlign: "center",
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
