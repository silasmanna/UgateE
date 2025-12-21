import {
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react-native";
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ContactModal = ({ visible, onClose }) => {
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
      label: "WhatsApp",
      value: "+234 803 856 4903",
      icon: MessageCircle,
      color: "#25D366",
      action: () => Linking.openURL("https://wa.me/2348038564903"),
    },
    {
      id: "3",
      label: "Email Us",
      value: "service@allwecure.com",
      icon: Mail,
      color: "#2196F3",
      action: () => Linking.openURL("mailto:service@allwecure.com"),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Contact Support</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Our support team is typically available Monday - Friday, 9am to
              5pm.
            </Text>

            {/* Contact Options */}
            {contactMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={styles.contactItem}
                  onPress={() => {
                    method.action();
                    onClose();
                  }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${method.color}15` },
                    ]}
                  >
                    <IconComponent size={22} color={method.color} />
                  </View>

                  <View style={styles.contactTextContainer}>
                    <Text style={styles.methodLabel}>{method.label}</Text>
                    <Text style={styles.methodValue}>{method.value}</Text>
                  </View>

                  <ChevronRight size={20} color="#CCC" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Close Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  methodValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  cancelButton: {
    marginHorizontal: 20,
    backgroundColor: "#f5f5f5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ContactModal;
