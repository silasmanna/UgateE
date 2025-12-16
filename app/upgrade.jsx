import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowUpCircle,
  Building2,
  MapPin,
  User,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingModal from "../components/loadingModal";
import { useAuth } from "../contexts/AuthContext";

const AccountUpgradeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Get current account tier, default to 'REGULAR'
  const currentTier = user?.account_tier || "REGULAR";

  // 💡 Define constants for tier visibility logic
  const isRegularUser = currentTier === "REGULAR";
  const isPatentUser = currentTier === "PATENT";

  const [selectedTier, setSelectedTier] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Account tier options
  const allAccountTiers = [
    {
      value: "PATENT",
      label: "Patent Medicine Vendor",
      icon: "🏪",
      color: "#FF9800",
      description: "Licensed to sell prescription medications",
    },
    {
      value: "PHARMACIST",
      label: "Licensed Pharmacy",
      icon: "🏥",
      color: "#4CAF50",
      description: "Full pharmacy license",
    },
  ];

  // 💡 Effect to automatically select PHARMACY if the user is PATENT
  useEffect(() => {
    if (isPatentUser) {
      setSelectedTier("PHARMACIST");
    } else if (isRegularUser) {
      // Clear selection if navigating back to REGULAR
      setSelectedTier("");
    }
  }, [isPatentUser, isRegularUser]);

  // Filter available tiers based on the current tier (Only used for REGULAR users)
  const availableTiers = useMemo(() => {
    if (isPatentUser) {
      // Patent user should see nothing to select, it's auto-selected
      return [];
    }
    // Regular users can upgrade to PATENT or PHARMACY
    return allAccountTiers;
  }, [isPatentUser]);

  // Fields are only required/visible for REGULAR users upgrading to the first level
  const showInputFields = isRegularUser;
  // Upgrade button should be enabled if a tier is selected OR if it's auto-selected (Patent user)
  const isUpgradeEnabled = !!selectedTier && !isLoading;

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!selectedTier) {
      newErrors.tier = "Please select an account type";
    }

    // Only validate these fields if they are required/visible (i.e., for REGULAR users)
    if (showInputFields) {
      if (!state.trim()) {
        newErrors.state = "State is required";
      }
      if (!lga.trim()) {
        newErrors.lga = "LGA is required";
      }
      if (!contactPerson.trim()) {
        newErrors.contactPerson = "Contact person is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle upgrade
  const handleUpgrade = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    const tierLabel =
      allAccountTiers.find((t) => t.value === selectedTier)?.label ||
      selectedTier;

    Alert.alert(
      "Confirm Upgrade",
      `Are you sure you want to upgrade to ${tierLabel}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Upgrade",
          style: "default",
          onPress: () => performUpgrade(),
        },
      ]
    );
  };

  const performUpgrade = async () => {
    setIsLoading(true);

    try {
      const accessToken = user?.accessToken;

      if (!accessToken) {
        throw new Error("You must be logged in to upgrade your account");
      }

      console.log("🔄 Upgrading account...");

      // Prepare payload: only include location/contact if it's a REGULAR user
      const requestBody = {
        requestedTier: selectedTier,
      };

      if (showInputFields) {
        requestBody.state = state.trim();
        requestBody.lga = lga.trim();
        requestBody.contact_person = contactPerson.trim();
      }

      const response = await fetch(
        "https://api-dev.allwecure.com/buyers/account/upgrade",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();
      console.log("📦 Upgrade response:", result);
      console.log(requestBody);
      console.log(accessToken);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Account upgrade failed. Please try again."
        );
      }

      const tierLabel =
        allAccountTiers.find((t) => t.value === selectedTier)?.label ||
        selectedTier;

      // Show success message
      Alert.alert(
        "Upgrade Successful! 🎉",
        `Your account has been upgraded to ${tierLabel}. Please log out and log back in to see the changes.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to profile
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Upgrade Error:", error);
      Alert.alert(
        "Upgrade Failed",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header (No change) */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upgrade Account</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <ArrowUpCircle
              size={32}
              color={isPatentUser ? "#4CAF50" : "#FF9800"}
            />
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Upgrade Your Account</Text>
              <Text style={styles.infoBannerText}>
                {isPatentUser
                  ? "Your next and final upgrade is to Licensed Pharmacy."
                  : "Get access to prescription medications by upgrading your account tier."}
              </Text>
            </View>
          </View>

          {/* Current Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Account</Text>
            <View style={styles.currentAccountCard}>
              <View style={styles.currentAccountRow}>
                <Text style={styles.currentAccountLabel}>Name:</Text>
                <Text style={styles.currentAccountValue}>
                  {user?.name || user?.business_name || "N/A"}
                </Text>
              </View>
              <View style={styles.currentAccountRow}>
                <Text style={styles.currentAccountLabel}>Type:</Text>
                <Text
                  style={[
                    styles.currentAccountValue,
                    currentTier === "REGULAR"
                      ? styles.regularBadge
                      : currentTier === "PATENT"
                      ? styles.patentBadge
                      : styles.pharmacyBadge,
                  ]}
                >
                  {currentTier === "REGULAR"
                    ? "Regular User"
                    : currentTier === "PATENT"
                    ? "Patent Vendor"
                    : "Licensed Pharmacy"}
                </Text>
              </View>
            </View>
          </View>

          {/* 💡 Conditional Tier Selection */}
          {isRegularUser && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Select New Account Type <Text style={styles.required}>*</Text>
              </Text>
              {availableTiers.map((tier) => (
                <TouchableOpacity
                  key={tier.value}
                  style={[
                    styles.tierCard,
                    selectedTier === tier.value && styles.tierCardSelected,
                    selectedTier === tier.value && {
                      borderColor: tier.color,
                    },
                  ]}
                  onPress={() => setSelectedTier(tier.value)}
                  disabled={isLoading}
                >
                  <View
                    style={[
                      styles.tierIconContainer,
                      { backgroundColor: tier.color + "20" },
                    ]}
                  >
                    <Text style={styles.tierIcon}>{tier.icon}</Text>
                  </View>
                  <View style={styles.tierContent}>
                    <Text style={styles.tierLabel}>{tier.label}</Text>
                    <Text style={styles.tierDescription}>
                      {tier.description}
                    </Text>
                  </View>
                  {selectedTier === tier.value && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: tier.color },
                      ]}
                    >
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {errors.tier && (
                <Text style={styles.errorText}>{errors.tier}</Text>
              )}
            </View>
          )}

          {/* 💡 Patent Auto-Select Display */}
          {isPatentUser && selectedTier === "PHARMACIST" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Next Upgrade</Text>
              <View
                style={[
                  styles.tierCard,
                  styles.tierCardSelected,
                  {
                    borderColor: allAccountTiers.find(
                      (t) => t.value === "PHARMACIST"
                    )?.color,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tierIconContainer,
                    {
                      backgroundColor:
                        allAccountTiers.find((t) => t.value === "PHARMACIST")
                          ?.color + "20",
                    },
                  ]}
                >
                  <Text style={styles.tierIcon}>🏥</Text>
                </View>
                <View style={styles.tierContent}>
                  <Text style={styles.tierLabel}>
                    Licensed Pharmacy (Auto-selected)
                  </Text>
                  <Text style={styles.tierDescription}>
                    This is the final account tier.
                  </Text>
                </View>
                <View
                  style={[
                    styles.selectedIndicator,
                    {
                      backgroundColor: allAccountTiers.find(
                        (t) => t.value === "PHARMACIST"
                      )?.color,
                    },
                  ]}
                >
                  <Text style={styles.selectedIndicatorText}>✓</Text>
                </View>
              </View>
            </View>
          )}

          {/* Additional Information - 💡 Only shown for REGULAR users */}
          {showInputFields && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>

              {/* Contact Person */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <User size={16} color="#666" />
                  <Text style={styles.inputLabelText}>
                    Contact Person <Text style={styles.required}>*</Text>
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.contactPerson && styles.inputError,
                  ]}
                  placeholder="Full name of contact person"
                  placeholderTextColor="#999"
                  value={contactPerson}
                  onChangeText={(text) => {
                    setContactPerson(text);
                    if (errors.contactPerson) {
                      setErrors({ ...errors, contactPerson: null });
                    }
                  }}
                  editable={!isLoading}
                />
                {errors.contactPerson && (
                  <Text style={styles.errorText}>{errors.contactPerson}</Text>
                )}
              </View>

              {/* State */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.inputLabelText}>
                    State <Text style={styles.required}>*</Text>
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, errors.state && styles.inputError]}
                  placeholder="e.g., Lagos"
                  placeholderTextColor="#999"
                  value={state}
                  onChangeText={(text) => {
                    setState(text);
                    if (errors.state) {
                      setErrors({ ...errors, state: null });
                    }
                  }}
                  editable={!isLoading}
                />
                {errors.state && (
                  <Text style={styles.errorText}>{errors.state}</Text>
                )}
              </View>

              {/* LGA */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Building2 size={16} color="#666" />
                  <Text style={styles.inputLabelText}>
                    LGA <Text style={styles.required}>*</Text>
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, errors.lga && styles.inputError]}
                  placeholder="e.g., Ikeja"
                  placeholderTextColor="#999"
                  value={lga}
                  onChangeText={(text) => {
                    setLga(text);
                    if (errors.lga) {
                      setErrors({ ...errors, lga: null });
                    }
                  }}
                  editable={!isLoading}
                />
                {errors.lga && (
                  <Text style={styles.errorText}>{errors.lga}</Text>
                )}
              </View>
            </View>
          )}

          {/* Important Notice (No change) */}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>⚠️ Important Notice</Text>
            <Text style={styles.noticeText}>
              • Account upgrade is permanent and cannot be reversed
            </Text>
            <Text style={styles.noticeText}>
              • Your account will be subject to verification
            </Text>
            <Text style={styles.noticeText}>
              • You may need to provide additional documentation
            </Text>
            <Text style={styles.noticeText}>
              • Please log out and log back in after upgrade to see changes
            </Text>
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              !isUpgradeEnabled && styles.upgradeButtonDisabled, // Use the new status
            ]}
            onPress={handleUpgrade}
            disabled={!isUpgradeEnabled} // Use the new status
          >
            <ArrowUpCircle size={20} color="#fff" />
            <Text style={styles.upgradeButtonText}>
              {isPatentUser ? "Final Upgrade to Pharmacy" : "Upgrade Account"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Modal (No change) */}
      <LoadingModal visible={isLoading} message="Upgrading account..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  keyboardView: {
    flex: 1,
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
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#fff3e0",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  infoBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  required: {
    color: "#e91e63",
  },
  currentAccountCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentAccountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  currentAccountLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  currentAccountValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  // Added badge styles for PATENT and PHARMACY
  regularBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#2196F3",
    fontWeight: "bold",
  },
  patentBadge: {
    backgroundColor: "#ffecb3",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#FF9800",
    fontWeight: "bold",
  },
  pharmacyBadge: {
    backgroundColor: "#c8e6c9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  tierCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tierCardSelected: {
    borderWidth: 2,
    backgroundColor: "#fafafa",
  },
  tierIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  tierIcon: {
    fontSize: 24,
  },
  tierContent: {
    flex: 1,
    marginLeft: 12,
  },
  tierLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIndicatorText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
  },
  inputError: {
    borderColor: "#e91e63",
  },
  errorText: {
    fontSize: 12,
    color: "#e91e63",
    marginTop: 4,
  },
  noticeCard: {
    backgroundColor: "#fff3e0",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AccountUpgradeScreen;
