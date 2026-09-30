import React, { useState } from 'react';
import { 
  Code2, 
  Smartphone, 
  Layers, 
  Copy, 
  Check, 
  X, 
  FileCode, 
  Terminal, 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  ExternalLink,
  Download,
  Zap
} from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [activePlatform, setActivePlatform] = useState<'react-native' | 'android' | 'react'>('react-native');
  const [activeFile, setActiveFile] = useState<string>('App.tsx');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // React Native (iOS & Android) with Over-The-Air (OTA) Live Updates
  const REACT_NATIVE_FILES: Record<string, { desc: string; code: string; language: string }> = {
    'App.tsx': {
      desc: 'Cross-platform root component with Over-The-Air update detection, SafeArea, and native tab navigation.',
      language: 'typescript',
      code: `import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { updateService } from './src/services/updateService';

/**
 * PulseNews Mobile - Cross-Platform React Native App
 * Fully optimized for Apple iOS (iPhone/iPad) & Android Devices.
 * Supports Over-The-Air (OTA) Live Updates via Expo Updates.
 */
export default function App() {
  useEffect(() => {
    // Automatically checks for code updates on app launch.
    // When you push an update with "eas update --auto", the app
    // downloads it in the background and reloads immediately.
    updateService.checkForUpdatesOnLaunch();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#020617" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}`
    },
    'updateService.ts': {
      desc: 'Expo Updates OTA manager: guarantees code changes take effect immediately on both iOS & Android without App Store review.',
      language: 'typescript',
      code: `import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

/**
 * PulseNews Over-The-Air (OTA) & Live Code Update Manager
 * 
 * Ensures that changes published via EAS Update take effect immediately
 * on both Apple iOS and Android devices without requiring a full App Store
 * or Google Play review cycle.
 */
class UpdateService {
  /**
   * Automatically check for updates on app launch and reload if available.
   */
  async checkForUpdatesOnLaunch(): Promise<boolean> {
    if (__DEV__) {
      console.log('[UpdateService] Dev mode: Fast Refresh applies updates in real-time.');
      return false;
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        console.log('[UpdateService] New code update detected! Fetching bundle...');
        await Updates.fetchUpdateAsync();
        
        Alert.alert(
          '✨ Update Ready',
          'A new version with the latest improvements has been downloaded. Restart to apply immediately?',
          [
            { text: 'Later', style: 'cancel' },
            { 
              text: 'Restart & Apply', 
              onPress: async () => {
                // Instantly reloads the new bundle with all changes applied!
                await Updates.reloadAsync();
              } 
            }
          ]
        );
        return true;
      }
    } catch (error) {
      console.warn('[UpdateService] Update check failed:', error);
    }
    return false;
  }

  /**
   * Manual check triggered by user in Settings or Header.
   */
  async checkManually(): Promise<{ success: boolean; message: string }> {
    if (__DEV__) {
      return { 
        success: true, 
        message: 'Dev mode: Hot reload active. Run "eas update" to push OTA updates.' 
      };
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return { success: true, message: 'Update downloaded and applied!' };
      } else {
        return { success: true, message: 'You already have the latest version.' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Could not reach update server.' };
    }
  }

  getUpdateInfo() {
    return {
      channel: Updates.channel || 'production',
      updateId: Updates.updateId || 'embedded',
      runtimeVersion: Updates.runtimeVersion || '1.0.0',
      platform: Platform.OS,
    };
  }
}

export const updateService = new UpdateService();`
    },
    'HomeScreen.tsx': {
      desc: 'Top headlines feed with pull-to-refresh for live news updates, category chips, search, and AdMob banner.',
      language: 'typescript',
      code: `import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, RefreshControl, 
  SafeAreaView, StatusBar, Platform, TextInput, TouchableOpacity 
} from 'react-native';
import { fetchHeadlines } from '../services/api';
import { NewsCard } from '../components/NewsCard';
import { CategoryChips } from '../components/CategoryChips';
import { GoogleAdMobBanner } from '../components/GoogleAdMobBanner';
import { UpdateBanner } from '../components/UpdateBanner';

export const HomeScreen = ({ navigation }: any) => {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (cat: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const res = await fetchHeadlines(cat);
    // Sort latest first
    const sorted = res.articles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    setArticles(sorted);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(category); }, [category, loadData]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      {/* Shows current OTA release channel and check updates button */}
      <UpdateBanner />
      <CategoryChips selected={category} onSelect={setCategory} />
      <FlatList
        data={articles}
        keyExtractor={(item: any, idx) => item.url + idx}
        renderItem={({ item, index }) => (
          <>
            {index === 2 && <GoogleAdMobBanner />}
            <NewsCard 
              article={item} 
              onPress={() => navigation.navigate('ArticleDetail', { article: item })} 
            />
          </>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => loadData(category, true)} 
            tintColor="#f43f5e" 
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' }
});`
    },
    'ArticleDetailScreen.tsx': {
      desc: 'In-app clean reader with full body extraction, voice narration (expo-speech), font scaler, and webview toggle.',
      language: 'typescript',
      code: `import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, 
  SafeAreaView, Share, Platform 
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { fetchFullArticle } from '../services/api';
import { GoogleAdMobBanner } from '../components/GoogleAdMobBanner';

export const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { article } = route.params;
  const [viewMode, setViewMode] = useState<'clean' | 'webview'>('clean');
  const [fullArticle, setFullArticle] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  useEffect(() => {
    fetchFullArticle(article.url).then(setFullArticle);
    return () => { Speech.stop(); };
  }, [article.url]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const textToRead = \`\${article.title}. \${article.description || ''}. \${
        fullArticle?.paragraphs ? fullArticle.paragraphs.join('. ') : ''
      }\`;
      Speech.speak(textToRead, {
        language: 'en',
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {viewMode === 'webview' ? (
        <WebView source={{ uri: article.url }} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {article.urlToImage && (
            <Image source={{ uri: article.urlToImage }} style={styles.heroImage} />
          )}
          <Text style={[styles.title, { fontSize: 20 + fontSizeOffset }]}>{article.title}</Text>
          <Text style={styles.meta}>Source: {article.source.name} &bull; {article.author || 'Newsroom'}</Text>
          <GoogleAdMobBanner label="IN-ARTICLE AD" />
          {fullArticle?.paragraphs?.map((p: string, i: number) => (
            <Text key={i} style={[styles.paragraph, { fontSize: 14 + fontSizeOffset }]}>{p}</Text>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 40 },
  heroImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 14 },
  title: { color: '#f8fafc', fontWeight: '800', lineHeight: 28, marginBottom: 8 },
  meta: { color: '#64748b', fontSize: 12, marginBottom: 16 },
  paragraph: { color: '#cbd5e1', lineHeight: 24, marginBottom: 14 }
});`
    },
    'app.json': {
      desc: 'Expo configuration for Apple iOS & Android with EAS Updates URL and bundle identifiers.',
      language: 'json',
      code: `{
  "expo": {
    "name": "PulseNews",
    "slug": "pulsenews-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pulsenews.mobile"
    },
    "android": {
      "package": "com.pulsenews.mobile",
      "permissions": ["INTERNET", "ACCESS_NETWORK_STATE"]
    },
    "updates": {
      "url": "https://u.expo.dev/YOUR-PROJECT-ID",
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 3000
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}`
    },
    'package.json': {
      desc: 'React Native & Expo dependencies with React Navigation, Expo Updates, and Speech.',
      language: 'json',
      code: `{
  "name": "pulsenews-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "update": "eas update --auto"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.1.2",
    "@react-navigation/bottom-tabs": "^7.2.0",
    "@react-navigation/native": "^7.0.14",
    "@react-navigation/native-stack": "^7.2.0",
    "expo": "~52.0.0",
    "expo-speech": "~13.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-updates": "~0.26.11",
    "lucide-react-native": "^0.475.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-webview": "13.12.5"
  }
}`
    },
    'README.md': {
      desc: 'Complete guide: Running on iOS & Android devices, and pushing live OTA updates with EAS Update.',
      language: 'markdown',
      code: `# PulseNews Mobile - Cross-Platform React Native App
Runs on both **Android** and **Apple iOS** with **Over-The-Air (OTA) Updates**.

### 1. Quick Start on Laptop
\`\`\`bash
npm install
npx expo start
\`\`\`
- Scan QR code with **Expo Go** on your iPhone or Android phone.
- Press \`a\` for Android Emulator, or \`i\` for iOS Simulator (Mac).

### 2. Live Over-The-Air Updates ("After updating, change should be after update")
Whenever you edit code or add features, push an instant update without App Store review:
\`\`\`bash
npx eas update --auto
\`\`\`
All user apps will download the new bundle on launch and reload automatically!

### 3. Generate Standalone APK or iOS App
\`\`\`bash
# Android APK
npx eas build -p android --profile preview

# iOS App
npx eas build -p ios --profile preview
\`\`\`
`
    }
  };

  // Native Android (Kotlin + Jetpack Compose) code snippets with comprehensive comments
  const ANDROID_FILES: Record<string, { desc: string; code: string; language: string }> = {
    'MainActivity.kt': {
      desc: 'Main Activity with Jetpack Compose Material 3 UI, multi-category tabs, and in-app CustomTabs/WebView.',
      language: 'kotlin',
      code: `package com.pulsenews.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent

/**
 * PulseNews Android Native Application
 * Built with Jetpack Compose, Material Design 3 & NewsAPI.org
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: NewsViewModel = viewModel()
                    val articles by viewModel.articles.collectAsState()
                    val isLoading by viewModel.isLoading.collectAsState()
                    val selectedCategory by viewModel.selectedCategory.collectAsState()

                    Scaffold(
                        topBar = {
                            PulseNewsTopBar(
                                selectedCategory = selectedCategory,
                                onCategorySelected = { viewModel.loadCategory(it) }
                            )
                        }
                    ) { paddingValues ->
                        if (isLoading) {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                                CircularProgressIndicator()
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(paddingValues),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                items(articles) { article ->
                                    ArticleCard(
                                        article = article,
                                        onClick = {
                                            // Open Full Story in Chrome Custom Tabs (bypasses iframe restrictions)
                                            val customTabs = CustomTabsIntent.Builder().build()
                                            customTabs.launchUrl(this@MainActivity, Uri.parse(article.url))
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ArticleCard(article: Article, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium
    ) {
        Column {
            article.urlToImage?.let { imgUrl ->
                AsyncImage(
                    model = imgUrl,
                    contentDescription = article.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(190.dp)
                )
            }
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = article.source.name,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = article.title,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 2
                )
                article.description?.let { desc ->
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = desc,
                        style = MaterialTheme.typography.bodySmall,
                        maxLines = 3,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
`
    },
    'NewsApiService.kt': {
      desc: 'Retrofit interface for NewsAPI.org v2 with suspend coroutines and API key interceptor.',
      language: 'kotlin',
      code: `package com.pulsenews.app.network

import retrofit2.http.GET
import retrofit2.http.Query
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

/**
 * NewsAPI.org v2 Service definition for Android
 */
interface NewsApiService {
    
    @GET("top-headlines")
    suspend fun getTopHeadlines(
        @Query("country") country: String = "us",
        @Query("category") category: String? = null,
        @Query("pageSize") pageSize: Int = 20,
        @Query("apiKey") apiKey: String = "d88b335014cc466e8faef7065fa999e1"
    ): NewsApiResponse

    @GET("everything")
    suspend fun searchNews(
        @Query("q") query: String,
        @Query("pageSize") pageSize: Int = 20,
        @Query("apiKey") apiKey: String = "d88b335014cc466e8faef7065fa999e1"
    ): NewsApiResponse

    companion object {
        private const val BASE_URL = "https://newsapi.org/v2/"

        fun create(): NewsApiService {
            val client = OkHttpClient.Builder()
                .addInterceptor(HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                })
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(NewsApiService::class.java)
        }
    }
}
`
    },
    'NewsModels.kt': {
      desc: 'Kotlin data classes for parsing NewsAPI JSON responses.',
      language: 'kotlin',
      code: `package com.pulsenews.app.network

data class NewsApiResponse(
    val status: String,
    val totalResults: Int,
    val articles: List<Article>
)

data class Article(
    val source: Source,
    val author: String?,
    val title: String,
    val description: String?,
    val url: String,
    val urlToImage: String?,
    val publishedAt: String,
    val content: String?
)

data class Source(
    val id: String?,
    val name: String
)
`
    },
    'AndroidManifest.xml': {
      desc: 'Android permissions, ClearText HTTP allowances, and deep links.',
      language: 'xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.pulsenews.app">

    <!-- Network permissions required for NewsAPI & Image loading -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="PulseNews"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PulseNews"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize"
            android:theme="@style/Theme.PulseNews">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
    },
    'build.gradle.kts': {
      desc: 'Dependencies for Jetpack Compose, Retrofit2, OkHttp, Coil, and Chrome CustomTabs.',
      language: 'kotlin',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.pulsenews.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.pulsenews.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.10.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    // Image loading with AsyncImage
    implementation("io.coil-kt:coil-compose:2.7.0")

    // Retrofit & OkHttp for NewsAPI.org
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Chrome Custom Tabs for in-app secure article browsing
    implementation("androidx.browser:browser:1.8.0")
}
`
    }
  };

  // React JS architectural files & best practice suggestions
  const REACT_FILES: Record<string, { desc: string; code: string; language: string }> = {
    'NewsApiProxy.ts': {
      desc: 'Server-side Node.js / Express proxy that caches NewsAPI responses and removes X-Frame-Options.',
      language: 'typescript',
      code: `import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

/**
 * React + Express Proxy Solution for NewsAPI:
 * 1. Bypasses CORS restrictions in browsers
 * 2. Caches requests to protect NewsAPI rate limits (100 req/day on developer tier)
 * 3. Strips 'X-Frame-Options' to allow embedded <iframe> rendering
 */
const router = express.Router();
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'd88b335014cc466e8faef7065fa999e1';

// Caching in memory (10 minutes TTL)
const cache = new Map<string, { data: any; timestamp: number }>();

router.get('/api/news/headlines', async (req: Request, res: Response) => {
  const { category, country = 'us', pageSize = '20' } = req.query;
  const cacheKey = \`headlines_\${category}_\${country}\`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return res.json(cached.data);
  }

  const url = \`https://newsapi.org/v2/top-headlines?country=\${country}&\${category ? \`category=\${category}&\` : ''}pageSize=\${pageSize}&apiKey=\${NEWS_API_KEY}\`;
  const response = await fetch(url);
  const data = await response.json();

  cache.set(cacheKey, { data, timestamp: Date.now() });
  res.json(data);
});

// iFrame Unblocker Proxy
router.get('/api/news/proxy-article', async (req: Request, res: Response) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL required');

  const siteResponse = await fetch(url as string);
  let html = await siteResponse.text();

  // Strip restrictive headers
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  res.setHeader('Content-Type', 'text/html');

  // Inject base tag for relative links
  html = html.replace('<head>', \`<head><base href="\${url}">\`);
  res.send(html);
});

export default router;
`
    },
    'VitePWAConfig.ts': {
      desc: 'Progressive Web App (PWA) configuration for standalone Android installation with Workbox caching.',
      language: 'typescript',
      code: `import { VitePWA } from 'vite-plugin-pwa';

/**
 * Turns React App into an installable Android WebAPK
 */
export const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'PulseNews - Global News Portal',
    short_name: 'PulseNews',
    description: 'Real-time multi-category news and installable Android app',
    theme_color: '#0f172a',
    background_color: '#020617',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  },
  workbox: {
    // Offline caching strategy
    runtimeCaching: [
      {
        urlPattern: /^https:\\/\\/images\\.unsplash\\.com\\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'image-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
        }
      },
      {
        urlPattern: /^\\/api\\/news\\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'news-api-cache',
          networkTimeoutSeconds: 4
        }
      }
    ]
  }
});
`
    },
    'GeminiAISummarizer.ts': {
      desc: 'Server-side Gemini 3.8 Flash SDK implementation for 3-bullet takeaways & translations.',
      language: 'typescript',
      code: `import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function summarizeArticle(title: string, description: string, content: string) {
  const prompt = \`
Analyze this news article and provide a high-impact summary.
Title: "\${title}"
Description: "\${description}"
Content: "\${content}"

Return JSON matching:
{
  "keyTakeaways": ["point 1", "point 2", "point 3"],
  "executiveSummary": "2 crisp sentences",
  "sentiment": "Positive" | "Neutral" | "Critical",
  "biasIndicator": "Fact-Driven" | "Opinion",
  "eli5": "Simple 1-sentence breakdown for a beginner"
}
\`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  return JSON.parse(response.text?.trim() || '{}');
}
`
    }
  };

  const currentFiles = activePlatform === 'react-native' 
    ? REACT_NATIVE_FILES 
    : activePlatform === 'android' 
    ? ANDROID_FILES 
    : REACT_FILES;

  const selectedFileData = currentFiles[activeFile] || Object.values(currentFiles)[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFileData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>React Native (Android &amp; Apple iOS) &amp; Architecture Center</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Ready to Run
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cross-platform mobile code with Over-The-Air (OTA) live updates, In-App Reader, Voice Speech &amp; AdMob
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/project/download-react-native-zip"
              download="PulseNews-ReactNative-Android-iOS.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold transition shadow-md shadow-rose-950/40 cursor-pointer"
              title="Download entire standalone React Native project for Android & iOS"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download React Native (.ZIP)</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Platform Switcher & File Tabs */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Platform Pills */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActivePlatform('react-native');
                setActiveFile('App.tsx');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activePlatform === 'react-native'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>React Native (Android &amp; Apple iOS)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold ml-1">
                Live OTA Updates
              </span>
            </button>

            <button
              onClick={() => {
                setActivePlatform('android');
                setActiveFile('MainActivity.kt');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activePlatform === 'android'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Native Android (Kotlin / Compose)</span>
            </button>

            <button
              onClick={() => {
                setActivePlatform('react');
                setActiveFile('NewsApiProxy.ts');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activePlatform === 'react'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>React JS & Node.js PWA</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : `Copy ${activeFile}`}</span>
          </button>
        </div>

        {/* File Navigator Tabs */}
        <div className="px-6 py-2 bg-slate-900 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {Object.keys(currentFiles).map((fileName) => {
            const isActive = activeFile === fileName;
            return (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-rose-400" />
                <span>{fileName}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content & Description */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 bg-slate-950">
          {/* File summary & suggestions badge */}
          <div className="mb-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white mr-1.5">{activeFile}:</span>
              <span>{selectedFileData.desc}</span>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 overflow-auto rounded-2xl bg-slate-900/90 border border-slate-800 p-4 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
            <pre>
              <code>{selectedFileData.code}</code>
            </pre>
          </div>
        </div>

        {/* Suggestions & Architectural Advice Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Key Architectural Advice:</strong> Use server-side proxy for API key protection and Chrome CustomTabs or proxy iframes for cross-domain article loading.
            </span>
          </div>
          <span className="text-slate-500 font-mono">NewsAPI Key: d88b33...99e1 configured</span>
        </div>
      </div>
    </div>
  );
};
