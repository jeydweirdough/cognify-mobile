import { Fonts } from '@/constants/cognify-theme';
import { Subject } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const CARD_COLORS = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0'];

// Mapping subject titles to specific images
const images: Record<string, any> = {
  "Psychological Assessment": require("@/assets/images/psych_asses.png"),
  "Developmental Psychology": require("@/assets/images/dev_psych.png"),
  "Abnormal Psychology": require("@/assets/images/abnormal_psych.png"),
  "Industrial-Organizational Psychology": require("@/assets/images/io_psych.png"),
};

// Default image to use if the subject title isn't found in the list
const DEFAULT_IMAGE = require('@/assets/images/book1.png');

interface SubjectCardProps {
  subject: Subject; 
  index: number;
  onPress: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, index, onPress }) => {
  const backgroundColor = CARD_COLORS[index % CARD_COLORS.length];
  
  // Select the image based on the title, or use the default
  const cardImage = images[subject.title] || DEFAULT_IMAGE;

  return (
    <Pressable
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{subject.title}</Text>
          <Text style={styles.subtitle}>{subject.description || 'No description'}</Text>
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
      
      {/* Decorative Image */}
      <Image 
        source={cardImage} 
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
  content: { 
    flex: 1, 
    marginRight: 10, 
    justifyContent: 'space-between' 
  },
  title: { 
    fontFamily: Fonts.poppinsMedium, 
    fontSize: 17, 
    color: '#333', 
    lineHeight: 22 
  },
  subtitle: { 
    fontFamily: Fonts.poppinsRegular, 
    fontSize: 12, 
    color: '#666', 
    marginTop: 4, 
    marginBottom: 12, 
    paddingRight: 60,
  },
  footer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },
  tag: { 
    backgroundColor: 'rgba(255,255,255,0.6)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginRight: 8 
  },
  tagText: { 
    fontFamily: Fonts.poppinsMedium, 
    fontSize: 10, 
    color: '#333' 
  },
  iconBtn: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  image: { 
    width: 90, 
    height: 90, 
    position: 'absolute', 
    right: -10, 
    bottom: -10, 
    opacity: 0.8 
  },
});