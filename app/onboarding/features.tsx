import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Shield, Eye, Zap } from 'lucide-react-native';

export default function FeaturesScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const features = [
    {
      icon: <Brain size={32} color="white" />,
      title: "MetaSweet™ Technology",
      description: "Our proprietary algorithm analyzes 47 different sugar compounds and calculates their metabolic impact on YOUR specific body chemistry. Goes beyond simple carb counting.",
      gradient: ['#667EEA', '#764BA2'] as const,
      stats: "47 sugar types detected"
    },
    {
      icon: <Eye size={32} color="white" />,
      title: "Stealth Sugar Scanner",
      description: "Identifies 200+ hidden sugar aliases that food companies use to disguise sweeteners. From 'evaporated cane juice' to 'brown rice syrup' - we catch them all.",
      gradient: ['#FF6B6B', '#FF8E53'] as const,
      stats: "200+ sugar aliases"
    },
    {
      icon: <Shield size={32} color="white" />,
      title: "Personalized Protection",
      description: "Real-time health alerts based on your diabetes risk, weight goals, and activity level. Get instant alternatives that match your taste preferences.",
      gradient: ['#4ECDC4', '#44A08D'] as const,
      stats: "Custom health profile"
    }
  ];
  
  return (
    <LinearGradient
      colors={['#0F3460', '#16213E', '#1A1A2E']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.title}>How SugarCypher Works</Text>
        
        <ScrollView style={styles.featuresContainer} showsVerticalScrollIndicator={false}>
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0]
                    })
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.cardGradient}
              >
                <View style={styles.iconContainer}>
                  {feature.icon}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                  <Text style={styles.featureStats}>{feature.stats}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </ScrollView>
        
        <View style={styles.cypherBadge}>
          <LinearGradient
            colors={['#00D4FF', '#5A67D8']}
            style={styles.badgeGradient}
          >
            <Zap size={20} color="white" />
            <Text style={styles.badgeText}>TRIPLE-LAYER ANALYSIS</Text>
          </LinearGradient>
        </View>
        
        <TouchableOpacity 
          style={styles.readyButton}
          onPress={() => router.push('/onboarding/permissions')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>I'M READY TO DECODE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    flex: 1,
    marginBottom: 30,
  },
  featureCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 8,
  },
  featureStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  cypherBadge: {
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 1,
  },
  readyButton: {
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  }
});