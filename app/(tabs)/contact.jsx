import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  HelpCircle,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Search,
  Shield,
  Truck,
} from "lucide-react-native";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpCenterScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const quickActions = [
    { id: "1", label: "Track Order", icon: Package, color: "#4CAF50" },
    { id: "2", label: "Payment Issues", icon: CreditCard, color: "#2196F3" },
    { id: "3", label: "Delivery Info", icon: Truck, color: "#FF9800" },
    { id: "4", label: "Returns", icon: RefreshCw, color: "#e91e63" },
    { id: "5", label: "Account Help", icon: Shield, color: "#9C27B0" },
    { id: "6", label: "Product Info", icon: HelpCircle, color: "#00BCD4" },
  ];

  const faqCategories = [
    {
      id: "1",
      category: "Orders & Delivery",
      faqs: [
        {
          id: "1-1",
          question: "How can I track my order?",
          answer:
            "You can track your order by going to \"My Orders\" section in your profile. Click on the specific order and you'll see real-time tracking information. You'll also receive SMS and email updates about your order status.",
        },
        {
          id: "1-2",
          question: "What are the delivery charges?",
          answer:
            "Delivery charges vary based on your location and order value. Orders above ₦10,000 qualify for free delivery within Lagos. For other locations, delivery fees range from ₦1,500 to ₦3,000.",
        },
        {
          id: "1-3",
          question: "How long does delivery take?",
          answer:
            "Delivery typically takes 2-5 business days depending on your location. Lagos orders usually arrive within 24-48 hours. Remote areas may take up to 7 business days.",
        },
        {
          id: "1-4",
          question: "Can I change my delivery address?",
          answer:
            'Yes, you can change your delivery address before the order is shipped. Go to "My Orders", select the order, and click "Change Address". Once shipped, the address cannot be modified.',
        },
      ],
    },
    {
      id: "2",
      category: "Payment & Pricing",
      faqs: [
        {
          id: "2-1",
          question: "What payment methods do you accept?",
          answer:
            "We accept credit/debit cards (Visa, Mastercard, Verve), bank transfers, mobile money, and cash on delivery for eligible orders. All payments are secure and encrypted.",
        },
        {
          id: "2-2",
          question: "Is my payment information secure?",
          answer:
            "Yes, we use industry-standard encryption to protect your payment information. We do not store your card details on our servers. All transactions are processed through secure payment gateways.",
        },
        {
          id: "2-3",
          question: "Can I get a refund if I cancel my order?",
          answer:
            "Yes, if you cancel before the order is shipped, you'll receive a full refund within 5-7 business days. For shipped orders, please refer to our return policy.",
        },
        {
          id: "2-4",
          question: "Why was my payment declined?",
          answer:
            "Payment can be declined due to insufficient funds, incorrect card details, or bank security measures. Please verify your card details and try again, or contact your bank for assistance.",
        },
      ],
    },
    {
      id: "3",
      category: "Returns & Refunds",
      faqs: [
        {
          id: "3-1",
          question: "What is your return policy?",
          answer:
            "We offer a 7-day return policy for most products. Items must be unused, in original packaging with tags intact. Medicines and personal care items are non-returnable unless defective.",
        },
        {
          id: "3-2",
          question: "How do I return a product?",
          answer:
            'Go to "My Orders", select the order, and click "Return Item". Choose the reason for return and we\'ll arrange a pickup. Once received and verified, your refund will be processed.',
        },
        {
          id: "3-3",
          question: "When will I receive my refund?",
          answer:
            "Refunds are processed within 5-7 business days after we receive and verify the returned item. The amount will be credited to your original payment method or store wallet.",
        },
        {
          id: "3-4",
          question: "What if I receive a damaged product?",
          answer:
            "If you receive a damaged or defective product, contact us immediately with photos. We'll arrange a free return pickup and provide a replacement or full refund.",
        },
      ],
    },
    {
      id: "4",
      category: "Account & Profile",
      faqs: [
        {
          id: "4-1",
          question: "How do I reset my password?",
          answer:
            'Click on "Forgot Password" on the login page. Enter your registered email and we\'ll send you a password reset link. Follow the link to create a new password.',
        },
        {
          id: "4-2",
          question: "Can I change my email address?",
          answer:
            'Yes, go to "Edit Profile" in your account settings. Enter your new email address and verify it through the confirmation email we send.',
        },
        {
          id: "4-3",
          question: "How do I delete my account?",
          answer:
            "To delete your account, go to Settings > Privacy & Security > Delete Account. Please note that this action is permanent and cannot be undone.",
        },
        {
          id: "4-4",
          question: "What are reward points and how do I earn them?",
          answer:
            "Reward points are earned on every purchase. For every ₦100 spent, you earn 1 point. 100 points = ₦100 discount on your next order. Points expire after 1 year.",
        },
      ],
    },
    {
      id: "5",
      category: "Products & Services",
      faqs: [
        {
          id: "5-1",
          question: "Are all medicines genuine?",
          answer:
            "Yes, all medicines are sourced from licensed distributors and verified pharmacies. We ensure authenticity and proper storage conditions for all pharmaceutical products.",
        },
        {
          id: "5-2",
          question: "Do I need a prescription?",
          answer:
            "Prescription medicines require a valid prescription which can be uploaded during checkout. Over-the-counter medicines do not require a prescription.",
        },
        {
          id: "5-3",
          question: "Can I pre-order out-of-stock items?",
          answer:
            "Yes, you can add out-of-stock items to your wishlist and we'll notify you when they're available. Some items can be pre-ordered with expected delivery dates.",
        },
        {
          id: "5-4",
          question: "Do you offer bulk discounts?",
          answer:
            "Yes, we offer discounts on bulk orders. Contact our sales team for wholesale pricing and special arrangements for hospitals and clinics.",
        },
      ],
    },
  ];

  const contactMethods = [
    {
      id: "1",
      label: "Call Us",
      value: "+234 803 856 4903",
      icon: Phone,
      color: "#4CAF50",
      action: () => Linking.openURL("tel:+2348038564903"),
    },
    {
      id: "2",
      label: "Email Us",
      value: "service@allwecure.com",
      icon: Mail,
      color: "#2196F3",
      action: () => Linking.openURL("mailto:support@egatee.com"),
    },
  ];

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const filteredFAQs = searchQuery
    ? faqCategories
        .map((category) => ({
          ...category,
          faqs: category.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.faqs.length > 0)
    : faqCategories;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* FAQ Categories */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? "Search Results" : "Frequently Asked Questions"}
          </Text>
          {filteredFAQs.map((category) => (
            <View key={category.id} style={styles.faqCategory}>
              <Text style={styles.categoryTitle}>{category.category}</Text>
              {category.faqs.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp size={20} color="#666" />
                    ) : (
                      <ChevronDown size={20} color="#666" />
                    )}
                  </View>
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {filteredFAQs.length === 0 && (
            <View style={styles.noResults}>
              <HelpCircle size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try different keywords
              </Text>
            </View>
          )}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Still Need Help?</Text>
          <Text style={styles.contactDescription}>
            Our support team is available 24/7 to assist you
          </Text>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactCard}
              onPress={method.action}
            >
              <View
                style={[
                  styles.contactIcon,
                  { backgroundColor: method.color + "20" },
                ]}
              >
                <method.icon size={24} color={method.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{method.label}</Text>
                <Text style={styles.contactValue}>{method.value}</Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  quickActionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "calc(33.33% - 8px)",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: "#000",
    textAlign: "center",
    fontWeight: "500",
  },
  faqSection: {
    padding: 16,
  },
  faqCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginTop: 12,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  contactSection: {
    padding: 16,
  },
  contactDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
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
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 13,
    color: "#666",
  },
  bottomIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    backgroundColor: "#2d2d2d",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorBar: {
    width: 100,
    height: 4,
    backgroundColor: "#666",
    borderRadius: 2,
  },
});

export default HelpCenterScreen;
