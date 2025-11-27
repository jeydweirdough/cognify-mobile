import React from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    SafeAreaView, 
    StatusBar 
} from "react-native"; 
import { useAuth } from "@/lib/auth"; 
import { User } from "@/lib/types";

interface HeaderProps {
    title: string;
}

// --- NEW COMPONENT: Initials Avatar (Reusable) ---
interface InitialsAvatarProps {
    initials: string;
    size: number;
    borderRadius: number;
}
const InitialsAvatar = ({ initials, size, borderRadius }: InitialsAvatarProps) => (
    <View style={[
        styles.initialsAvatar, 
        { width: size, height: size, borderRadius: borderRadius }
    ]}>
        <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>
            {initials.toUpperCase()}
        </Text>
    </View>
);
// ---------------------------------------------------


const Header = ({ title }: HeaderProps) => {
    const { user } = useAuth();

    const subtitle =
        user?.first_name || user?.last_name
            ? `Hello, ${user.first_name || ""}`.trim() 
            : "Hello, User";

    // 1. Get the image URL from the user object
    // Prioritizing 'profile_picture' as used in the EditProfileScreen
    const profileImageUrl = user?.profile_picture || user?.profile_image;

    // 2. Get initials for the fallback avatar
    const firstNameInitial = user?.first_name?.charAt(0) || '';
    const initials = firstNameInitial; 
    
    // Define the required size and radius for the Header avatar
    const avatarSize = 70;
    const avatarBorderRadius = 16;


    return (
        <SafeAreaView style={styles.safeArea}>
            
            <StatusBar 
                barStyle="dark-content" 
                backgroundColor="#F7F8FB" 
            />

            {/*Main Content View */}
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                {/* CONDITIONAL AVATAR RENDERING */}
                {profileImageUrl ? (
                    // 3a. Render dynamic image if URL exists
                    <Image
                        source={{ uri: profileImageUrl }}
                        style={styles.profileImage}
                    />
                ) : (
                    // 3b. Render Initials Avatar if URL is null/undefined
                    <InitialsAvatar
                        initials={initials}
                        size={avatarSize}
                        borderRadius={avatarBorderRadius}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#F7F8FB",
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: "#F7F8FB", 
    },
    textContainer: {
        flexDirection: "column",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    subtitle: {
        fontSize: 16,
        color: "#8E8E93",
        marginTop: 2,
    },
    // Style for the actual profile image (must match size for InitialsAvatar)
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 16,
    },
    // NEW STYLE for the Initials Avatar background
    initialsAvatar: {
        backgroundColor: '#d746f7ff', // Gray background
        justifyContent: 'center',
        alignItems: 'center',
        // Dimensions are set inline
    },
    // NEW STYLE for the Initials text
    initialsText: {
        color: '#f9eeeeff', // White text
        fontWeight: 'bold',
    },
});

export default Header;