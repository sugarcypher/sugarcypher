import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { sugarEducationLibrary, inspirationalQuotes, SugarFact, InspirationalQuote } from '@/constants/sugarEducation';
import { initializeWithSampleData } from '@/store/foodLogStore';

export default function SplashScreen() {
  const router = useRouter();
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  const [currentFact] = useState<SugarFact>(() => {
    const randomIndex = Math.floor(Math.random() * sugarEducationLibrary.length);
    return sugarEducationLibrary[randomIndex];
  });
  
  const [currentQuote] = useState<InspirationalQuote>(() => {
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    return inspirationalQuotes[randomIndex];
  });
  
  useEffect(() => {
    console.log('SplashScreen mounted');
    
    // Start the glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    
    glowAnimation.start();
    
    return () => {
      glowAnimation.stop();
    };
  }, [glowAnim]);
  
  const handleGetStarted = async () => {
    console.log('Get Started button pressed, initializing data and navigating to tabs');
    
    try {
      // Initialize food log store with sample data
      await initializeWithSampleData();
      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
    
    try {
      console.log('Attempting router.replace to /(tabs)');
      router.replace('/(tabs)' as any);
    } catch (error) {
      console.error('Navigation error with replace:', error);
      try {
        console.log('Fallback: attempting router.push to /(tabs)');
        router.push('/(tabs)');
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
        // Last resort: try navigating to the index of tabs
        try {
          router.push('/(tabs)');
        } catch (lastError) {
          console.error('All navigation attempts failed:', lastError);
        }
      }
    }
  };
  
  return (
    <LinearGradient
      colors={[Colors.background, '#0A0A0A']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image 
            source={{ uri: 'https://r2-pub.rork.com/attachments/zbqmpigoa27m6qt9ms38n' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.appName}>SugarCypher</Text>
        <Text style={styles.tagline}>DECODE YOUR DIET</Text>
        
        <View style={styles.quoteContainer}>
          <Text style={styles.inspirationalText}>
            "{currentQuote.text}"
          </Text>
          {currentQuote.author && (
            <Text style={styles.quoteAuthor}>
              — {currentQuote.author}
            </Text>
          )}
        </View>
        
        <View style={styles.factContainer}>
          <Text style={styles.factTitle}>Did you know?</Text>
          <Text style={styles.factText}>
            {currentFact.content}
          </Text>
        </View>
        
        <Text style={styles.factSubtext}>
          Knowledge is power - use it to transform your health.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Animated.View 
            style={[
              styles.glowRing,
              {
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                shadowRadius: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 20],
                }),
                borderColor: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(139, 92, 246, 0.5)', 'rgba(139, 92, 246, 1)'],
                }),
              }
            ]} 
          />
          
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                I AM READY TO REDUCE MY SUGAR INTAKE!
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.disclaimer}>
          Start your journey to a healthier, sugar-conscious lifestyle today.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00FFCC',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 255, 204, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tagline: {
    fontSize: 16,
    color: '#F5F5DC',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  quoteContainer: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
  },
  inspirationalText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  factContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  factTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  factText: {
    fontSize: 15,
    color: '#FFFFE0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  factSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  getStartedButton: {
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },

  disclaimer: {
    fontSize: 14,
    color: '#FFDAB9',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#14B8A6',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  }
});