import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { Article } from '../types';
import { getBookmarks, toggleBookmark } from '../services/storage';
import { NewsCard } from '../components/NewsCard';
import { Bookmark, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BookmarksScreen = ({ navigation }: any) => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  const loadBookmarks = async () => {
    const list = await getBookmarks();
    setBookmarks(list);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadBookmarks();
    });
    return unsubscribe;
  }, [navigation]);

  const handleClearAll = () => {
    Alert.alert(
      'Clear Saved Articles',
      'Are you sure you want to remove all saved articles?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@pulsenews_bookmarks_v1');
            setBookmarks([]);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Bookmark size={20} color="#f43f5e" />
          <Text style={styles.title}>Saved Dispatches</Text>
          <Text style={styles.countBadge}>({bookmarks.length})</Text>
        </View>

        {bookmarks.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Trash2 size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => item.url + index}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            onPress={() => navigation.navigate('ArticleDetail', { article: item })}
            onBookmarkPress={async () => {
              await toggleBookmark(item);
              loadBookmarks();
            }}
            isBookmarked={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bookmark size={40} color="#334155" />
            <Text style={styles.emptyTitle}>No Bookmarked Stories</Text>
            <Text style={styles.emptySubtitle}>
              Tap the bookmark icon on any news card to save it for offline reading.
            </Text>
          </View>
        }
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  countBadge: {
    color: '#94a3b8',
    fontSize: 14,
  },
  clearBtn: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
