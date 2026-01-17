import { router } from "expo-router";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
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
import LoadingModal from "../../../components/loadingModal";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/cartContext";

const CartScreen = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();
  const { user, checkout } = useAuth();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [buyerNote, setBuyerNote] = useState("");

  // Pre-fill address from user object when component mounts or user changes
  useEffect(() => {
    if (user?.address) {
      setShippingAddress(user.address);
    }
  }, [user]);

  // --- Calculations ---
  const calculateSubtotal = () => {
    return getCartTotal();
  };

  const calculateShipping = (subtotal) => {
    return subtotal * 0.025; // 2.5% of subtotal
  };

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const formatPrice = (price) => {
    return `₦${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  // --------------------

  const handleRemoveItem = (item) => {
    Alert.alert("Remove Item", `Remove ${item.name} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(item.id),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checking out."
      );
      return;
    }

    // Check if user is logged in
    if (!user) {
      Alert.alert("Login Required", "Please login to checkout.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          onPress: () => router.push("/login"),
        },
      ]);
      return;
    }

    // Check if shipping address is provided
    if (!shippingAddress.trim()) {
      Alert.alert(
        "Address Required",
        "Please provide a shipping address before checkout.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Address",
            onPress: () => setShowAddressForm(true),
          },
        ]
      );
      return;
    }

    const checkoutData = {
      cartItems: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingAddress: shippingAddress,
      buyerNote: buyerNote,
    };

    // Log the data being sent
    console.log("====================================");
    console.log("CHECKOUT DATA BEING SENT TO BACKEND:");
    console.log(JSON.stringify(checkoutData, null, 2));
    console.log("====================================");

    // Show loading modal
    setIsCheckingOut(true);

    try {
      // Use the checkout function from AuthContext - pass shippingAddress as string
      const result = await checkout(cartItems, shippingAddress, buyerNote);

      // Clear cart and buyer note after successful checkout
      clearCart();
      setBuyerNote("");

      // Show success message
      Alert.alert(
        "Order Placed Successfully! 🎉",
        `Your order has been placed successfully. Total: ${formatPrice(total)}`,
        [
          {
            text: "View Orders",
            onPress: () => router.push("/notice"),
          },
          {
            text: "Continue Shopping",
            onPress: () => router.push("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert(
        "Checkout Failed",
        error.message ||
          "There was an error processing your order. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleContinueShopping = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddressSubmit = () => {
    if (!shippingAddress.trim()) {
      Alert.alert("Address Required", "Please enter your shipping address.");
      return;
    }

    setShowAddressForm(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.headerRight}>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {cartItems.length === 0 ? (
        // Empty Cart
        <View style={styles.emptyCart}>
          <ShoppingBag size={80} color="#ccc" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartText}>Add items to get started</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.shopNowButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Cart Items Count */}
            <View style={styles.itemsCountContainer}>
              <Text style={styles.itemsCountText}>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </Text>
            </View>

            {/* Cart Items */}
            <View style={styles.cartItemsContainer}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemImageContainer}>
                    {item.image && item.image.startsWith("http") ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.itemImagePlaceholder}>
                        {item.image || "💊"}
                      </Text>
                    )}
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>
                        {formatPrice(item.price)}
                      </Text>
                      {item.originalPrice &&
                        item.originalPrice !== item.price && (
                          <Text style={styles.itemOriginalPrice}>
                            {formatPrice(item.originalPrice)}
                          </Text>
                        )}
                    </View>

                    {!item.inStock && (
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    )}

                    {/* Quantity Controls */}
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Minus size={16} color="#50C878" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <Plus size={16} color="#50C878" />
                      </TouchableOpacity>
                    </View>

                    {/* Item Total */}
                    <Text style={styles.itemTotal}>
                      Total: {formatPrice(item.price * item.quantity)}
                    </Text>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveItem(item)}
                  >
                    <Trash2 size={20} color="#e91e63" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Shipping Address */}
            <View style={styles.addressContainer}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>Shipping Address</Text>
                <TouchableOpacity
                  style={styles.editAddressButton}
                  onPress={() => setShowAddressForm(true)}
                >
                  <Text style={styles.editAddressText}>
                    {shippingAddress.trim() ? "Edit" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>

              {shippingAddress.trim() ? (
                <View style={styles.addressDisplay}>
                  <Text style={styles.addressLine}>{shippingAddress}</Text>
                </View>
              ) : (
                <Text style={styles.noAddressText}>
                  No shipping address provided
                </Text>
              )}
            </View>

            {/* Buyer Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteTitle}>Order Notes (Optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={buyerNote}
                onChangeText={setBuyerNote}
                placeholder="Add any special instructions for your order..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.noteCharCount}>
                {buyerNote.length}/500 characters
              </Text>
            </View>

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal (
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items)
                </Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping (2.5%)</Text>
                <Text style={styles.summaryValue}>{formatPrice(shipping)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
            <View style={styles.checkoutInfo}>
              <Text style={styles.checkoutLabel}>Total</Text>
              <Text style={styles.checkoutPrice}>{formatPrice(total)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
            >
              <Text style={styles.checkoutButtonText}>
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.addressModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shipping Address</Text>
              <TouchableOpacity onPress={() => setShowAddressForm(false)}>
                <Text style={styles.modalCloseButton}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={shippingAddress}
                  onChangeText={setShippingAddress}
                  placeholder="Enter your complete delivery address"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Text style={styles.inputHint}>
                  Include street, city, state, and any landmarks
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddressForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddressSubmit}
              >
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Loading Modal */}
      <LoadingModal visible={isCheckingOut} message="Processing checkout..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
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
  },
  headerRight: {
    minWidth: 50,
    alignItems: "flex-end",
  },
  clearText: {
    fontSize: 14,
    color: "#e91e63",
    fontWeight: "600",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: "#50C878",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  shopNowButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 140,
  },
  itemsCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  itemsCountText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  cartItemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemImagePlaceholder: {
    fontSize: 40,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 11,
    color: "#50C878",
    marginBottom: 6,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#50C878",
  },
  itemOriginalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  outOfStockText: {
    fontSize: 11,
    color: "#e91e63",
    fontWeight: "600",
    marginBottom: 6,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginBottom: 6,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#50C878",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
  addressContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  editAddressButton: {
    padding: 4,
  },
  editAddressText: {
    fontSize: 14,
    color: "#50C878",
    fontWeight: "600",
  },
  addressDisplay: {
    paddingLeft: 4,
  },
  addressLine: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noAddressText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  noteContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    minHeight: 80,
    textAlignVertical: "top",
  },
  noteCharCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#50C878",
  },
  bottomSpacer: {
    height: 20,
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  checkoutLabel: {
    fontSize: 14,
    color: "#666",
  },
  checkoutPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  checkoutButton: {
    backgroundColor: "#50C878",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  addressModal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  modalCloseButton: {
    fontSize: 24,
    color: "#999",
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#50C878",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default CartScreen;
