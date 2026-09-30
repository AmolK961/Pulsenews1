# PulseNews Mobile - Cross-Platform React Native App
### Runs on both Android & Apple iOS with Over-The-Air (OTA) Live Updates

PulseNews Mobile is a complete, production-grade React Native app built with **Expo**, **React Navigation**, and **Expo Updates**. It delivers real-time breaking news, audio podcast narration, offline bookmarking, Google AdMob monetization units, and instant over-the-air code updates.

---

## ⚡ Key Highlights

1. **Cross-Platform**: Single codebase runs identically on:
   - **Android**: Phones, tablets, and emulators.
   - **Apple iOS**: iPhones, iPads, and iOS Simulators.
2. **Instant Code Updates ("After updating, change should be after update")**:
   - Integrated with **`expo-updates`** & **EAS Update**.
   - When you modify your code, push the changes instantly over-the-air using:
     ```bash
     npx eas update --auto
     ```
   - When users open the app (or tap "Check Updates" in the header), the app downloads the new bundle in the background and reloads automatically with `Updates.reloadAsync()`. **No need to wait for App Store or Google Play review!**
3. **Clean In-App Reader**:
   - Full paragraph extraction directly in-app.
   - Reading time, typography scaler (`A-` / `A+`), and source accreditation.
   - Integrated WebView fallback (`react-native-webview`) for full publisher website viewing.
4. **Voice Audio Narrator**:
   - Uses `expo-speech` to read aloud stories, headlines, and daily podcast briefings in high quality.
5. **Monetization Ready**:
   - Google AdMob / AdSense banner components configured for iOS and Android publisher slots (`ca-app-pub-8153839325985487`).

---

## 🚀 Running on Your Laptop (Quick Start)

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- On your phone: Download **Expo Go** from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android) or [Apple App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS).

### Step 1: Install Dependencies
Inside this `react-native-app` folder:
```bash
npm install
```

### Step 2: Start Development Server
```bash
npx expo start
```

### Step 3: Run on Your Devices
- **Physical Phone (iPhone or Android)**:
  - Scan the terminal QR code using your phone's Camera (iPhone) or the Expo Go app (Android).
- **Android Emulator**: Press `a` in the terminal.
- **Apple iOS Simulator (Mac)**: Press `i` in the terminal.

---

## 🔄 Over-The-Air (OTA) Code Updates (EAS Update)

Whenever you edit your code or fix a bug and want all active Android & iOS users to receive the changes instantly:

1. **Login to Expo CLI**:
   ```bash
   npx eas login
   ```

2. **Initialize Project ID**:
   ```bash
   npx eas init
   ```

3. **Publish an Instant Update**:
   ```bash
   npx eas update --auto
   ```
   *Your updated screens, styles, logic, and fixes will deploy over-the-air to all iOS and Android devices within seconds.*

---

## 📦 Building Standalone Apps (APK & IPA)

To generate standalone distributable binaries without Expo Go:

### Android APK (Direct install on Android phones):
```bash
npx eas build -p android --profile preview
```

### Apple iOS (TestFlight / Ad-hoc IPA):
```bash
npx eas build -p ios --profile preview
```
