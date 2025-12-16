import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Upload,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingModal from "../components/loadingModal";
import { useAuth } from "../contexts/AuthContext";
import { uploadKYC } from "./utils/api";

const EstablishmentPhotoRequirements = [
  {
    id: "photo_near",
    name: "Establishment Photo (Near View)",
    required: true,
    description:
      "Close-up photo of the front entrance/signage of your building.",
    isPhoto: true,
    isExtraImage: true,
  },
  {
    id: "photo_back",
    name: "Establishment Photo (Slightly Back)",
    required: true,
    description:
      "Photo taken slightly further back to include the immediate surrounding context.",
    isPhoto: true,
    isExtraImage: true,
  },
  {
    id: "photo_full",
    name: "Establishment Photo (Full Front View)",
    required: true,
    description:
      "Full view of the entire front of your establishment/building.",
    isPhoto: true,
    isExtraImage: true,
  },
];

const KYCVerificationForm = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState({});

  const userType = user?.type || user?.buyer_type || user?.account_tier;

  // Document requirements based on user type with proper field mapping
  const documentRequirements = {
    patent: [
      {
        id: "PATENT_CERT",
        name: "Patent Certificate",
        required: true,
        description: "Valid patent medicine vendor certificate",
        apiField: "PATENT_CERT",
      },
      {
        id: "CAC",
        name: "CAC Certificate",
        required: true,
        description: "Corporate Affairs Commission certificate",
        apiField: "CAC",
      },
      ...EstablishmentPhotoRequirements,
    ],
    pharmacist: [
      {
        id: "PHARMACY_LICENSE",
        name: "Pharmacist License",
        required: true,
        description: "Valid pharmacist practicing license",
        apiField: "PHARMACY_LICENSE",
      },
      {
        id: "PREMISE_LICENSE",
        name: "Premise License",
        required: true,
        description: "Pharmacy premise license",
        apiField: "PREMISE_LICENSE",
      },
      {
        id: "CAC",
        name: "CAC Certificate",
        required: true,
        description: "Corporate Affairs Commission certificate",
        apiField: "CAC",
      },
      ...EstablishmentPhotoRequirements,
    ],
  };

  const requiredDocs =
    documentRequirements[userType] || documentRequirements.patent;

  const handleDocumentPick = async (docId) => {
    const isPhotoDoc = EstablishmentPhotoRequirements.some(
      (d) => d.id === docId
    );

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: isPhotoDoc ? ["image/*"] : ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.type === "success" || !result.canceled) {
        const document = result.assets ? result.assets[0] : result;

        // Check file size (max 5MB)
        if (document.size > 5 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select a file smaller than 5MB"
          );
          return;
        }

        setUploadedDocuments((prev) => ({
          ...prev,
          [docId]: {
            name: document.name,
            uri: document.uri,
            type: document.mimeType || document.type,
            size: document.size,
          },
        }));

        Alert.alert("Success", `${document.name} uploaded successfully`);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document. Please try again.");
    }
  };

  const handleRemoveDocument = (docId) => {
    Alert.alert(
      "Remove Document",
      "Are you sure you want to remove this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setUploadedDocuments((prev) => {
              const updated = { ...prev };
              delete updated[docId];
              return updated;
            });
          },
        },
      ]
    );
  };

  const validateSubmission = () => {
    const missingDocs = requiredDocs
      .filter((doc) => doc.required && !uploadedDocuments[doc.id])
      .map((doc) => doc.name);

    if (missingDocs.length > 0) {
      Alert.alert(
        "Missing Documents",
        `Please upload the following required documents:\n\n${missingDocs.join(
          "\n"
        )}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) return;

    Alert.alert(
      "Submit Verification",
      "Are you sure you want to submit your documents for verification? Our team will review them within 24-48 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setIsSubmitting(true);

            try {
              const formData = new FormData();

              // Separate extra images from main documents
              const extraImages = [];
              const mainDocuments = {};

              Object.keys(uploadedDocuments).forEach((docId) => {
                const doc = uploadedDocuments[docId];
                const docConfig = requiredDocs.find((d) => d.id === docId);

                if (docConfig?.isExtraImage) {
                  // This is an establishment photo
                  extraImages.push({
                    uri: doc.uri,
                    name: doc.name,
                    type: doc.type,
                  });
                } else {
                  // This is a main document (PATENT_CERT, CAC, etc.)
                  mainDocuments[docId] = doc;
                }
              });

              // Append main documents with their specific field names
              Object.keys(mainDocuments).forEach((docId) => {
                const doc = mainDocuments[docId];
                formData.append(docId, {
                  uri: doc.uri,
                  name: doc.name,
                  type: doc.type,
                });
              });

              // Append extra images - all with the same field name
              extraImages.forEach((image) => {
                formData.append("EXTRA_IMAGES", {
                  uri: image.uri,
                  name: image.name,
                  type: image.type,
                });
              });

              console.log("📤 Uploading KYC documents...");
              console.log("Main documents:", Object.keys(mainDocuments));
              console.log("Extra images count:", extraImages.length);

              await uploadKYC(formData);

              Alert.alert(
                "Submission Successful! ✅",
                "Your documents have been submitted successfully. Our team will review your application within 24-48 hours. You'll receive a notification once your account is verified.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.back();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Submission error:", error);
              Alert.alert(
                "Submission Failed",
                error.message || "Failed to submit documents. Please try again."
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const allDocsUploaded = requiredDocs
    .filter((doc) => doc.required)
    .every((doc) => uploadedDocuments[doc.id]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <AlertCircle size={20} color="#2196F3" />
          <Text style={styles.infoBannerText}>
            Upload clear, legible copies of your documents. Accepted formats:
            PDF, JPG, PNG (Max 5MB per file)
          </Text>
        </View>

        {/* User Type Badge */}
        <View style={styles.userTypeCard}>
          <Text style={styles.userTypeLabel}>Account Type</Text>
          <View
            style={[
              styles.userTypeBadge,
              {
                backgroundColor:
                  userType === "pharmacist" ? "#4CAF50" : "#FF9800",
              },
            ]}
          >
            <Text style={styles.userTypeBadgeText}>
              {userType === "pharmacist"
                ? "🏥 Licensed Pharmacist"
                : "🏪Patent Medicine Vendor"}
            </Text>
          </View>
        </View>

        {/* Document Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <Text style={styles.sectionSubtitle}>
            All documents marked with * are required
          </Text>

          {requiredDocs.map((doc, index) => (
            <View key={doc.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentTitleRow}>
                  <FileText
                    size={20}
                    color={uploadedDocuments[doc.id] ? "#4CAF50" : "#666"}
                  />
                  <Text style={styles.documentName}>
                    {doc.name}
                    {doc.required && <Text style={styles.required}> *</Text>}
                  </Text>
                </View>
                {uploadedDocuments[doc.id] && (
                  <CheckCircle size={20} color="#4CAF50" />
                )}
              </View>

              <Text style={styles.documentDescription}>{doc.description}</Text>

              {uploadedDocuments[doc.id] ? (
                <View style={styles.uploadedFile}>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {uploadedDocuments[doc.id].name}
                    </Text>
                    <Text style={styles.fileSize}>
                      {formatFileSize(uploadedDocuments[doc.id].size)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveDocument(doc.id)}
                    disabled={isSubmitting}
                  >
                    <X size={16} color="#e91e63" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleDocumentPick(doc.id)}
                  disabled={isSubmitting}
                >
                  <Upload size={20} color="#2196F3" />
                  <Text style={styles.uploadButtonText}>
                    {doc.isPhoto ? "Upload Photo" : "Upload Document"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Important Notes:</Text>
          <View style={styles.noteItem}>
            <Text style={styles.noteBullet}>•</Text>
            <Text style={styles.noteText}>
              Documents must be clear and all text must be legible
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteBullet}>•</Text>
            <Text style={styles.noteText}>
              Ensure all certificates are valid and not expired
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteBullet}>•</Text>
            <Text style={styles.noteText}>
              Establishment photos must clearly show the front and signage
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteBullet}>•</Text>
            <Text style={styles.noteText}>
              Verification process typically takes 24-48 hours
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Text style={styles.noteBullet}>•</Text>
            <Text style={styles.noteText}>
              You'll receive a notification once your account is verified
            </Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Upload Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (Object.keys(uploadedDocuments).length /
                      requiredDocs.filter((d) => d.required).length) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Object.keys(uploadedDocuments).length} of{" "}
            {requiredDocs.filter((d) => d.required).length} documents uploaded
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!allDocsUploaded || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!allDocsUploaded || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submitting...</Text>
            </>
          ) : (
            <>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                Submit for Verification
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <LoadingModal visible={isSubmitting} message="Uploading documents..." />
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
    paddingBottom: 120,
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#1565c0",
    lineHeight: 18,
  },
  userTypeCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userTypeLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  userTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  userTypeBadgeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  documentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  required: {
    color: "#e91e63",
  },
  documentDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2196F3",
    borderStyle: "dashed",
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
  },
  uploadedFile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
  },
  removeButton: {
    padding: 4,
  },
  notesCard: {
    backgroundColor: "#fff3e0",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e65100",
    marginBottom: 12,
  },
  noteItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  noteBullet: {
    fontSize: 14,
    color: "#e65100",
    marginRight: 8,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#e65100",
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default KYCVerificationForm;
