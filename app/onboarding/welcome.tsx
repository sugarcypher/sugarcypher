import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Zap } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  return (
    <LinearGradient
      colors={['#0A0A0A', '#1A1A2E', '#16213E']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#00D4FF', '#5A67D8', '#667EEA']}
            style={styles.iconGradient}
          >
            <Eye size={40} color="white" />
          </LinearGradient>
        </View>
        
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>SugarCypher</Text>
        
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>The average person consumes 17 teaspoons of hidden sugar daily</Text>
          <Text style={styles.taglineEmphasis}>We'll help you cut that in half.</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2M+</Text>
            <Text style={styles.statLabel}>Foods Analyzed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>40%</Text>
            <Text style={styles.statLabel}>Sugar Reduction</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>95%</Text>
            <Text style={styles.statLabel}>Accuracy Rate</Text>
          </View>
        </View>
        
        <View style={styles.featuresPreview}>
          <Text style={styles.featureText}>🔍 Instant barcode & photo scanning</Text>
          <Text style={styles.featureText}>🧠 MetaSweet™ hidden sugar detection</Text>
          <Text style={styles.featureText}>⚡ Personalized health recommendations</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => router.push('/onboarding/meet-sniffa')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.buttonGradient}
          >
            <Zap size={20} color="white" />
            <Text style={styles.buttonText}>INITIATE CYPHER</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
    marginBottom: 30,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#8892B0',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '300',
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 2,
  },
  taglineContainer: {
    marginBottom: 40,
  },
  tagline: {
    fontSize: 18,
    color: '#8892B0',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '400',
  },
  taglineEmphasis: {
    fontSize: 20,
    color: '#00D4FF',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00D4FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8892B0',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresPreview: {
    marginBottom: 50,
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#8892B0',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  continueButton: {
    width: '100%',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 1,
  }
});