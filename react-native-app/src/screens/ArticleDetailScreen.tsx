import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Share, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { Article, FullArticleData } from '../types';
import { fetchFullArticle } from '../services/api';
import { toggleBookmark, isBookmarked } from '../services/storage';
import { GoogleAdMobBanner } from '../components/GoogleAdMobBanner';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Volume2, 
  VolumeX, 
  Globe, 
  BookOpen, 
  Clock, 
  Type
} from 'lucide-react-native';

export const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { article } = route.params as { article: Article };
  const [viewMode, setViewMode] = useState<'clean' | 'webview'>('clean');
  const [fullArticle, setFullArticle] = useState<FullArticleData | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  useEffect(() => {
    // Check bookmark
    isBookmarked(article.url).then(setBookmarked);

    // Fetch full extracted paragraphs
    fetchFullArticle(article.url)
      .then(setFullArticle)
      .finally(() => setLoadingContent(false));

    return () => {
      // Stop speech on unmount
      Speech.stop();
    };
  }, [article.url]);

  const handleShare = async () => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nRead more on PulseNews: ${article.url}`,
        url: article.url,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookmark = async () => {
    const next = await toggleBookmark(article);
    setBookmarked(next);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const textToRead = `${article.title}. ${article.description || ''}. ${
        fullArticle?.paragraphs ? fullArticle.paragraphs.join('. ') : ''
      }`;
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
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="#f8fafc" />
        </TouchableOpacity>

        {/* Mode Switcher: Clean Reader vs Native WebView */}
        <View style={styles.toggleGroup}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'clean' && styles.toggleBtnActive]}
            onPress={() => setViewMode('clean')}
          >
            <BookOpen size={12} color={viewMode === 'clean' ? '#ffffff' : '#94a3b8'} />
            <Text style={[styles.toggleText, viewMode === 'clean' && styles.toggleTextActive]}>
              Reader
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'webview' && styles.toggleBtnActive]}
            onPress={() => setViewMode('webview')}
          >
            <Globe size={12} color={viewMode === 'webview' ? '#ffffff' : '#94a3b8'} />
            <Text style={[styles.toggleText, viewMode === 'webview' && styles.toggleTextActive]}>
              Web
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions: Text Size, Speech, Bookmark, Share */}
        <View style={styles.actionGroup}>
          {viewMode === 'clean' && (
            <>
              <TouchableOpacity 
                style={styles.iconBtn}
                onPress={() => setFontSizeOffset(prev => prev === 4 ? -2 : prev + 2)}
                title="Adjust Font Size"
              >
                <Type size={18} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.iconBtn, isSpeaking && styles.iconBtnActive]}
                onPress={toggleSpeech}
              >
                {isSpeaking ? (
                  <VolumeX size={18} color="#f43f5e" />
                ) : (
                  <Volume2 size={18} color="#38bdf8" />
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.iconBtn} onPress={handleBookmark}>
            <Bookmark 
              size={18} 
              color={bookmarked ? '#f43f5e' : '#94a3b8'} 
              fill={bookmarked ? '#f43f5e' : 'none'} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Share2 size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Rendering: Clean Mode vs WebView */}
      {viewMode === 'webview' ? (
        <WebView 
          source={{ uri: article.url }} 
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webLoader}>
              <ActivityIndicator size="large" color="#f43f5e" />
            </View>
          )}
        />
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Hero Image */}
          {article.urlToImage && (
            <Image 
              source={{ uri: article.urlToImage }} 
              style={styles.heroImage} 
              resizeMode="cover" 
            />
          )}

          <View style={styles.bodyContent}>
            {/* Meta Tags */}
            <View style={styles.metaRow}>
              <Text style={styles.sourceBadge}>{article.source.name || 'PulseNews Wire'}</Text>
              <View style={styles.timeBadge}>
                <Clock size={11} color="#64748b" />
                <Text style={styles.timeText}>
                  {fullArticle?.readingTimeMinutes ? `${fullArticle.readingTimeMinutes} min read` : '3 min read'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.articleTitle, { fontSize: 20 + fontSizeOffset }]}>
              {article.title}
            </Text>

            {/* Author Attribution */}
            <Text style={styles.articleAuthor}>
              {article.author ? `Reported by ${article.author}` : 'Verified Press Dispatch'} &bull;{' '}
              {new Date(article.publishedAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Text>

            {/* In-Article AdMob Banner */}
            <GoogleAdMobBanner label="ADVERTISEMENT" />

            {/* Lead Callout */}
            {article.description && (
              <View style={styles.leadBox}>
                <Text style={[styles.leadText, { fontSize: 14 + fontSizeOffset }]}>
                  {article.description}
                </Text>
              </View>
            )}

            {/* Full Extracted Body Paragraphs */}
            {loadingContent ? (
              <View style={styles.contentLoader}>
                <ActivityIndicator size="small" color="#f43f5e" />
                <Text style={styles.loaderSubText}>Extracting complete story...</Text>
              </View>
            ) : (
              <View style={styles.paragraphsContainer}>
                {fullArticle?.paragraphs && fullArticle.paragraphs.length > 0 ? (
                  fullArticle.paragraphs.map((para, i) => (
                    <Text 
                      key={i} 
                      style={[styles.paragraphText, { fontSize: 14 + fontSizeOffset }]}
                    >
                      {para}
                    </Text>
                  ))
                ) : (
                  <Text style={[styles.paragraphText, { fontSize: 14 + fontSizeOffset }]}>
                    {article.content || 'Additional details are currently updating across news feeds.'}
                  </Text>
                )}
              </View>
            )}

            {/* Source Accreditation Footer */}
            <View style={styles.sourceFooter}>
              <Text style={styles.footerNote}>
                Original source: {article.source.name}
              </Text>
              <TouchableOpacity onPress={() => setViewMode('webview')}>
                <Text style={styles.viewOriginalLink}>View on publisher website &rarr;</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    backgroundColor: '#020617',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
  iconBtnActive: {
    backgroundColor: '#f43f5e20',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },
  toggleBtnActive: {
    backgroundColor: '#e11d48',
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: '#020617',
  },
  webLoader: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#1e293b',
  },
  bodyContent: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sourceBadge: {
    color: '#fb7185',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#64748b',
    fontSize: 11,
  },
  articleTitle: {
    color: '#f8fafc',
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  articleAuthor: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 16,
  },
  leadBox: {
    backgroundColor: '#0f172a',
    borderLeftWidth: 3,
    borderLeftColor: '#f43f5e',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  leadText: {
    color: '#e2e8f0',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  contentLoader: {
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  loaderSubText: {
    color: '#64748b',
    fontSize: 11,
  },
  paragraphsContainer: {
    marginTop: 8,
  },
  paragraphText: {
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 16,
  },
  sourceFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  footerNote: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 4,
  },
  viewOriginalLink: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
});
