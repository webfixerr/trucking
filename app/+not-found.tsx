import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores/auth';

export default function NotFoundScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleNavigateHome = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=2067&auto=format&fit=crop' }}
          style={styles.image}
        />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          We couldn't find the page you're looking for.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleNavigateHome}
        >
          <Text style={styles.buttonText}>
            Return to {isAuthenticated ? 'Home' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 24,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});