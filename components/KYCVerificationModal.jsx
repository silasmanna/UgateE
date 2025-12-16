import { useRouter } from "expo-router";
import { AlertCircle, FileText, ShieldCheck, X } from "lucide-react-native";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const KYCVerificationModal = ({ visible, onClose, userType }) => {
  const router = useRouter();

  const kycRequirements = {
    patent: {
      title: "Patent Medicine Vendor Verification",
      icon: "🏪",
      color: "#FF9800",
      documents: [
        "Patent Certificate",
        "CAC Certificate",
        "Establishment Photos",
      ],
      benefits: [
        "Access to approved products for patent stores",
        "Purchase prescription medications",
        "Exclusive patent store products",
      ],
    },
    pharmacist: {
      title: "Licensed Pharmacy Verification",
      icon: "🏥",
      color: "#4CAF50",
      documents: [
        "Pharmacist License",
        "Premise License",
        "CAC Certificate",
        "Establishment Photos",
      ],
      benefits: [
        "Full access to all medications",
        "Purchase prescription-only items",
        "Priority support and processing",
      ],
    },
  };

  const config = kycRequirements[userType] || kycRequirements.patent;

  const handleContinue = () => {
    onClose();
    // Navigate to KYC form screen
    router.push("/kyc-verification");
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon and Title */}
            <View style={styles.header}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: config.color + "20" },
                ]}
              >
                <Text style={styles.iconEmoji}>{config.icon}</Text>
              </View>
              <Text style={styles.title}>{config.title}</Text>
            </View>

            {/* Warning Message */}
            <View style={styles.warningBox}>
              <AlertCircle size={20} color="#FF9800" />
              <Text style={styles.warningText}>
                Your account requires verification to access prescription
                medications
              </Text>
            </View>

            {/* Required Documents */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={20} color={config.color} />
                <Text style={styles.sectionTitle}>Required Documents</Text>
              </View>
              {config.documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.documentText}>{doc}</Text>
                </View>
              ))}
            </View>

            {/* Benefits */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ShieldCheck size={20} color={config.color} />
                <Text style={styles.sectionTitle}>Verification Benefits</Text>
              </View>
              {config.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.continueButton,
                  { backgroundColor: config.color },
                ]}
                onPress={handleContinue}
              >
                <ShieldCheck size={20} color="#fff" />
                <Text style={styles.continueButtonText}>
                  Continue to Verification
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimer}>
              Note: Without verification, you'll have limited access similar to
              a regular user account.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#e65100",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#666",
    marginRight: 12,
  },
  documentText: {
    fontSize: 14,
    color: "#666",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 8,
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
    marginRight: 12,
    fontWeight: "bold",
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});

export default KYCVerificationModal;
