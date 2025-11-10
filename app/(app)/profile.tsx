import { StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../lib/auth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      
      {user ? (
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.label}>Email:</ThemedText>
          <ThemedText style={styles.info}>{user.email}</ThemedText>
          
          <ThemedText style={styles.label}>First Name:</ThemedText>
          <ThemedText style={styles.info}>{user.first_name || 'Not set'}</ThemedText>

          <ThemedText style={styles.label}>Last Name:</ThemedText>
          <ThemedText style={styles.info}>{user.last_name || 'Not set'}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedText>Loading profile...</ThemedText>
      )}

      <Button title="Logout" onPress={logout} color="red" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  infoContainer: {
    marginVertical: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  info: {
    fontSize: 16,
  },
});