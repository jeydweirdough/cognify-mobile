import { Colors, Fonts } from '@/constants/cognify-theme';
import { Subject } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const CARD_COLORS = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0'];

interface SubjectCardProps {
  subject: Subject & { progress?: number }; // Extend type to include progress
  index: number;
  onPress: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, index, onPress }) => {
  const backgroundColor = CARD_COLORS[index % CARD_COLORS.length];
  const progress = subject.progress || 0; // Default to 0 if missing

  return (
    <Pressable
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{subject.title}</Text>
        <Text style={styles.subtitle}>{subject.description || 'No description'}</Text>
        
        {/* PROGRESS BAR SECTION */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% Completed</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{subject.pqf_level ? `Level ${subject.pqf_level}` : 'General'}</Text>
          </View>
          <View style={styles.iconBtn}>
            <Ionicons name="arrow-forward" size={16} color="#333" />
          </View>
        </View>
      </View>
      
      {/* Decorative Image (Optional) */}
      <Image 
        source={require('@/assets/images/book1.png')} 
        style={styles.image}
        resizeMode="contain"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 140,
    overflow: 'hidden',
  },
  content: { flex: 1, marginRight: 10, justifyContent: 'space-between' },
  title: { fontFamily: Fonts.poppinsMedium, fontSize: 17, color: '#333', lineHeight: 22 },
  subtitle: { fontFamily: Fonts.poppinsRegular, fontSize: 12, color: '#666', marginTop: 4, marginBottom: 12 },
  
  // Progress Styles
  progressContainer: { marginTop: 'auto', marginBottom: 10 },
  progressTrack: { height: 5, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2.5, width: '100%', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2.5 },
  progressText: { fontFamily: Fonts.poppinsRegular, fontSize: 10, color: '#666' },

  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  tag: { backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  tagText: { fontFamily: Fonts.poppinsMedium, fontSize: 10, color: '#333' },
  iconBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  image: { width: 90, height: 90, position: 'absolute', right: -10, bottom: -10, opacity: 0.8 },
});