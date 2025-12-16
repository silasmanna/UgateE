import { router } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingModal from "../../components/loadingModal";
import { useAuth } from "../../contexts/AuthContext";

const CategoriesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState("");

  // Get categories from AuthContext
  const { categories, isLoadingCategories, categoriesError, fetchCategories } =
    useAuth();

  // Fetch categories on mount if not already loaded
  useEffect(() => {
    if (categories.length === 0 && !isLoadingCategories && !categoriesError) {
      fetchCategories();
    }
  }, []);

  const handleCategoryPress = (category) => {
    // Set loading state with category name
    setLoadingCategory(category.name);
    setIsLoading(true);

    // Navigate after a brief moment to show the loader
    setTimeout(() => {
      router.push({
        pathname: "listProducts",
        params: { category: category.name },
      });

      // Reset loading state after navigation
      setTimeout(() => {
        setIsLoading(false);
        setLoadingCategory("");
      }, 300);
    }, 300);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSearch = () => {
    // Navigate to search page
    console.log("Open search");
  };

  const handleRefresh = () => {
    fetchCategories();
  };

  // Show loading state while fetching categories
  if (isLoadingCategories && categories.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Categories</Text>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={22} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#50C878" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if categories failed to load
  if (categoriesError && categories.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Categories</Text>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={22} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Categories</Text>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{categories.length} Categories</Text>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Refresh button */}
        {categories.length > 0 && (
          <View style={styles.refreshContainer}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isLoadingCategories}
            >
              {isLoadingCategories ? (
                <ActivityIndicator size="small" color="#50C878" />
              ) : (
                <Text style={styles.refreshButtonText}>Refresh</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Loading Modal */}
      <LoadingModal
        visible={isLoading}
        message={`Loading ${loadingCategory}, please wait...`}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  searchButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  countText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoryCard: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    lineHeight: 14,
    fontWeight: "500",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#50C878",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  refreshContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  refreshButtonText: {
    fontSize: 14,
    color: "#50C878",
    fontWeight: "600",
  },
});

export default CategoriesPage;
