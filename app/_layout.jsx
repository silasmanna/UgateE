import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import { CartProvider } from "../contexts/cartContext";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

// Helper component to show while the initial auth check is running
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

// Initial layout component that forces login as first screen
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // ✅ Add a ref to track if we're in the middle of an OTP flow
  const isNavigatingToOTP = useRef(false);

  // The authentication check is already correct
  const isAuthenticated = user !== null && user?.accessToken;

  useEffect(() => {
    // 1. Don't do anything while loading initial auth state
    if (isLoading) {
      return;
    }

    // Determine if the current route is one of the public (auth) routes
    const inAuthGroup =
      segments[0] === "(tabs)" &&
      (segments[1] === "login" || segments[1] === "register");

    // ✅ Updated list of public screens defined outside the (tabs) group
    const publicRoutes = [
      "index",
      "forgot-password",
      "reset-password",
      "verify-otp",
      "privacy",
      "terms",
      "returns",
    ];
    const isPublicRoute = publicRoutes.includes(segments[0]);

    // ✅ If on any public route, don't redirect
    if (isPublicRoute) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup && !isPublicRoute) {
      // User not logged in and not on a public screen -> redirect to login
      setTimeout(() => {
        router.replace("/(tabs)/login");
      }, 0);
    } else if (isAuthenticated && (inAuthGroup || isPublicRoute)) {
      // User logged in but on a public screen -> redirect to tabs
      // ✅ But don't redirect if we're navigating to OTP
      if (!isNavigatingToOTP.current) {
        router.replace("/(tabs)");
      }
    }
  }, [user, segments, isLoading, isAuthenticated]);

  // Show loading indicator during initial authentication check
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* PUBLIC ROUTES - Define these first */}
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="reset-password"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          {/* ✅ verify-otp screen */}
          <Stack.Screen
            name="verify-otp"
            options={{
              headerShown: false,
              // ✅ Prevent gesture-based back navigation
              gestureEnabled: false,
            }}
          />
          {/* ✅ Policy/Legal Routes */}
          <Stack.Screen
            name="privacy"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="terms"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="returns"
            options={{
              headerShown: false,
            }}
          />
          {/* PROTECTED/TAB ROUTES */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="listProducts"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="product"
            options={{
              headerShown: false,
              presentation: "card",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="kyc-verification"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
