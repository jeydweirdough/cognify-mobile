// UNCOMMENT THIS IF YOU WANT TO USE REAL BACKEND DATA


// import React from "react"; 
// import { View, Text, Pressable, Image, StyleSheet, Platform } from "react-native";
// import { router } from "expo-router";
// import { Fonts } from '@/constants/cognify-theme'; 

// const images: any = {
//   "1": require("@/assets/images/psych_asses.png"),
//   "2": require("@/assets/images/dev_psych.png"),
//   "3": require("@/assets/images/abnormal_psych.png"),
//   "4": require("@/assets/images/io_psych.png"),
// };

// export const SubjectCard = ({ data }: any) => {
//   return (
//     <View style={{ marginBottom: 20 }}>
//       <Text style={styles.subjectTitleOutside}>{data.name}</Text>

//       <Pressable
//         style={[styles.subjectCard, { backgroundColor: data.cardBgColor }]}
//         onPress={() => router.push(`/(app)/subject/${data.id}`)}
//       >
//         <View style={styles.row}>
//           <View style={[styles.iconBox, { backgroundColor: data.iconBgColor }]}>
//             <Image
//               source={images[data.id]}
//               style={styles.iconImage}
//               resizeMode="contain"
//             />
//           </View>

//           <View style={styles.rightColumn}>
//             <View style={styles.descRow}>
//               <Text style={styles.description}>{data.description}</Text>
//               <Text style={styles.percentageText}>{data.percentage}%</Text>
//             </View>

//             <View style={styles.progressBarBackground}>
//               <View
//                 style={[
//                   styles.progressFill,
//                   { width: `${data.percentage}%`, backgroundColor: data.iconColor },
//                 ]}
//               />
//             </View>
//           </View>
//         </View>
//       </Pressable>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   subjectTitleOutside: {
//     fontFamily: Fonts.lexendDecaMedium, 
//     fontSize: 15,
//     color: "#222",
//     marginBottom: 20,
//     marginLeft: 4,
//   },

//   subjectCard: {
//     borderRadius: 20,
//     paddingVertical: 18,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: "#AFAFAF",

//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.06,
//         shadowRadius: 3,
//       },
//       android: {
//         elevation: 1,
//       },
//     }),
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//   },

//   iconBox: {
//     width: 72,
//     height: 72,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   iconImage: {
//     width: 50,
//     height: 50,
//   },

//   rightColumn: {
//     flex: 1,
//     marginLeft: 14,
//   },

//   descRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },

//   description: {
//     flex: 1,
//     fontFamily: Fonts.lexendDecaRegular, 
//     fontSize: 12.5,
//     color: "#333",
//     lineHeight: 18,
//     marginRight: 12,
//   },

//   percentageText: {
//     fontFamily: Fonts.lexendDecaMedium, 
//     fontSize: 14,
//     color: "#444",
//     marginTop: 2,
//   },

//   progressBarBackground: {
//     marginTop: 8,
//     height: 6,
//     borderRadius: 6,
//     backgroundColor: "#D7D7D7",
//     overflow: "hidden",
//   },

//   progressFill: {
//     height: "100%",
//     borderRadius: 6,
//   },
// });

import React from "react";
import { View, Text, Pressable, Image, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { Fonts } from '@/constants/cognify-theme'; 


const images: any = {
  "1": require("@/assets/images/psych_asses.png"),
  "2": require("@/assets/images/dev_psych.png"),
  "3": require("@/assets/images/abnormal_psych.png"),
  "4": require("@/assets/images/io_psych.png"),
};

export const SubjectCard = ({ data }: any) => {
  return (
    <View style={{ marginBottom: 20 }}>
      {/* ❗ Title outside the box (same as screenshot) */}
      <Text style={styles.subjectTitleOutside}>{data.name}</Text>

      <Pressable
        style={[styles.subjectCard, { backgroundColor: data.cardBgColor }]}
        onPress={() => router.push(`/(app)/subject/${data.id}`)}
      >
        <View style={styles.row}>
          {/* Icon box */}
          <View style={[styles.iconBox, { backgroundColor: data.iconBgColor }]}>
            <Image
              source={images[data.id]}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>

          {/* Right side content */}
          <View style={styles.rightColumn}>
            {/* Description + percentage in ONE ROW */}
            <View style={styles.descRow}>
              <Text style={styles.description}>{data.description}</Text>
              <Text style={styles.percentageText}>{data.percentage}%</Text>
            </View>

            {/* Progress + percentage ends at the right */}
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${data.percentage}%`, backgroundColor: data.iconColor },
                ]}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  /** Title outside (above the card box) */
  subjectTitleOutside: {
    fontFamily: Fonts.lexendDecaMedium,
    fontSize: 15,
    color: "#222",
    marginBottom: 20,
    marginLeft: 4,
  },

  subjectCard: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#AFAFAF",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  /** Icon box */
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  iconImage: {
    width: 50,
    height: 50,
  },

  /** Right Column */
  rightColumn: {
    flex: 1,
    marginLeft: 14,
  },

  /** Description and percentage */
  descRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  description: {
    flex: 1,
    fontFamily: Fonts.lexendDecaRegular,
    fontSize: 12.5,
    color: "#333",
    lineHeight: 18,
    marginRight: 12,
  },

  percentageText: {
    fontFamily: Fonts.lexendDecaMedium,
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },

  /** Progress Bar */
  progressBarBackground: {
    marginTop: 8,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#D7D7D7",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
});