import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  Image 
} from 'react-native';
import * as Speech from 'expo-speech';
import { Article } from '../types';
import { fetchHeadlines } from '../services/api';
import { Headphones, Play, Pause, SkipForward, Volume2 } from 'lucide-react-native';

export const AudioPodcastScreen = ({ navigation }: any) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchHeadlines('all').then(res => {
      setArticles(res.articles.slice(0, 8));
    });

    return () => {
      Speech.stop();
    };
  }, []);

  const playArticle = (index: number) => {
    if (index >= articles.length) {
      setIsPlaying(false);
      return;
    }
    setCurrentIndex(index);
    const item = articles[index];
    const speechText = `Story ${index + 1}. ${item.title}. ${item.description || ''}`;

    Speech.stop();
    Speech.speak(speechText, {
      language: 'en',
      rate: 0.95,
      onDone: () => {
        // Auto play next
        playArticle(index + 1);
      },
      onError: () => setIsPlaying(false),
    });
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      playArticle(currentIndex);
    }
  };

  const currentArticle = articles[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Headphones size={22} color="#fbbf24" />
        <Text style={styles.title}>Daily Audio Podcast</Text>
      </View>

      {/* Featured Player Card */}
      {currentArticle && (
        <View style={styles.playerCard}>
          {currentArticle.urlToImage && (
            <Image 
              source={{ uri: currentArticle.urlToImage }} 
              style={styles.playerImage} 
              resizeMode="cover" 
            />
          )}

          <View style={styles.nowPlayingRow}>
            <Volume2 size={14} color="#fbbf24" />
            <Text style={styles.nowPlayingText}>
              NOW NARRATING &bull; STORY {currentIndex + 1} OF {articles.length}
            </Text>
          </View>

          <Text style={styles.playerTitle} numberOfLines={2}>
            {currentArticle.title}
          </Text>

          {/* Controls */}
          <View style={styles.controlRow}>
            <TouchableOpacity 
              style={styles.playBtn} 
              onPress={togglePlay}
              activeOpacity={0.8}
            >
              {isPlaying ? (
                <Pause size={24} color="#020617" />
              ) : (
                <Play size={24} color="#020617" fill="#020617" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipBtn}
              onPress={() => playArticle(currentIndex + 1)}
              disabled={currentIndex >= articles.length - 1}
            >
              <SkipForward size={20} color="#f8fafc" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Playlist Queue */}
      <Text style={styles.queueHeader}>Upcoming Stories in Queue</Text>
      <FlatList
        data={articles}
        keyExtractor={(item, idx) => item.url + idx}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={[styles.queueItem, index === currentIndex && styles.queueItemActive]}
            onPress={() => playArticle(index)}
          >
            <Text style={[styles.queueIndex, index === currentIndex && styles.queueIndexActive]}>
              {index + 1}
            </Text>
            <View style={styles.queueTextCol}>
              <Text style={styles.queueTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.queueSource}>{item.source.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.queueList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  playerCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  playerImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#1e293b',
  },
  nowPlayingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  nowPlayingText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playerTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  playBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueHeader: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  queueList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  queueItemActive: {
    borderColor: '#fbbf24',
    backgroundColor: '#1c1917',
  },
  queueIndex: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
    width: 24,
  },
  queueIndexActive: {
    color: '#fbbf24',
  },
  queueTextCol: {
    flex: 1,
  },
  queueTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  queueSource: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
});
