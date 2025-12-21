import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if user has valid session
  const isAuthenticated = user !== null && user?.accessToken;

  // Auto-redirect authenticated users to homepage
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace("/(tabs)");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  const handleGetStarted = () => {
    setIsNavigating(true);

    setTimeout(() => {
      if (isAuthenticated) {
        // User has session, go to homepage
        router.replace("/(tabs)");
      } else {
        // No session, go to login
        router.push("/(tabs)/login");
      }
    }, 300);
  };

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Welcome back...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/allwecure.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Empowering Healthier Communities</Text>

        {/* Description */}
        <Text style={styles.description}>
          Your trusted partner for quality pharmaceuticals and healthcare
          products
        </Text>
        <Text style={styles.description}>
          ALLWECURE, providing a wide range of pharmaceuticals and healthcare
          products for pharmacy shops and Hospitals
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity
          style={[
            styles.getStartedButton,
            isNavigating && styles.getStartedButtonDisabled,
          ]}
          onPress={handleGetStarted}
          disabled={isNavigating}
          activeOpacity={0.8}
        >
          {isNavigating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          )}
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💊</Text>
            <Text style={styles.featureText}>Quality Medicines</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={styles.featureText}>Fast Delivery</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Secure & Safe</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 Allwecure Pharmaceuticals Nigeria Ltd
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 280,
    height: 280,
  },
  tagline: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: "#50C878",
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: "#50C878",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    alignItems: "center",
  },
  getStartedButtonDisabled: {
    opacity: 0.7,
  },
  getStartedButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
  },
});
