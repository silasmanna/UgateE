import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  Eye,
  EyeOff,
  Square,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
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
import LoadingModal from "../../../components/loadingModal";

import { useAuth } from "../../../contexts/AuthContext";

const BUYER_TYPES = [
  { value: "regular", label: "Regular User", description: "Individual buyer" },
  {
    value: "patent",
    label: "Patent Medicine",
    description: "Licensed patent medicine vendor",
  },
  { value: "pharmacist", label: "Pharmacy", description: "Licensed pharmacy" },
];

const RegisterScreen = () => {
  const router = useRouter();
  const { register } = useAuth();

  // Buyer Type Selection
  const [buyerType, setBuyerType] = useState("regular");

  // Common Form States (for all user types)
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");

  // Optional referral code
  const [referralCode, setReferralCode] = useState("");

  // Regular User Fields
  const [name, setName] = useState("");

  // Business User Fields (Patent/Pharmacy)
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");

  // UI/Flow States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isBusinessUser = buyerType === "patent" || buyerType === "pharmacist";
  const handleSubmit = async () => {
    setRegisterError(null);

    // Check terms agreement first
    if (!agreedToTerms) {
      setRegisterError(
        "Please agree to the Terms and Conditions and Privacy Policy."
      );
      return;
    }

    // 1. Client-Side Validation - Common Fields
    if (!email || !password || !confirmPassword || !phone || !address) {
      setRegisterError("All required fields must be filled out.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRegisterError("Please enter a valid email address.");
      return;
    }

    // Phone validation
    if (phone.length < 10) {
      setRegisterError(
        "Please enter a valid phone number (at least 10 digits)."
      );
      return;
    }

    // Validate based on buyer type
    if (isBusinessUser) {
      if (!businessName || !contactPerson || !state || !lga) {
        setRegisterError("All business fields must be filled out.");
        return;
      }
    } else {
      if (!name) {
        setRegisterError("Name is required.");
        return;
      }
    }

    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      return;
    }

    // Password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      setRegisterError(
        "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)."
      );
      return;
    }

    setIsSigningUp(true);

    try {
      console.log("🚀 Starting registration...");

      // Prepare registration data based on buyer type
      const registrationData = {
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        address: address.trim(),
        account_tier: buyerType.toUpperCase(),
      };

      // Include referral code if provided
      if (referralCode.trim()) {
        registrationData.referral_code = referralCode.trim();
      }

      // Add fields specific to buyer type
      if (isBusinessUser) {
        registrationData.name = businessName.trim();
        registrationData.contact_person = contactPerson.trim();
        registrationData.state = state.trim();
        registrationData.lga = lga.trim();
      } else {
        registrationData.name = name.trim();
      }

      console.log("📤 Registration data prepared:", {
        ...registrationData,
        password: "***HIDDEN***",
      });

      // Call register and wait for response
      const result = await register(registrationData);

      console.log("✅ Registration completed successfully");

      // Keep loading state while navigating
      // Add small delay to ensure smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to OTP screen with the email
      router.replace({
        pathname: "/verify-otp",
        params: { email: result.email },
      });
    } catch (error) {
      console.error("❌ Registration Error:", error);

      // More specific error messages
      let errorMessage = error.message;

      if (errorMessage.includes("Network request failed")) {
        errorMessage =
          "Unable to connect to server. Please check your internet connection and try again.";
      } else if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("duplicate")
      ) {
        errorMessage =
          "An account with this email or phone number already exists.";
      } else if (
        errorMessage.includes("Invalid") ||
        errorMessage.includes("validation")
      ) {
        errorMessage = "Please check your information and try again.";
      }

      setRegisterError(errorMessage);
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.languageSelector}>
          <Text style={styles.languageText}>{selectedLanguage}</Text>
          <ChevronDown size={18} color="#000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo/Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Buyer Type Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Account Type</Text>
              <View style={styles.buyerTypeContainer}>
                {BUYER_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.buyerTypeCard,
                      buyerType === type.value && styles.buyerTypeCardActive,
                    ]}
                    onPress={() => setBuyerType(type.value)}
                    disabled={isSigningUp}
                  >
                    <View style={styles.radioButton}>
                      {buyerType === type.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.buyerTypeContent}>
                      <Text
                        style={[
                          styles.buyerTypeLabel,
                          buyerType === type.value &&
                            styles.buyerTypeLabelActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                      <Text style={styles.buyerTypeDescription}>
                        {type.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Conditional Fields Based on Buyer Type */}
            {isBusinessUser ? (
              <>
                <Text style={styles.sectionTitle}>Business Information</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Business Name *"
                    placeholderTextColor="#999"
                    value={businessName}
                    onChangeText={setBusinessName}
                    autoCapitalize="words"
                    editable={!isSigningUp}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Contact Person *"
                    placeholderTextColor="#999"
                    value={contactPerson}
                    onChangeText={setContactPerson}
                    autoCapitalize="words"
                    editable={!isSigningUp}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="State *"
                    placeholderTextColor="#999"
                    value={state}
                    onChangeText={setState}
                    autoCapitalize="words"
                    editable={!isSigningUp}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="LGA (Local Government Area) *"
                    placeholderTextColor="#999"
                    value={lga}
                    onChangeText={setLga}
                    autoCapitalize="words"
                    editable={!isSigningUp}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name *"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!isSigningUp}
                  />
                </View>
              </>
            )}

            {/* Common Fields for All User Types */}
            <Text style={styles.sectionTitle}>Contact Details</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Phone *"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Address *"
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
                autoCapitalize="words"
                editable={!isSigningUp}
              />
            </View>

            <Text style={styles.sectionTitle}>Security</Text>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password *"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isSigningUp}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isSigningUp}
              >
                {showPassword ? (
                  <Eye size={20} color="#999" />
                ) : (
                  <EyeOff size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password *"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!isSigningUp}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSigningUp}
              >
                {showConfirmPassword ? (
                  <Eye size={20} color="#999" />
                ) : (
                  <EyeOff size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {/* Referral Code Input (Optional) */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Referral Code (Optional)"
                placeholderTextColor="#999"
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                editable={!isSigningUp}
              />
            </View>

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsText}>
                Password must contain:
              </Text>
              <Text style={styles.requirementItem}>
                • At least 8 characters
              </Text>
              <Text style={styles.requirementItem}>
                • Uppercase letter (A-Z)
              </Text>
              <Text style={styles.requirementItem}>
                • Lowercase letter (a-z)
              </Text>
              <Text style={styles.requirementItem}>• Number (0-9)</Text>
              <Text style={styles.requirementItem}>
                • Special character (@$!%*?&)
              </Text>
            </View>

            {/* License Info for Business Users */}
            {isBusinessUser && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ As a{" "}
                  {buyerType === "patent"
                    ? "Patent Medicine Vendor"
                    : "Pharmacy"}
                  , you'll have access to purchase prescription medications.
                </Text>
              </View>
            )}

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              disabled={isSigningUp}
              activeOpacity={0.7}
            >
              <View style={styles.checkboxContainer}>
                {agreedToTerms ? (
                  <CheckSquare size={24} color="#50C878" />
                ) : (
                  <Square size={24} color="#999" />
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => router.push("/terms")}
                  >
                    Terms and Conditions
                  </Text>
                  ,{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => router.push("/privacy")}
                  >
                    Privacy Policy
                  </Text>
                  , and{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => router.push("/returns")}
                  >
                    Returns Policy
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* Error Message Display */}
            {registerError && (
              <Text style={styles.errorText}>{registerError}</Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSigningUp && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                disabled={isSigningUp}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Loading Modal */}
      <LoadingModal visible={isSigningUp} message="Creating your account..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: { padding: 4 },
  languageSelector: { flexDirection: "row", alignItems: "center", gap: 4 },
  languageText: { fontSize: 16, color: "#000", fontWeight: "500" },
  keyboardView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  titleContainer: { alignItems: "center", marginTop: 20, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666" },
  formContainer: { paddingHorizontal: 20 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  buyerTypeContainer: { gap: 12 },
  buyerTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    gap: 12,
  },
  buyerTypeCardActive: { borderColor: "#50C878", backgroundColor: "#f0fff4" },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#50C878",
  },
  buyerTypeContent: { flex: 1 },
  buyerTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  buyerTypeLabelActive: { color: "#50C878" },
  buyerTypeDescription: { fontSize: 13, color: "#999" },
  inputWrapper: { marginBottom: 16, position: "relative" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: "#000",
  },
  passwordInput: { paddingRight: 50 },
  eyeIcon: { position: "absolute", right: 20, top: 16, padding: 4 },
  infoBox: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },
  infoText: { fontSize: 13, color: "#1976d2", lineHeight: 18 },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingVertical: 8,
  },
  checkboxContainer: { marginRight: 12, marginTop: 2 },
  termsTextContainer: { flex: 1 },
  termsText: { fontSize: 14, color: "#666", lineHeight: 20 },
  termsLink: {
    color: "#2196F3",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  passwordRequirements: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: -8,
  },
  requirementsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  requirementItem: { fontSize: 11, color: "#666", marginBottom: 2 },
  errorText: {
    color: "#dc3545",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#50C878",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  loginText: { fontSize: 14, color: "#666" },
  loginLink: { fontSize: 14, color: "#2196F3", fontWeight: "600" },
  bottomIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorBar: {
    width: 100,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
  },
});

export default RegisterScreen;
