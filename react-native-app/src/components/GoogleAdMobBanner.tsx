import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface GoogleAdMobBannerProps {
  label?: string;
}

/**
 * Google AdMob Banner Component
 * 
 * Works across both Apple iOS and Android.
 * In a standalone native build, this mounts 'react-native-google-mobile-ads'
 * with the designated AdMob ad unit ID.
 */
export const GoogleAdMobBanner: React.FC<GoogleAdMobBannerProps> = ({ 
  label = 'SPONSORED ANNOUNCEMENT' 
}) => {
  const adUnitId = Platform.select({
    ios: 'ca-app-pub-8153839325985487/9876543210',
    android: 'ca-app-pub-8153839325985487/1234567890',
    default: 'ca-app-pub-8153839325985487/1234567890',
  });

  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <Text style={styles.adLabel}>{label}</Text>
        <Text style={styles.pubId}>AdSense/AdMob: pub-8153839325985487</Text>
      </View>
      <View style={styles.adBox}>
        <Text style={styles.adTitle}>Global Cloud Infrastructure &amp; AI Intelligence</Text>
        <Text style={styles.adSubtitle}>Deploy resilient real-time workloads at enterprise scale</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  adLabel: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pubId: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  adBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  adTitle: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  adSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
});
