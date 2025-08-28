import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to initialization screen first
    router.replace('/initialization');
  }, [router]);
  
  return null;
}