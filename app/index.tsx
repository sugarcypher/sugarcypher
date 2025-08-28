import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Use a small delay to ensure the navigator is mounted
    const timer = setTimeout(() => {
      router.replace('/initialization');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  // Return a minimal view instead of null to prevent mounting issues
  return <View style={{ flex: 1, backgroundColor: '#000' }} />;
}