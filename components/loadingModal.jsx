// LoadingModal.js
// Place this in your components folder

import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

const LoadingModal = ({ visible, message = "Loading..." }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default LoadingModal;

// ====================================
// USAGE EXAMPLE:
// ====================================

// 1. Import the component
// import LoadingModal from './components/LoadingModal';

// 2. Add state for loading
// const [isLoading, setIsLoading] = useState(false);

// 3. Add the component to your JSX
// <LoadingModal visible={isLoading} message="Please wait..." />

// 4. Use it in your functions
// const handleSubmit = async () => {
//   setIsLoading(true);
//   try {
//     await someAsyncOperation();
//   } catch (error) {
//     console.error(error);
//   } finally {
//     setIsLoading(false);
//   }
// };

// ====================================
// DIFFERENT VARIATIONS:
// ====================================

// With custom message:
// <LoadingModal visible={isLoading} message="Adding to cart..." />

// Simple loading (default message):
// <LoadingModal visible={isLoading} />

// ====================================
// ADVANCED LOADING MODAL WITH SPINNER VARIATIONS:
// ====================================

export const LoadingModalWithSpinner = ({
  visible,
  message = "Loading...",
  spinnerColor = "#50C878",
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* You can customize the spinner here */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={spinnerColor} />
          </View>
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

// ====================================
// LOADING MODAL WITH PROGRESS TEXT:
// ====================================

export const LoadingModalWithProgress = ({
  visible,
  message = "Loading...",
  progress = null,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>{message}</Text>
          {progress && <Text style={styles.progressText}>{progress}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const progressStyles = StyleSheet.create({
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  spinnerContainer: {
    marginBottom: 8,
  },
});
