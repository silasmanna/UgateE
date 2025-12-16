import { useRouter } from "expo-router";
import { ArrowLeft, PackageX } from "lucide-react-native";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ReturnsAndReplacementScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Returns Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro Section */}
        <View style={styles.introSection}>
          <View style={styles.iconContainer}>
            <PackageX size={48} color="#FF9800" />
          </View>
          <Text style={styles.companyName}>Returns and Replacement Policy</Text>
          <Text style={styles.introText}>
            Allwecure Pharmaceutical Limited is a licensed B2B pharmaceutical
            distributor operating within Lagos State and Ogun State. This policy
            explains how returns, replacements, and related issues are handled
            on our platform.
          </Text>
          <Text style={styles.noticeText}>
            This policy should be read together with our Terms and Conditions.
          </Text>
          <View style={styles.effectiveDateBadge}>
            <Text style={styles.effectiveDateText}>
              Effective Date: 15/12/2025
            </Text>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Important Notice</Text>
          <Text style={styles.warningPoint}>
            • Allwecure is not a manufacturer of the products supplied.
          </Text>
          <Text style={styles.warningPoint}>
            • Due to the regulated nature of pharmaceutical products, strict
            controls apply to returns and replacements.
          </Text>
          <Text style={styles.warningPoint}>
            • Customers are advised to carefully inspect all products at the
            point of delivery.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>1.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>No Refund Policy</Text>
            <Text style={styles.paragraph}>
              • All products are non-refundable once delivered in good
              condition.
            </Text>
            <Text style={styles.paragraph}>
              • Once products have been received, inspected, and accepted by the
              customer, they cannot be returned for refund, exchange, or credit.
            </Text>
            <Text style={styles.paragraph}>
              • This applies to all orders, including those paid in advance or
              paid on delivery.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>2.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Inspection at Delivery</Text>
            <Text style={styles.paragraph}>
              • Customers must inspect products immediately upon delivery.
            </Text>
            <Text style={styles.paragraph}>
              • Inspection should cover quantity, packaging condition, and
              product description.
            </Text>
            <Text style={styles.paragraph}>
              • Signing or accepting delivery confirms that products were
              received in acceptable condition.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>3.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Eligible Replacement Cases</Text>
            <Text style={styles.paragraph}>
              Allwecure will provide a replacement (not a refund) only in the
              following circumstances:
            </Text>
            <Text style={styles.bulletPoint}>
              • Products are delivered damaged
            </Text>
            <Text style={styles.bulletPoint}>
              • Products are incorrect or do not match the order
            </Text>
            <Text style={styles.bulletPoint}>
              • Products are affected during transit before delivery
            </Text>
            <Text style={styles.noteText}>
              All replacement requests are subject to verification by Allwecure.
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>4.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Replacement Conditions</Text>
            <Text style={styles.paragraph}>To qualify for replacement:</Text>
            <Text style={styles.bulletPoint}>
              • Products must be unused, unopened, and in original packaging.
            </Text>
            <Text style={styles.bulletPoint}>
              • The issue must be reported immediately at delivery or within a
              reasonable time approved by Allwecure.
            </Text>
            <Text style={styles.bulletPoint}>
              • Photographic or physical evidence may be required.
            </Text>
            <Text style={styles.bulletPoint}>
              • Products must not have been stored, altered, or resold after
              delivery.
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>5.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Excluded Items</Text>
            <Text style={styles.paragraph}>
              The following are not eligible for return or replacement:
            </Text>
            <Text style={styles.bulletPoint}>
              • Products received in good condition
            </Text>
            <Text style={styles.bulletPoint}>
              • Products damaged due to improper storage or handling after
              delivery
            </Text>
            <Text style={styles.bulletPoint}>
              • Products returned without prior approval
            </Text>
            <Text style={styles.bulletPoint}>
              • Products with tampered packaging or broken seals
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>6.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Manufacturer Responsibility</Text>
            <Text style={styles.paragraph}>
              • Product quality, formulation, efficacy, and warranties are the
              sole responsibility of the manufacturer.
            </Text>
            <Text style={styles.paragraph}>
              • Allwecure does not provide manufacturer warranties or guarantees
              on supplied products.
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>7.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Delivery Coverage</Text>
            <Text style={styles.paragraph}>
              • Free delivery is currently provided within Lagos State and Ogun
              State.
            </Text>
            <Text style={styles.paragraph}>
              • Replacement deliveries, where approved, will also be made at no
              additional delivery cost.
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>8.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Discretion and Compliance</Text>
            <Text style={styles.paragraph}>
              • Allwecure reserves the right to approve or reject replacement
              requests.
            </Text>
            <Text style={styles.paragraph}>
              • This policy is applied in compliance with Nigerian
              pharmaceutical distribution regulations and PCN guidelines.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>
            Contact for Replacement Requests
          </Text>
          <Text style={styles.contactText}>
            For replacement requests or questions regarding this policy, please
            contact:
          </Text>
          <View style={styles.contactDetails}>
            <Text style={styles.contactDetail}>
              <Text style={styles.contactLabel}>Company: </Text>
              Allwecure Pharmaceutical Nigeria Limited
            </Text>
            <Text style={styles.contactDetail}>
              <Text style={styles.contactLabel}>Warehouse Address: </Text>
              No. 22, Simbiat Abiola Way, Ikeja, Lagos State, Nigeria
            </Text>
            <Text style={styles.contactDetail}>
              <Text style={styles.contactLabel}>Service Areas: </Text>
              Lagos State and Ogun State
            </Text>
            <Text style={styles.contactDetail}>
              <Text style={styles.contactLabel}>Email: </Text>
              service@allwecure.com
            </Text>
          </View>
        </View>

        {/* Key Reminders */}
        <View style={styles.reminderSection}>
          <Text style={styles.reminderTitle}>📋 Key Reminders</Text>
          <Text style={styles.reminderPoint}>
            ✓ Inspect all products immediately upon delivery
          </Text>
          <Text style={styles.reminderPoint}>
            ✓ Report any issues before accepting delivery
          </Text>
          <Text style={styles.reminderPoint}>
            ✓ Keep products in original packaging
          </Text>
          <Text style={styles.reminderPoint}>
            ✓ All sales are final once accepted
          </Text>
          <Text style={styles.reminderPoint}>
            ✓ Replacements only - no refunds
          </Text>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
  scrollContent: {
    paddingBottom: 40,
  },
  introSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 16,
  },
  effectiveDateBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  effectiveDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  warningSection: {
    backgroundColor: "#FFEBEE",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#e91e63",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c62828",
    marginBottom: 12,
  },
  warningPoint: {
    fontSize: 14,
    color: "#c62828",
    lineHeight: 20,
    marginBottom: 8,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800",
    marginRight: 12,
    marginTop: 2,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 4,
    paddingLeft: 8,
  },
  noteText: {
    fontSize: 13,
    color: "#FF9800",
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 18,
  },
  contactSection: {
    backgroundColor: "#FFF3E0",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  contactDetails: {
    gap: 8,
  },
  contactDetail: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  contactLabel: {
    fontWeight: "600",
    color: "#000",
  },
  reminderSection: {
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
  },
  reminderPoint: {
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 22,
    marginBottom: 6,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ReturnsAndReplacementScreen;
