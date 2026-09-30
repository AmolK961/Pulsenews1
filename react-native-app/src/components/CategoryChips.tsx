import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CATEGORIES = [
  { id: 'all', label: '🔥 All News' },
  { id: 'technology', label: '💻 Tech' },
  { id: 'business', label: '📈 Business' },
  { id: 'sports', label: '🏆 Sports' },
  { id: 'entertainment', label: '🎬 Cinema' },
  { id: 'science', label: '🔬 Science' },
  { id: 'health', label: '🩺 Health' },
];

interface CategoryChipsProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ selected, onSelect }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[styles.chip, isSelected && styles.chipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chipActive: {
    backgroundColor: '#e11d48',
    borderColor: '#f43f5e',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
});
