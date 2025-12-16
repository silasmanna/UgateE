import { useRouter } from "expo-router";
import { ArrowLeft, FileText } from "lucide-react-native";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TermsAndConditionsScreen = () => {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro Section */}
        <View style={styles.introSection}>
          <View style={styles.iconContainer}>
            <FileText size={48} color="#50C878" />
          </View>
          <Text style={styles.companyName}>
            Allwecure Pharmaceutical Nigeria Limited
          </Text>
          <Text style={styles.introText}>
            These Terms and Conditions govern access to and use of our website,
            services, and products. By accessing our platform, you confirm that
            you have read, understood, and agreed to be bound by these Terms.
          </Text>
          <View style={styles.effectiveDateBadge}>
            <Text style={styles.effectiveDateText}>
              Effective Date: 15/12/2025
            </Text>
          </View>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>1.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Eligibility and Account Registration
            </Text>
            <Text style={styles.paragraph}>
              • Our platform is strictly for business customers only, including
              licensed pharmacies, hospitals, clinics, wholesalers,
              distributors, and other authorized healthcare providers.
            </Text>
            <Text style={styles.paragraph}>
              • Customers must provide accurate, complete, and up-to-date
              business and licensing information during registration.
            </Text>
            <Text style={styles.paragraph}>
              • We reserve the right to verify licenses and reject, suspend, or
              terminate accounts that fail to meet regulatory or compliance
              requirements.
            </Text>
            <Text style={styles.paragraph}>
              • You are responsible for maintaining the confidentiality of your
              account credentials and for all activities conducted under your
              account.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>2.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Products and Regulatory Compliance
            </Text>
            <Text style={styles.paragraph}>
              • Allwecure Pharmaceutical Nigeria Limited is a licensed and
              approved pharmaceutical distributor and pharmacy, not a
              manufacturer of the products sold on its platform.
            </Text>
            <Text style={styles.paragraph}>
              • We are duly licensed by the Pharmacists Council of Nigeria (PCN)
              and operate in compliance with applicable pharmaceutical
              distribution laws and regulations in Nigeria.
            </Text>
            <Text style={styles.paragraph}>
              • Product manufacturing, formulation, and warranties are the sole
              responsibility of the respective manufacturers.
            </Text>
            <Text style={styles.paragraph}>
              • Allwecure does not provide any manufacturer's warranty on
              products supplied.
            </Text>
            <Text style={styles.paragraph}>
              • Certain products may only be supplied to customers holding valid
              professional or business licenses.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>3.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Orders and Acceptance</Text>
            <Text style={styles.paragraph}>
              • Orders placed through our platform constitute an offer to
              purchase and are subject to acceptance by Allwecure.
            </Text>
            <Text style={styles.paragraph}>
              • We reserve the right to accept, reject, or cancel orders at our
              discretion, including where regulatory compliance cannot be
              verified.
            </Text>
            <Text style={styles.paragraph}>
              • An order is deemed accepted only when confirmed by us and
              prepared for dispatch.
            </Text>
            <Text style={styles.paragraph}>
              • Prices, availability, and product listings are subject to change
              without prior notice.
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>4.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Pricing and Payment</Text>
            <Text style={styles.paragraph}>
              • All prices are stated in Nigerian Naira unless otherwise
              indicated.
            </Text>
            <Text style={styles.paragraph}>
              • Delivery is currently provided free of charge to customers
              within our approved service areas.
            </Text>
            <Text style={styles.paragraph}>
              • We accept advance payment prior to dispatch and/or payment on
              delivery (POD), subject to eligibility and internal approval.
            </Text>
            <Text style={styles.paragraph}>
              • Orders may be withheld from dispatch until payment conditions
              are satisfied.
            </Text>
            <Text style={styles.paragraph}>
              • We reserve the right to change payment options or require
              advance payment for specific customers, orders, or products.
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>5.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Warehousing, Storage, and Supply
            </Text>
            <Text style={styles.paragraph}>
              • Allwecure stores pharmaceutical products in its licensed
              warehouse located at No. 22, Simbiat Abiola Way, Ikeja, Lagos
              State, under appropriate storage and handling conditions.
            </Text>
            <Text style={styles.paragraph}>
              • Products are managed in accordance with applicable
              pharmaceutical storage, safety, and traceability requirements.
            </Text>
            <Text style={styles.paragraph}>
              • Title and risk in products shall pass to the customer upon
              successful delivery, unless otherwise agreed in writing.
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>6.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Delivery and Inspection</Text>
            <Text style={styles.paragraph}>
              • Allwecure currently operates and delivers orders within Lagos
              State and Ogun State.
            </Text>
            <Text style={styles.paragraph}>
              • Delivery timelines are estimates and may be affected by traffic,
              weather, regulatory inspections, or operational factors.
            </Text>
            <Text style={styles.paragraph}>
              • Customers must ensure delivery locations are accurate and
              accessible.
            </Text>
            <Text style={styles.paragraph}>
              • Upon delivery, customers must promptly inspect products and
              notify us of any shortages, damages, or discrepancies within a
              reasonable time.
            </Text>
            <Text style={styles.paragraph}>
              • Failure to report issues within the specified period may be
              deemed acceptance of the delivery.
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>7.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Returns, Cancellations, and Refunds
            </Text>
            <Text style={styles.paragraph}>
              • Due to the regulated nature of pharmaceutical products and the
              fact that Allwecure is not the manufacturer, all products are
              non-refundable once delivered in good condition.
            </Text>
            <Text style={styles.paragraph}>
              • Customers are required to inspect products immediately upon
              delivery.
            </Text>
            <Text style={styles.paragraph}>
              • Where products are delivered damaged, defective, or incorrect,
              Allwecure will arrange a replacement of the affected items,
              subject to verification.
            </Text>
            <Text style={styles.paragraph}>
              • Products eligible for replacement must be unused, unopened, and
              in their original packaging.
            </Text>
            <Text style={styles.paragraph}>
              • Refunds will only be considered where replacement is not
              reasonably possible and at Allwecure's sole discretion.
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>8.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Product Recalls and Safety Notices
            </Text>
            <Text style={styles.paragraph}>
              • Customers agree to cooperate with Allwecure in the event of a
              product recall or safety notice.
            </Text>
            <Text style={styles.paragraph}>
              • We may require customers to cease distribution, quarantine
              products, or return affected stock in line with regulatory
              instructions.
            </Text>
          </View>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>9.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Intellectual Property</Text>
            <Text style={styles.paragraph}>
              All content on our website, including text, logos, trademarks,
              images, and software, is the property of Allwecure or its
              licensors and may not be used without prior written consent.
            </Text>
          </View>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>10.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Prohibited Use</Text>
            <Text style={styles.paragraph}>You agree not to:</Text>
            <Text style={styles.paragraph}>
              • Use the platform for unlawful or unauthorized purposes
            </Text>
            <Text style={styles.paragraph}>
              • Misrepresent licensing or regulatory status
            </Text>
            <Text style={styles.paragraph}>
              • Attempt to interfere with platform security or operations
            </Text>
            <Text style={styles.paragraph}>
              • Resell products in violation of applicable laws or regulations
            </Text>
          </View>
        </View>

        {/* Section 11 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>11.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              • All products are supplied "as received" from manufacturers and
              authorized sources.
            </Text>
            <Text style={styles.paragraph}>
              • Allwecure makes no warranties, express or implied, regarding
              product fitness, efficacy, or merchantability, except as required
              by law.
            </Text>
            <Text style={styles.paragraph}>
              • Liability for product defects rests with the manufacturer, to
              the extent permitted by law.
            </Text>
            <Text style={styles.paragraph}>
              • To the maximum extent permitted by Nigerian law, Allwecure shall
              not be liable for indirect, incidental, or consequential losses.
            </Text>
            <Text style={styles.paragraph}>
              • Our total liability arising from any order shall not exceed the
              value of the affected order.
            </Text>
          </View>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>12.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Indemnity</Text>
            <Text style={styles.paragraph}>
              You agree to indemnify and hold harmless Allwecure against any
              claims, losses, or liabilities arising from your breach of these
              Terms or violation of applicable laws.
            </Text>
          </View>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>13.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Suspension and Termination</Text>
            <Text style={styles.paragraph}>
              We may suspend or terminate access to the platform immediately
              where:
            </Text>
            <Text style={styles.paragraph}>
              • Regulatory or licensing requirements are breached
            </Text>
            <Text style={styles.paragraph}>
              • Fraud, misuse, or unauthorized activity is suspected
            </Text>
            <Text style={styles.paragraph}>
              • Required by law or regulatory authorities
            </Text>
          </View>
        </View>

        {/* Section 14 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>14.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Governing Law and Jurisdiction
            </Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and interpreted in accordance
              with the laws of the Federal Republic of Nigeria. Nigerian courts
              shall have exclusive jurisdiction over any disputes.
            </Text>
          </View>
        </View>

        {/* Section 15 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>15.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Changes to These Terms</Text>
            <Text style={styles.paragraph}>
              We may update these Terms from time to time. Updated versions will
              be posted on our website with a revised effective date.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <Text style={styles.contactText}>
            For questions regarding these Terms, please contact:
          </Text>
          <View style={styles.contactDetails}>
            <Text style={styles.contactDetail}>
              <Text style={styles.contactLabel}>Company: </Text>
              Allwecure Pharmaceutical Limited
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
    backgroundColor: "#E8F5E9",
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
    marginBottom: 16,
  },
  effectiveDateBadge: {
    backgroundColor: "#50C878",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  effectiveDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
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
    color: "#50C878",
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
  contactSection: {
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#50C878",
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
  bottomPadding: {
    height: 20,
  },
});

export default TermsAndConditionsScreen;
