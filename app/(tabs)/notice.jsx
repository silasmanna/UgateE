import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Filter,
  RefreshCw, // Added this import
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

// Helper function to map AuthContext order data to the component's expected format
const mapApiOrderToLocalOrder = (apiOrder) => {
  // Map paymentStatus to a simplified display status
  const statusMapping = {
    PENDING: "Unpaid",
    COMPLETED: "Completed",
    // Add other API statuses as needed
  };

  const status =
    statusMapping[apiOrder.paymentStatus] ||
    apiOrder.paymentStatus ||
    apiOrder.status;

  // CRUCIAL FIX: Implement better fallback for item names (since API name:"" is common)
  const productsList = (apiOrder.items || []).map((item) => {
    // Check if item.name is a non-empty string.
    if (item.name && item.name.trim().length > 0) {
      return item.name;
    }
    // Fallback: Use product ID/item ID if name is empty
    return item.productId
      ? `Product ID: ${item.productId}`
      : `Item ID: ${item.itemId || "Unknown"}`;
  });

  return {
    // Use the cleaned/transformed data passed from AuthContext (which should have 'id', 'date', 'total')
    id: apiOrder.id,
    date: apiOrder.date,
    total: apiOrder.total,
    status: status,
    items: (apiOrder.items || []).length,
    products: productsList,
    fullItems: apiOrder.items || [],
  };
};

