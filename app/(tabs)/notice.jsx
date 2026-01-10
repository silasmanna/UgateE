import {
  Calendar,
  ChevronDown,
  Filter,
  MessageSquare,
  RefreshCw,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useAuth } from "../../contexts/AuthContext";

// Helper function updated to include buyerNote
const mapApiOrderToLocalOrder = (apiOrder) => {
  const statusMapping = {
    PENDING: "Unpaid",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Completed",
    CANCELLED: "Cancelled",
  };

  const status =
    statusMapping[apiOrder.paymentStatus] ||
    apiOrder.paymentStatus ||
    apiOrder.status;

  const productsList = (apiOrder.items || []).map((item) => {
    if (item.name && item.name.trim().length > 0) {
      return item.name;
    }
    return item.productId
      ? `Product ID: ${item.productId}`
      : `Item ID: ${item.itemId || "Unknown"}`;
  });

  return {
    id: apiOrder.orderId,
    orderNumber: apiOrder.orderNumber,
    date: apiOrder.date,
    total: apiOrder.total || 0,
    status: status,
    items: (apiOrder.items || []).length,
    products: productsList,
    fullItems: apiOrder.items || [],
    buyerNote: apiOrder.buyerNote || null,
    shippingAddress: apiOrder.shippingAddress || null,
  };
};

