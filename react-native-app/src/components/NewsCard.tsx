import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Article } from '../types';
import { Clock, Bookmark, Share2 } from 'lucide-react-native';

interface NewsCardProps {
  article: Article;
  onPress: () => void;
  onBookmarkPress?: () => void;
  isBookmarked?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onPress,
  onBookmarkPress,
  isBookmarked = false,
}) => {
  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      if (hours === 1) return '1h ago';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  const imageUri = article.urlToImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.sourceText} numberOfLines={1}>
            {article.source.name || 'PulseNews'}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={11} color="#94a3b8" />
            <Text style={styles.timeText}>{timeAgo(article.publishedAt)}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>

        {article.description && (
          <Text style={styles.description} numberOfLines={2}>
            {article.description}
          </Text>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.authorText} numberOfLines={1}>
            {article.author ? `By ${article.author}` : 'Verified Dispatch'}
          </Text>

          {onBookmarkPress && (
            <TouchableOpacity 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={onBookmarkPress}
              style={styles.bookmarkBtn}
            >
              <Bookmark 
                size={16} 
                color={isBookmarked ? '#f43f5e' : '#94a3b8'} 
                fill={isBookmarked ? '#f43f5e' : 'none'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#1e293b',
  },
  content: {
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sourceText: {
    color: '#fb7185',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  title: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 6,
  },
  description: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
    marginTop: 4,
  },
  authorText: {
    color: '#64748b',
    fontSize: 11,
    flex: 1,
  },
  bookmarkBtn: {
    padding: 4,
  },
});
