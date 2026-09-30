import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { updateService } from '../services/updateService';
import { RefreshCw, CheckCircle, Sparkles } from 'lucide-react-native';

export const UpdateBanner: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setStatusMsg(null);
    const res = await updateService.checkManually();
    setChecking(false);
    setStatusMsg(res.message);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const info = updateService.getUpdateInfo();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Sparkles size={14} color="#38bdf8" />
        <View style={styles.textCol}>
          <Text style={styles.title}>Over-The-Air (OTA) Live Updates</Text>
          <Text style={styles.subText}>
            Channel: {info.channel} &bull; v{info.runtimeVersion} &bull; {info.platform.toUpperCase()}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.checkBtn} 
        onPress={handleCheck}
        disabled={checking}
        activeOpacity={0.7}
      >
        {checking ? (
          <ActivityIndicator size="small" color="#38bdf8" />
        ) : (
          <>
            <RefreshCw size={12} color="#38bdf8" />
            <Text style={styles.btnText}>Check Updates</Text>
          </>
        )}
      </TouchableOpacity>

      {statusMsg && (
        <View style={styles.statusToast}>
          <Text style={styles.statusText}>{statusMsg}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0369a120',
    borderColor: '#0284c740',
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '700',
  },
  subText: {
    color: '#7dd3fc',
    fontSize: 10,
    marginTop: 1,
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0c4a6e',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnText: {
    color: '#bae6fd',
    fontSize: 10,
    fontWeight: '600',
  },
  statusToast: {
    position: 'absolute',
    bottom: -28,
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    borderColor: '#38bdf8',
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    zIndex: 99,
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 10,
  },
});