const OrdersScreen = () => {
  const { orders, isLoadingOrders, ordersError, fetchOrders, cancelOrder } =
    useAuth();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All Time");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add ref for ScrollView
  const scrollViewRef = useRef(null);

  // Fetch orders on mount
  useEffect(() => {
    if (orders.length === 0 && !isLoadingOrders && !ordersError) {
      fetchOrders();
    }
  }, []);

  // Transform API orders to local format
  const allOrders = orders ? orders.map(mapApiOrderToLocalOrder) : [];

  // Filter orders based on current filters
  const getFilteredOrders = useCallback(() => {
    let filtered = [...allOrders];

    // Apply status filter
    if (selectedFilter !== "All") {
      filtered = filtered.filter((order) => order.status === selectedFilter);
    }

    // Apply date filter
    if (selectedDateRange !== "All Time") {
      filtered = filtered.filter((order) => {
        if (!order.date) return false;

        const orderDate = new Date(order.date);
        const now = new Date();
        const diffDays = Math.floor(
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (selectedDateRange) {
          case "Last 7 Days":
            return diffDays <= 7;
          case "Last 30 Days":
            return diffDays <= 30;
          case "Last 3 Months":
            return diffDays <= 90;
          case "Last 6 Months":
            return diffDays <= 180;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allOrders, selectedFilter, selectedDateRange]);

  const filteredOrders = getFilteredOrders();
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / itemsPerPage) || 1;

  // Get current page of orders
  const getCurrentPageOrders = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const currentPageOrders = getCurrentPageOrders();

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedFilter, selectedDateRange]);

  const handleRefreshOrders = async () => {
    setIsRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    }
  };

  const handleCancelOrder = (Id) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        {
          text: "No, Keep Order",
          style: "cancel",
        },
        {
          text: "Yes, Cancel Order",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              const result = await cancelOrder(Id);
              setShowOrderModal(false);
              Alert.alert(
                "Success",
                result.message || "Order cancelled successfully"
              );
              // Refresh orders after cancellation
              await fetchOrders();
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "Failed to cancel order. Please try again."
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const orderStatuses = [
    "All",
    "Unpaid",
    "Shipped",
    "Processing",
    "Completed",
    "Cancelled",
  ];
  const dateRanges = [
    "All Time",
    "Last 7 Days",
    "Last 30 Days",
    "Last 3 Months",
    "Last 6 Months",
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Unpaid":
        return "#FF5252";
      case "Shipped":
        return "#FF9800";
      case "Processing":
        return "#2196F3";
      case "Completed":
        return "#4CAF50";
      case "Cancelled":
        return "#000";
      default:
        return "#999";
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Unpaid":
        return "#FFEBEE";
      case "Shipped":
        return "#FFF3E0";
      case "Processing":
        return "#E3F2FD";
      case "Completed":
        return "#E8F5E9";
      case "Cancelled":
        return "#E8F5E9";
      default:
        return "#F5F5F5";
    }
  };

  const formatPrice = (price) => {
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

  // Helper to get first image from item
  const getItemImage = (item) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
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
          {totalOrders} {totalOrders === 1 ? "Order" : "Orders"}
          {totalPages > 1 && (
            <Text style={styles.paginationInfo}>
              {" "}
              (Page {currentPage} of {totalPages})
            </Text>
          )}
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
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {currentPageOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No orders found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.ordersList}>
                {currentPageOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[
                      styles.orderCard,
                      { borderLeftColor: getStatusColor(order.status) },
                    ]}
                    onPress={() => handleOrderClick(order)}
                  >
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderId}>
                          Order No. {order.orderNumber}
                        </Text>
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

                    {/* Product Images Preview */}
                    {order.fullItems && order.fullItems.length > 0 && (
                      <View style={styles.productImagesPreview}>
                        {order.fullItems.slice(0, 3).map((item, index) => {
                          const imageUrl = getItemImage(item);
                          return (
                            <View
                              key={item.itemId || index}
                              style={[
                                styles.productImageWrapper,
                                index > 0 && { marginLeft: -8 },
                              ]}
                            >
                              {imageUrl ? (
                                <Image
                                  source={{ uri: imageUrl }}
                                  style={styles.productImagePreview}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={styles.productImagePlaceholder}>
                                  <Text style={styles.placeholderEmoji}>
                                    💊
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                        {order.fullItems.length > 3 && (
                          <View style={styles.moreImagesIndicator}>
                            <Text style={styles.moreImagesText}>
                              +{order.fullItems.length - 3}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    <View style={styles.orderDetails}>
                      <Text style={styles.orderItems}>
                        {order.items} {order.items === 1 ? "item" : "items"}
                      </Text>
                      <Text style={styles.orderProducts} numberOfLines={1}>
                        {order.products.join(", ")}
                      </Text>
                    </View>

                    <View style={styles.orderFooter}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalAmount}>
                        {formatPrice(order.total)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Pagination Controls */}
              {totalOrders > 0 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingOrders}
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
                            onPress={() => handlePageChange(page)}
                            disabled={isLoadingOrders}
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
                    onPress={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoadingOrders}
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
                    <Text style={styles.orderModalLabel}>Order Number</Text>
                    <Text style={styles.orderModalValue}>
                      {selectedOrder.orderNumber}
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

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <View style={styles.orderModalSection}>
                    <Text style={styles.orderModalSectionTitle}>
                      Shipping Address
                    </Text>
                    <View style={styles.addressContainer}>
                      <Text style={styles.addressText}>
                        {selectedOrder.shippingAddress}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Buyer Note */}
                {selectedOrder.buyerNote && (
                  <View style={styles.orderModalSection}>
                    <Text style={styles.orderModalSectionTitle}>
                      Buyer's Note
                    </Text>
                    <View style={styles.buyerNoteContainer}>
                      <MessageSquare
                        size={16}
                        color="#666"
                        style={styles.noteIcon}
                      />
                      <Text style={styles.buyerNoteText}>
                        {selectedOrder.buyerNote}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Products with Images */}
                <View style={styles.orderModalSection}>
                  <Text style={styles.orderModalSectionTitle}>Products</Text>
                  {selectedOrder.fullItems &&
                    selectedOrder.fullItems.map((item, index) => {
                      const imageUrl = getItemImage(item);
                      return (
                        <View
                          key={item.itemId || index}
                          style={styles.productItemDetailed}
                        >
                          {/* Product Image */}
                          <View style={styles.productImageContainer}>
                            {imageUrl ? (
                              <Image
                                source={{ uri: imageUrl }}
                                style={styles.productImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.productImagePlaceholderLarge}>
                                <Text style={styles.placeholderEmojiLarge}>
                                  💊
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Product Details */}
                          <View style={styles.productInfo}>
                            <Text style={styles.productNameDetailed}>
                              {item.name && item.name.trim().length > 0
                                ? item.name
                                : item.productId
                                ? `Product ID: ${item.productId}`
                                : `Item ID: ${item.itemId || "Unknown"}`}
                            </Text>
                            <Text style={styles.productQuantity}>
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </Text>
                            <Text style={styles.productTotal}>
                              {formatPrice(item.total)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
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
                    <Text style={styles.orderModalValue}>Free</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.orderModalRow}>
                    <Text style={styles.orderModalLabelBold}>Total</Text>
                    <Text style={styles.orderModalTotalValue}>
                      {formatPrice(selectedOrder.total)}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons Section */}
                <View style={[styles.orderModalSection, styles.actionsSection]}>
                  {selectedOrder.status !== "Cancelled" &&
                    selectedOrder.status !== "Completed" &&
                    selectedOrder.status !== "Shipped" && (
                      <TouchableOpacity
                        style={styles.cancelOrderButton}
                        onPress={() => handleCancelOrder(selectedOrder.id)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.cancelOrderButtonText}>
                            Cancel Order
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}

                  <View style={styles.helpSectionInline}>
                    <Text style={styles.helpTitle}>
                      Need help with this order?
                    </Text>
                    <Text style={styles.helpText}>
                      Contact our support team for assistance
                    </Text>
                    <TouchableOpacity
                      style={styles.contactUsButton}
                      onPress={handleContactUs}
                    >
                      <Text style={styles.contactUsButtonText}>Contact Us</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    width: 32,
  },
  actionsSection: {
    marginBottom: 20,
  },
  cancelOrderButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelOrderButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  helpSectionInline: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
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
  refreshButton: {
    flex: 0.8,
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
  paginationInfo: {
    color: "#999",
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
  // Product Images Preview Styles
  productImagesPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productImageWrapper: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  productImagePreview: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  productImagePlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  moreImagesIndicator: {
    width: 48,
    height: 48,
    backgroundColor: "#e91e63",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  moreImagesText: {
    color: "#fff",
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
  // Detailed Product Item with Image
  productItemDetailed: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  productImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholderLarge: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmojiLarge: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productNameDetailed: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productTotal: {
    fontSize: 14,
    color: "#e91e63",
    fontWeight: "bold",
  },
  addressContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
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
  buyerNoteContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  noteIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  buyerNoteText: {
    flex: 1,
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
    lineHeight: 20,
  },
  // Pagination styles - UPDATED with green theme
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
    backgroundColor: "#50C878", // Changed to green
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
    backgroundColor: "#50C878", // Changed to green
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

export default OrdersScreen;
