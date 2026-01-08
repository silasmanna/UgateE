# UgateE (Allwecure)

**UgateE** (also known as **Allwecure**) is a comprehensive pharmaceutical e-commerce mobile application built with **React Native** and **Expo**. It is designed to facilitate the safe and regulated sale of medicines, ranging from Over-The-Counter (OTC) drugs to restricted prescription medications.

The application incorporates strict regulatory compliance features, ensuring that restricted products are only accessible to verified users with the appropriate licenses (e.g., Patent Medicine Vendors, Pharmacists).

## 🚀 Features

### 🛍️ Marketplace & Shopping

- **Product Catalog:** Browse a wide range of medicines organized by categories.
- **Smart Search & Filtering:** Search for medicines and filter by Sales, Popularity, Brand, and New arrivals.
- **Product Details:** View detailed information, including price, dosage, and stock status.
- **Shopping Cart:** Add items, manage quantities, and proceed to checkout.
- **Order Management:** Track orders and view purchase history (implied).

### 🔐 User Management & Security

- **Authentication:** Secure Login, Registration, and Password Recovery (Forgot/Reset Password).
- **OTP Verification:** Email verification using One-Time Passwords.
- **Profile Management:** Edit profile details and manage account settings.
- **KYC Verification:** Identity verification system for users.

### 🛡️ Regulatory Compliance & Access Control

The app implements a tiered access system to ensure drug safety:

- **OTC (Over-The-Counter):** Available to all users.
- **Rx (Patent Only):** Restricted to users with a verified "Patent Medicine" license.
- **Rx+ (Prescription Only):** Restricted to users with a verified "Pharmacist" license.
- **License Upload:** Users can upload documents to verify their professional status.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/)
- **Platform:** [Expo](https://expo.dev/) (SDK 54)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (v6) - File-based routing
- **State Management:** React Context API (`AuthContext`, `cartContext`)
- **UI Components:** Custom components & [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native) for icons
- **Storage:** `AsyncStorage` & `Expo Secure Store`
- **API Integration:** RESTful API integration (via `axios` or `fetch`)

## 📂 Project Structure

```
UgateE/
├── app/                    # Main application screens & navigation
│   ├── (tabs)/             # Bottom tab navigation (Home, Explore, Cart, etc.)
│   ├── product/            # Product detail screens
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   ├── _layout.jsx         # Root layout definition
│   └── ...                 # Other screens (Auth, Profile, etc.)
├── assets/                 # Images and static assets
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI elements
│   └── ...                 # Feature-specific components (e.g., KYCVerificationModal)
├── constants/              # App constants (Theme, Colors)
├── contexts/               # Global state contexts (Auth, Cart)
├── hooks/                  # Custom React hooks
└── scripts/                # Helper scripts
```

## ⚡ Getting Started

### Prerequisites

- Node.js installed
- npm or yarn
- Expo Go app on your mobile device (or an Android/iOS emulator)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/silasmanna/UgateE.git
    cd UgateE
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the application:**

    ```bash
    npx expo start
    ```

4.  **Run on device:**
    - Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).
    - Press `a` to run on Android Emulator.
    - Press `i` to run on iOS Simulator.
    - Press `w` to run on Web.

## 📱 Key Screens

- **Home (`app/(tabs)/index.jsx`):** The main landing page featuring categories, sales, and popular products.
- **Cart (`app/(tabs)/cart/`):** Manages selected items for purchase.
- **Account (`app/(tabs)/account.jsx`):** User profile and settings hub.
- **KYC Verification (`app/kyc-verification.js`):** Form for submitting verification documents.
- **Product Details (`app/product/[id].jsx`):** Detailed view of a specific medicine.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary.