const OrdersScreen = () => {
  // Destructure orders, loading, error, and fetch function from AuthContext
  const { orders, isLoadingOrders, ordersError, fetchOrders } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All Time");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Added this state

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Added this function to handle manual refresh
  const handleRefreshOrders = async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const orderStatuses = [
    "All",
    "Unpaid",
    "Unshipped",
    "Unreceived",
    "Completed",
  ];
  const dateRanges = [
    "All Time",
    "Last 7 Days",
    "Last 30 Days",
    "Last 3 Months",
    "Last 6 Months",
  ];

  // Map orders from AuthContext into the local display format
  const allOrders = orders ? orders.map(mapApiOrderToLocalOrder) : [];

  // Filter orders based on selected filters
  const filteredOrders = allOrders.filter((order) => {
    // 1. Status Filter
    if (selectedFilter !== "All" && order.status !== selectedFilter) {
      return false;
    }

    // 2. Date range filtering
    if (!order.date) return true; // Skip filtering if date is missing

    const orderDate = new Date(order.date);
    const now = new Date();
    // Calculate difference in days
    const diffDays = Math.floor(
      (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (selectedDateRange) {
      case "Last 7 Days":
        return diffDays <= 7;
      case "Last 30 Days":
        return diffDays <= 30;
      case "Last 3 Months":
        return diffDays <= 90; // Approx 3 months
      case "Last 6 Months":
        return diffDays <= 180; // Approx 6 months
      default:
        return true;
    }
  });

  // --- Helper Functions ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Unpaid":
        return "#FF5252";
      case "Unshipped":
        return "#FF9800";
      case "Unreceived":
        return "#2196F3";
      case "Completed":
        return "#4CAF50";
      default:
        return "#999";
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Unpaid":
        return "#FFEBEE";
      case "Unshipped":
        return "#FFF3E0";
      case "Unreceived":
        return "#E3F2FD";
      case "Completed":
        return "#E8F5E9";
      default:
        return "#F5F5F5";
    }
  };

  const formatPrice = (price) => {
    // Check if price is a valid number before formatting
    const numericPrice = typeof price === "number" && !isNaN(price) ? price : 0;
    return `₦${numericPrice.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Date Unavailable";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleContactUs = () => {
    setShowOrderModal(false);
    console.log("Navigate to Contact Us with order:", selectedOrder);
  };

  // --- Render Logic ---
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={18} color="#666" />
          <Text style={styles.filterButtonText}>{selectedFilter}</Text>
          <ChevronDown size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDateModal(true)}
        >
          <Calendar size={18} color="#666" />
          <Text style={styles.filterButtonText}>{selectedDateRange}</Text>
          <ChevronDown size={16} color="#666" />
        </TouchableOpacity>

        {/* Added refresh button */}
        <TouchableOpacity
          style={[styles.filterButton, styles.refreshButton]}
          onPress={handleRefreshOrders}
          disabled={isRefreshing || isLoadingOrders}
        >
          {isRefreshing || isLoadingOrders ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <RefreshCw size={18} color="#666" />
          )}
          <Text style={styles.filterButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Orders Count */}
      <View style={styles.ordersCount}>
        <Text style={styles.ordersCountText}>
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1 ? "Order" : "Orders"}
        </Text>
      </View>

      {/* Loading/Error/Orders List */}
      {isLoadingOrders ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e91e63" />
          <Text style={styles.loadingText}>Fetching your orders...</Text>
        </View>
      ) : ordersError ? (
        <View style={styles.errorState}>
          <Text style={styles.emptyStateTitle}>Error Fetching Orders</Text>
          <Text style={styles.emptyStateText}>
            Could not load your orders. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No orders found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={[
                    styles.orderCard,
                    { borderLeftColor: getStatusColor(order.status) },
                  ]}
                  onPress={() => handleOrderClick(order)}
                >
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderDate}>
                        {formatDate(order.date)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusBackgroundColor(
                            order.status
                          ),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  {/* Order Details */}
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderItems}>
                      {order.items} {order.items === 1 ? "item" : "items"}
                    </Text>
                    <Text style={styles.orderProducts} numberOfLines={1}>
                      {order.products.join(", ")}
                    </Text>
                  </View>

                  {/* Order Footer */}
                  <View style={styles.orderFooter}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>
                      {formatPrice(order.total)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Status</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            {orderStatuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedFilter(status);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedFilter === status && styles.modalOptionTextActive,
                  ]}
                >
                  {status}
                </Text>
                {selectedFilter === status && (
                  <View style={styles.modalOptionCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Range Modal */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            {dateRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedDateRange(range);
                  setShowDateModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedDateRange === range && styles.modalOptionTextActive,
                  ]}
                >
                  {range}
                </Text>
                {selectedDateRange === range && (
                  <View style={styles.modalOptionCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        visible={showOrderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.orderModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.orderModalScroll}>
                {/* Order ID and Status */}
                <View style={styles.orderModalSection}>
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabel}>Order ID</Text>
                    <Text style={styles.orderModalValue}>
                      {selectedOrder.id}
                    </Text>
                  </View>
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabel}>Status</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusBackgroundColor(
                            selectedOrder.status
                          ),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(selectedOrder.status) },
                        ]}
                      >
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabel}>Order Date</Text>
                    <Text style={styles.orderModalValue}>
                      {formatDate(selectedOrder.date)}
                    </Text>
                  </View>
                </View>

                {/* Products */}
                <View style={styles.orderModalSection}>
                  <Text style={styles.orderModalSectionTitle}>Products</Text>
                  {/* Now we use the fullItems array for detailed product view */}
                  {selectedOrder.fullItems &&
                    selectedOrder.fullItems.map((item, index) => (
                      <View
                        key={item.itemId || index}
                        style={styles.productItem}
                      >
                        <Text style={styles.productBullet}>•</Text>
                        <Text style={styles.productName}>
                          {/* Use the item name or a robust fallback */}
                          {item.name && item.name.trim().length > 0
                            ? item.name
                            : item.productId
                            ? `Product ID: ${item.productId}`
                            : `Item ID: ${item.itemId || "Unknown"}`}
                        </Text>
                        <Text style={styles.orderModalValue}>
                          {formatPrice(item.total)}
                        </Text>
                      </View>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={styles.orderModalSection}>
                  <Text style={styles.orderModalSectionTitle}>
                    Order Summary
                  </Text>
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabel}>Items</Text>
                    <Text style={styles.orderModalValue}>
                      {selectedOrder.items}{" "}
                      {selectedOrder.items === 1 ? "item" : "items"}
                    </Text>
                  </View>
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabel}>Subtotal</Text>
                    <Text style={styles.orderModalValue}>
                      {formatPrice(selectedOrder.total)}
                    </Text>
                  </View>
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabel}>Shipping</Text>
                    <Text style={styles.orderModalValue}>₦1,500</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabelBold}>Total</Text>
                    <Text style={styles.orderModalTotalValue}>
                      {formatPrice(selectedOrder.total + 1500)}
                    </Text>
                  </View>
                </View>

                {/* Need Help Section */}
                <View style={[styles.orderModalSection, styles.helpSection]}>
                  <Text style={styles.helpTitle}>
                    Need help with this order?
                  </Text>
                  <Text style={styles.helpText}>
                    Contact our support team for assistance with your order
                  </Text>
                  <TouchableOpacity
                    style={styles.contactUsButton}
                    onPress={handleContactUs}
                  >
                    <Text style={styles.contactUsButtonText}>Contact Us</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles (Updated with refresh button style) ---
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
    width: 32,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#fff",
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  // Added style for refresh button
  refreshButton: {
    flex: 0.8, // Make it slightly smaller than the other buttons
  },
  filterButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  ordersCount: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ordersCountText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderItems: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  orderProducts: {
    fontSize: 13,
    color: "#333",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e91e63",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#e91e63",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalOptionTextActive: {
    color: "#e91e63",
    fontWeight: "600",
  },
  modalOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e91e63",
  },
  orderModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  orderModalScroll: {
    paddingHorizontal: 20,
  },
  orderModalSection: {
    marginBottom: 24,
  },
  orderModalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderModalLabel: {
    fontSize: 14,
    color: "#666",
  },
  orderModalValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  orderModalLabelBold: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  orderModalTotalValue: {
    fontSize: 18,
    color: "#e91e63",
    fontWeight: "bold",
  },
  orderModalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productBullet: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  helpSection: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  contactUsButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  contactUsButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default OrdersScreen;
