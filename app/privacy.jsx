import { useRouter } from "expo-router";
import { ArrowLeft, Shield } from "lucide-react-native";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PrivacyPolicyScreen = () => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro Section */}
        <View style={styles.introSection}>
          <View style={styles.iconContainer}>
            <Shield size={48} color="#2196F3" />
          </View>
          <Text style={styles.companyName}>
            Allwecure Pharmaceutical Limited
          </Text>
          <Text style={styles.introText}>
            We are a licensed business-to-business (B2B) pharmaceutical
            distributor operating an e-commerce platform for the supply of
            pharmaceutical and healthcare products to registered and authorized
            business customers only.
          </Text>
          <Text style={styles.introSubtext}>
            This Privacy Policy explains how we collect, use, store, disclose,
            and protect personal and business-related information in compliance
            with the Nigeria Data Protection Regulation (NDPR) and other
            applicable Nigerian laws.
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
            <Text style={styles.sectionTitle}>Scope of This Policy</Text>
            <Text style={styles.paragraph}>
              This Privacy Policy applies to:
            </Text>
            <Text style={styles.bulletPoint}>• Visitors to our website</Text>
            <Text style={styles.bulletPoint}>
              • Registered business customers
            </Text>
            <Text style={styles.bulletPoint}>
              • Authorized representatives of pharmacies, hospitals, clinics,
              wholesalers, and healthcare providers
            </Text>
            <Text style={styles.bulletPoint}>
              • Any interaction with our B2B e-commerce platform and related
              services
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>2.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>

            <Text style={styles.subTitle}>
              a. Personal and Business Information
            </Text>
            <Text style={styles.paragraph}>
              We may collect the following information from authorized business
              representatives:
            </Text>
            <Text style={styles.bulletPoint}>• Full name</Text>
            <Text style={styles.bulletPoint}>
              • Business name and registration details
            </Text>
            <Text style={styles.bulletPoint}>
              • Professional role or job title
            </Text>
            <Text style={styles.bulletPoint}>
              • Business email address and phone number
            </Text>
            <Text style={styles.bulletPoint}>
              • Billing and delivery address
            </Text>
            <Text style={styles.bulletPoint}>• Account login credentials</Text>
            <Text style={styles.bulletPoint}>
              • Payment and transaction records
            </Text>

            <Text style={styles.subTitle}>
              b. Regulatory and Compliance Information
            </Text>
            <Text style={styles.paragraph}>
              To meet regulatory and operational requirements, we may collect:
            </Text>
            <Text style={styles.bulletPoint}>
              • Business and professional license details
            </Text>
            <Text style={styles.bulletPoint}>
              • Customer verification and due diligence records
            </Text>
            <Text style={styles.bulletPoint}>
              • Order, warehousing, and distribution records
            </Text>

            <Text style={styles.subTitle}>c. Technical Information</Text>
            <Text style={styles.bulletPoint}>• IP address</Text>
            <Text style={styles.bulletPoint}>
              • Browser and device information
            </Text>
            <Text style={styles.bulletPoint}>• Website usage data</Text>
            <Text style={styles.bulletPoint}>
              • Cookies and similar technologies
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>3.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use collected information strictly for legitimate B2B and
              compliance purposes, including:
            </Text>
            <Text style={styles.bulletPoint}>
              • Creating and managing customer accounts
            </Text>
            <Text style={styles.bulletPoint}>
              • Verifying eligibility to purchase pharmaceutical products
            </Text>
            <Text style={styles.bulletPoint}>
              • Processing orders, payments, warehousing, and delivery
            </Text>
            <Text style={styles.bulletPoint}>
              • Managing inventory and supply logistics
            </Text>
            <Text style={styles.bulletPoint}>
              • Communicating order updates and service notices
            </Text>
            <Text style={styles.bulletPoint}>
              • Preventing fraud, misuse, and unauthorized access
            </Text>
            <Text style={styles.bulletPoint}>
              • Complying with legal, regulatory, and record-keeping obligations
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>4.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Legal Basis for Processing</Text>
            <Text style={styles.paragraph}>
              We process personal data under the following legal bases in line
              with the NDPR:
            </Text>
            <Text style={styles.bulletPoint}>• Performance of a contract</Text>
            <Text style={styles.bulletPoint}>
              • Compliance with legal and regulatory obligations
            </Text>
            <Text style={styles.bulletPoint}>
              • Legitimate business interests
            </Text>
            <Text style={styles.bulletPoint}>• Consent, where required</Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>5.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Cookies and Website Usage</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar technologies to improve website
              functionality and user experience. You may manage cookies through
              your browser settings; however, disabling cookies may affect site
              performance.
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>6.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Sharing and Disclosure of Information
            </Text>
            <Text style={styles.paragraph}>
              We do not sell personal data. Information may be shared only where
              necessary with:
            </Text>
            <Text style={styles.bulletPoint}>
              • Logistics and delivery partners
            </Text>
            <Text style={styles.bulletPoint}>
              • Payment processors and financial institutions
            </Text>
            <Text style={styles.bulletPoint}>
              • IT, hosting, and cloud service providers
            </Text>
            <Text style={styles.bulletPoint}>
              • Regulatory or lawful authorities where required by law
            </Text>
            <Text style={styles.paragraph}>
              All third parties are required to protect information in
              accordance with applicable data protection laws.
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>7.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Data Storage and Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational measures to
              protect personal data against unauthorized access, loss, misuse,
              or alteration. While reasonable safeguards are applied, no system
              is completely secure.
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>8.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <Text style={styles.paragraph}>
              Personal and business information is retained only for as long as
              necessary to fulfill the purposes outlined in this policy or as
              required by Nigerian law and regulatory obligations.
            </Text>
          </View>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>9.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Data Subject Rights</Text>
            <Text style={styles.paragraph}>
              Under the Nigeria Data Protection Regulation (NDPR), you have the
              right to:
            </Text>
            <Text style={styles.bulletPoint}>
              • Be informed about data processing activities
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal data</Text>
            <Text style={styles.bulletPoint}>
              • Request correction of inaccurate data
            </Text>
            <Text style={styles.bulletPoint}>
              • Request deletion of personal data, subject to legal limitations
            </Text>
            <Text style={styles.bulletPoint}>
              • Object to or restrict certain processing activities
            </Text>
            <Text style={styles.bulletPoint}>
              • Withdraw consent where processing is based on consent
            </Text>
            <Text style={styles.bulletPoint}>
              • Lodge a complaint with the Nigeria Data Protection Commission
              (NDPC)
            </Text>
          </View>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>10.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Geographic Scope of Operations
            </Text>
            <Text style={styles.paragraph}>
              Allwecure currently operates within Lagos State and Ogun State.
              Our licensed warehouse is located at No. 22, Simbiat Abiola Way,
              Ikeja, Lagos State, Nigeria.
            </Text>
          </View>
        </View>

        {/* Section 11 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>11.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Third-Party Links</Text>
            <Text style={styles.paragraph}>
              Our website may contain links to third-party platforms such as
              payment or logistics services. We are not responsible for the
              privacy practices of those third parties.
            </Text>
          </View>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>12.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Our services are strictly for business use and are not directed at
              individuals under the age of 18. We do not knowingly collect
              personal data from children.
            </Text>
          </View>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>13.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>
              Changes to This Privacy Policy
            </Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on our website with an updated effective date.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <Text style={styles.contactText}>
            For questions or requests relating to this Privacy Policy, please
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

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            This Privacy Policy is governed by the laws of the Federal Republic
            of Nigeria, including the Nigeria Data Protection Regulation (NDPR).
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
    backgroundColor: "#E3F2FD",
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
  introSubtext: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  effectiveDateBadge: {
    backgroundColor: "#2196F3",
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
    color: "#2196F3",
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
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
    marginBottom: 8,
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
  contactSection: {
    backgroundColor: "#E3F2FD",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
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
  footerNote: {
    backgroundColor: "#FFF3E0",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  footerText: {
    fontSize: 13,
    color: "#E65100",
    fontStyle: "italic",
    lineHeight: 18,
  },
  bottomPadding: {
    height: 20,
  },
});

export default PrivacyPolicyScreen;
