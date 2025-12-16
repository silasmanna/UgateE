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

    if (password.length < 6) {
      setRegisterError("Password must be at least 6 characters.");
      return;
    }

    setIsSigningUp(true);

    try {
      // Prepare registration data based on buyer type
      const registrationData = {
        email,
        phone,
        password,
        address,
        account_tier: buyerType.toUpperCase(),
      };

      // Add fields specific to buyer type
      if (isBusinessUser) {
        registrationData.name = businessName;
        registrationData.contact_person = contactPerson;
        registrationData.state = state;
        registrationData.lga = lga;
      } else {
        registrationData.name = name;
      }

      console.log("📤 Sending registration data:", registrationData);

      await register(registrationData);
    } catch (error) {
      console.error("Registration Error:", error.message);
      setRegisterError(error.message);
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

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicatorBar} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  languageText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  buyerTypeContainer: {
    gap: 12,
  },
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
  buyerTypeCardActive: {
    borderColor: "#50C878",
    backgroundColor: "#f0fff4",
  },
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
  buyerTypeContent: {
    flex: 1,
  },
  buyerTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  buyerTypeLabelActive: {
    color: "#50C878",
  },
  buyerTypeDescription: {
    fontSize: 13,
    color: "#999",
  },
  inputWrapper: {
    marginBottom: 16,
    position: "relative",
  },
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
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 20,
    top: 16,
    padding: 4,
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    fontSize: 13,
    color: "#1976d2",
    lineHeight: 18,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingVertical: 8,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  termsLink: {
    color: "#2196F3",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
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
