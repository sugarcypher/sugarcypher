import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ShoppingStoreProvider } from '@/store/shoppingStore';
import { GamificationProvider } from '@/store/gamificationStore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="initialization" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/meet-sniffa" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/features" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/permissions" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('App initializing...');
        
        // Minimal initialization to avoid Hermes issues
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ShoppingStoreProvider>
      <GamificationProvider>
        <RootLayoutNav />
      </GamificationProvider>
    </ShoppingStoreProvider>
  );
}