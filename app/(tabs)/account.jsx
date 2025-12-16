import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowUpCircle,
  Award,
  ChevronRight,
  Edit,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChangePasswordModal from "../../components/changepassword";
import KYCVerificationModal from "../../components/KYCVerificationModal";
import LoadingModal from "../../components/loadingModal";
import { useAuth } from "../../contexts/AuthContext";
import EditProfileModal from ".././editprofile";
import { getCurrentUser } from "../utils/api";

const UserProfileDashboard = () => {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();

  // State for loading and modals
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // State for user data from API
  const [userData, setUserData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Ref for ScrollView to scroll to top
  const scrollViewRef = useRef(null);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleProfileUpdated = () => {
    fetchUserProfile();
  };

  // Fetch user profile data from API
  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      console.log("📥 Fetching user profile from API...");

      const response = await getCurrentUser();
      console.log("✅ User profile fetched:", response);

      // Transform API response to match your app's data structure
      const transformedData = {
        id: response.id,
        email: response.email,
        name: response.name,
        business_name: response.name, // Use name as business_name
        phone: response.phone,
        address: response.address,
        // Map account_tier to buyer_type and type
        buyer_type: response.account_tier?.toLowerCase() || "regular",
        type: response.account_tier?.toLowerCase() || "regular",
        // Store verification_status directly for clear check
        verification_status: response.verification_status,
        isBlocked: response.isBlocked,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      setUserData(transformedData);
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
      setProfileError(error.message);

      // Show error alert
      Alert.alert(
        "Failed to Load Profile",
        "Could not fetch your profile data. Using cached data instead.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Reset loading state when component mounts or comes into focus
  useEffect(() => {
    setIsLoading(false);
    setLoadingMessage("");
  }, []);

  // Also reset when screen comes into focus and refresh profile
  useFocusEffect(
    useCallback(() => {
      setIsLoading(false);
      setLoadingMessage("");

      // Scroll to top when screen comes into focus
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }

      // Refresh user profile when screen comes into focus
      fetchUserProfile();
    }, [])
  );

  // Use API data if available, otherwise fall back to authUser
  const currentUser = userData || authUser;

  // User type configuration
  const userTypeConfig = {
    regular: {
      label: "Regular User",
      color: "#2196F3",
      icon: "👤",
      description: "Standard account",
    },
    patent: {
      label: "Patent Medicine Vendor",
      color: "#FF9800",
      icon: "🏪",
      description:
        "Licensed to sell non-prescription and some prescription medications",
    },
    pharmacy: {
      label: "Licensed Pharmacy",
      color: "#4CAF50",
      icon: "🏥",
      description:
        "Full pharmacy license with comprehensive access to all medications",
    },
    pharmacist: {
      label: "Licensed Pharmacy",
      color: "#4CAF50",
      icon: "🏥",
      description:
        "Full pharmacy license with comprehensive access to all medications",
    },
  };

  const currentUserType =
    currentUser?.type ||
    currentUser?.buyer_type ||
    currentUser?.account_tier?.toLowerCase() ||
    "regular";
  const userTypeInfo =
    userTypeConfig[currentUserType] || userTypeConfig.regular;
  const isRegularUser = currentUserType === "regular";

  // Updated check to include "pharmacist" as a business account type
  const isBusinessAccount =
    currentUserType === "patent" ||
    currentUserType === "pharmacy" ||
    currentUserType === "pharmacist";

  // Check verification status directly from the transformed/API data
  const isVerified = currentUser?.verification_status === "VERIFIED";

  const menuSections = [
    {
      title: "Account",
      items: [
        { id: "1", label: "Edit Profile", icon: Edit, color: "#2196F3" },
        { id: "2", label: "My Orders", icon: Package, color: "#4CAF50" },
        { id: "3", label: "Change Password", icon: Lock, color: "#FF9800" }, // NEW
        { id: "5", label: "Saved Addresses", icon: MapPin, color: "#9C27B0" },
      ],
    },
    {
      title: "Support",
      items: [
        { id: "11", label: "Help Center", icon: HelpCircle, color: "#3F51B5" },
        {
          id: "12",
          label: "Contact Us",
          icon: MessageCircle,
          color: "#009688",
        },
      ],
    },
  ];

  // Handler for refreshing profile data
  const handleRefreshProfile = async () => {
    if (isLoading || isLoadingProfile) return;

    setIsLoading(true);
    setLoadingMessage("Refreshing profile...");

    await fetchUserProfile();

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Handler for logging out
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            if (isLoading) return;

            setIsLoading(true);
            setLoadingMessage("Logging out...");

            try {
              await new Promise((resolve) => setTimeout(resolve, 300));
              await signOut();
              await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handler for menu item navigation
  const handleMenuPress = (item) => {
    if (isLoading) return;

    // ✅ Special handling for Edit Profile - open modal directly
    if (item.label === "Edit Profile") {
      handleEditProfile();
      return;
    }
    // ✅ NEW: Special handling for Change Password - open modal directly
    if (item.label === "Change Password") {
      setShowChangePasswordModal(true);
      return;
    }
    setIsLoading(true);
    setLoadingMessage(`Loading...`);

    setTimeout(() => {
      switch (item.label) {
        case "My Orders":
          router.push("/notice");
          break;
        case "Help Center":
        case "Contact Us":
          router.push("/contact");
          break;
        case "Saved Addresses":
          Alert.alert("Coming Soon", `${item.label} feature is coming soon!`);
          break;
        case "Settings":
          Alert.alert("Coming Soon", `Settings feature is coming soon!`);
          break;
        default:
          Alert.alert("Coming Soon", `This feature is coming soon!`);
          break;
      }
      setIsLoading(false);
    }, 500);
  };

  // Handler for orders card press
  const handleOrdersPress = () => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingMessage("Loading your orders...");

    setTimeout(() => {
      router.push("/notice");
      setIsLoading(false);
    }, 500);
  };

  // Handler for seller button press
  const handleSellerPress = () => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingMessage("Opening seller portal...");

    setTimeout(() => {
      Linking.openURL("https://www.test.com");
      setIsLoading(false);
    }, 500);
  };

  // Handler for KYC verification modal
  const handleOpenKYCModal = () => {
    setShowKYCModal(true);
  };

  // Handler for upgrade account
  const handleUpgradeAccount = () => {
    setIsLoading(true);
    setLoadingMessage("Opening registration...");
    setTimeout(() => {
      router.push("/upgrade");
      setIsLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshProfile}
            disabled={isLoading || isLoadingProfile}
          >
            <RefreshCw size={20} color={isLoadingProfile ? "#999" : "#000"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => handleMenuPress({ label: "Settings" })}
          >
            <Settings size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Loading Profile Indicator */}
        {isLoadingProfile && !userData && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        )}

        {/* Profile Error */}
        {profileError && !isLoadingProfile && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {profileError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchUserProfile}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: userTypeInfo.color + "20" },
              ]}
            >
              <Text style={styles.avatarEmoji}>{userTypeInfo.icon}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {currentUser?.name || currentUser?.business_name || "User"}
              </Text>
              <Text style={styles.userEmail}>
                {currentUser?.email || "user@email.com"}
              </Text>
              <View
                style={[
                  styles.userTypeBadge,
                  { backgroundColor: userTypeInfo.color },
                ]}
              >
                <Award size={12} color="#fff" />
                <Text style={styles.userTypeText}>{userTypeInfo.label}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Edit size={20} color="#e91e63" />
            </TouchableOpacity>
          </View>

          {/* Contact Info */}
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>
                {currentUser?.email || "N/A"}
              </Text>
            </View>

            {currentUser?.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{currentUser.phone}</Text>
              </View>
            )}

            {currentUser?.address && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{currentUser.address}</Text>
              </View>
            )}

            {currentUser?.state && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>State</Text>
                <Text style={styles.contactValue}>{currentUser.state}</Text>
              </View>
            )}

            {currentUser?.lga && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>LGA</Text>
                <Text style={styles.contactValue}>{currentUser.lga}</Text>
              </View>
            )}

            {currentUser?.contact_person && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Contact Person</Text>
                <Text style={styles.contactValue}>
                  {currentUser.contact_person}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Type Info Card */}
        <View style={styles.accountTypeCard}>
          <View style={styles.accountTypeHeader}>
            <Shield size={20} color={userTypeInfo.color} />
            <Text style={styles.accountTypeTitle}>Account Type</Text>
          </View>
          <Text style={styles.accountTypeDescription}>
            {userTypeInfo.description}
          </Text>

          {/* Verification Status - Only for Patent/Pharmacy/Pharmacist */}
          {isBusinessAccount && (
            <View style={styles.verificationContainer}>
              {isVerified ? (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Verified Account</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={handleOpenKYCModal}
                  disabled={isLoading}
                >
                  <ShieldCheck size={16} color="#fff" />
                  <Text style={styles.verifyButtonText}>Verify Account</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Warning for Regular Users Only */}
          {isRegularUser && (
            <View style={styles.upgradeNotice}>
              <Text style={styles.upgradeNoticeText}>
                ⚠️ Regular users cannot purchase prescription medications
              </Text>
            </View>
          )}
        </View>

        {/* Upgrade Account Button (For Regular and Patent Users) */}
        {(isRegularUser || currentUserType === "patent") && (
          <View style={styles.upgradeSection}>
            <View style={styles.upgradeBanner}>
              <View style={styles.upgradeIconContainer}>
                <ArrowUpCircle size={32} color="#FF9800" />
              </View>
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeTitle}>
                  {isRegularUser
                    ? "Upgrade Your Account"
                    : "Upgrade to Pharmacy"}
                </Text>
                <Text style={styles.upgradeDescription}>
                  {isRegularUser
                    ? "Get access to prescription medications by upgrading to a Patent Medicine or Pharmacy account"
                    : "Upgrade from Patent Medicine Vendor to Licensed Pharmacy for full access"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradeAccount}
              disabled={isLoading}
            >
              <ArrowUpCircle size={20} color="#fff" />
              <Text style={styles.upgradeButtonText}>
                {isRegularUser ? "Upgrade Account" : "Upgrade to Pharmacy"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <View key={index} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuList}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    itemIndex !== section.items.length - 1 &&
                      styles.menuItemBorder,
                  ]}
                  onPress={() => handleMenuPress(item)}
                  disabled={isLoading}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: item.color + "20" },
                      ]}
                    >
                      <item.icon size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <LogOut size={20} color="#e91e63" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </ScrollView>

      {/* Loading Modal */}
      <LoadingModal visible={isLoading} message={loadingMessage} />

      {/* KYC Verification Modal */}
      <KYCVerificationModal
        visible={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        userType={currentUser?.type || currentUser?.buyer_type}
      />
      {/* Update Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleProfileUpdated}
      />
      {/* NEW: Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          Alert.alert(
            "Password Changed",
            "Your password has been changed successfully."
          );
        }}
      />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  settingsButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    backgroundColor: "#e3f2fd",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#1976d2",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#c62828",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#c62828",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  userTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  userTypeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  editProfileButton: {
    padding: 8,
  },
  contactInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  contactItem: {
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  accountTypeCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accountTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  accountTypeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  accountTypeDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  verificationContainer: {
    marginTop: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2e7d32",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
    alignSelf: "flex-start",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  upgradeNotice: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  upgradeNoticeText: {
    fontSize: 13,
    color: "#e65100",
    lineHeight: 18,
  },
  upgradeSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  upgradeIconContainer: {
    marginRight: 12,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  sellerSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sellerButton: {
    backgroundColor: "#50C878",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  statCardFull: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  menuSection: {
    marginTop: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e91e63",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#e91e63",
    fontWeight: "600",
  },
  appVersion: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
  },
});

export default UserProfileDashboard;
