import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FONT_FAMILY, PRIMARY_COLOR, BACKGROUND_COLOR } from "@/constants/cognify-theme";

const books = [
  {
    title: "Organizational Theory, Design and Change",
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400",
    progress: 65,
  },
  {
    title: "PSYCHOLOGY",
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400",
    progress: 32,
  },
  {
    title: "Organizer",
    image: "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=400",
    progress: 80,
  },
];

export default function ContinueReading() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Continue reading:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.booksContainer}
        contentContainerStyle={styles.booksContentContainer}
      >
        {books.map((book, index) => (
          <TouchableOpacity key={index} style={styles.bookCard} activeOpacity={0.8}>
            <View style={styles.bookCover}>
              <Image source={{ uri: book.image }} style={styles.bookImage} />
              <View style={styles.bookOverlay}>
                <Text style={styles.bookTitle} numberOfLines={3}>{book.title}</Text>
              </View>
            </View>
            <View style={styles.bookProgressContainer}>
              <View style={styles.bookProgressBar}>
                <View style={[styles.bookProgressFill, { width: `${book.progress}%` }]} />
              </View>
              <Text style={styles.bookProgressText}>{book.progress}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  sectionTitle: { fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: "600", color: "#000" },
  booksContainer: { marginTop: 12, marginHorizontal: -20, paddingHorizontal: 20 },
  booksContentContainer: { paddingRight: 20 },
  bookCard: { marginRight: 15, width: 120 },
  bookCover: { width: 120, height: 180, borderRadius: 12, overflow: "hidden", backgroundColor: "#E0E0E0" },
  bookImage: { width: "100%", height: "100%", resizeMode: "cover" },
  bookOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.7)", padding: 10, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  bookTitle: { fontFamily: FONT_FAMILY, color: "#FFF", fontSize: 11, fontWeight: "700", lineHeight: 14 },
  bookProgressContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  bookProgressBar: { flex: 1, height: 4, backgroundColor: "#E0E0E0", borderRadius: 2, marginRight: 8, overflow: "hidden" },
  bookProgressFill: { height: "100%", backgroundColor: PRIMARY_COLOR, borderRadius: 2 },
  bookProgressText: { fontFamily: FONT_FAMILY, fontSize: 12, fontWeight: "600", color: PRIMARY_COLOR },
});
