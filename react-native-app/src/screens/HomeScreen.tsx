import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Article } from '../types';
import { fetchHeadlines } from '../services/api';
import { toggleBookmark, isBookmarked } from '../services/storage';
import { NewsCard } from '../components/NewsCard';
import { CategoryChips } from '../components/CategoryChips';
import { GoogleAdMobBanner } from '../components/GoogleAdMobBanner';
import { UpdateBanner } from '../components/UpdateBanner';
import { Radio, Search, X } from 'lucide-react-native';

export const HomeScreen = ({ navigation }: any) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async (cat: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetchHeadlines(cat);
      // Ensure latest news first (chronological descending sort)
      const sorted = res.articles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      setArticles(sorted);

      // Check bookmark status for each
      const map: Record<string, boolean> = {};
      for (const a of sorted) {
        map[a.url] = await isBookmarked(a.url);
      }
      setBookmarkMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(category);
  }, [category, loadData]);

  const handleBookmarkToggle = async (article: Article) => {
    const newState = await toggleBookmark(article);
    setBookmarkMap(prev => ({ ...prev, [article.url]: newState }));
  };

  const filteredArticles = articles.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.source?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.logoBadge}>
            <Radio size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>
              PULSE<Text style={styles.brandAccent}>NEWS</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              {Platform.OS === 'ios' ? 'Apple iOS Edition' : 'Android Edition'} &bull; Real-Time
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.searchToggle}
          onPress={() => setShowSearch(!showSearch)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Search size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar (when toggled) */}
      {showSearch && (
        <View style={styles.searchBar}>
          <Search size={14} color="#64748b" style={styles.searchIcon} />
          <TextInput
            placeholder="Search news dispatches..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Over-The-Air Live Update Banner */}
      <UpdateBanner />

      {/* Category Chips Bar */}
      <CategoryChips
        selected={category}
        onSelect={(cat) => {
          setCategory(cat);
          setSearchQuery('');
        }}
      />

      {/* Main News Feed */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f43f5e" />
          <Text style={styles.loaderText}>Syncing latest dispatches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item, index) => item.url + index}
          renderItem={({ item, index }) => (
            <>
              {index === 2 && <GoogleAdMobBanner label="IN-FEED SPONSORED DISPATCH" />}
              <NewsCard
                article={item}
                onPress={() => navigation.navigate('ArticleDetail', { article: item })}
                onBookmarkPress={() => handleBookmarkToggle(item)}
                isBookmarked={!!bookmarkMap[item.url]}
              />
            </>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(category, true)}
              tintColor="#f43f5e"
              colors={['#f43f5e']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Dispatches Found</Text>
              <Text style={styles.emptySubtitle}>Try pulling down to refresh or selecting another category.</Text>
            </View>
          }
        />
      )}
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
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#f43f5e',
  },
  brandSubtitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
  },
  searchToggle: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    height: 38,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
});
