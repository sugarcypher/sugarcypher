import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import ShoogSniffaAvatar from '@/components/ShoogSniffaAvatar';
import { MessageCircle, Volume2 } from 'lucide-react-native';

export default function MeetSniffaScreen() {
  const router = useRouter();
  const [currentMessage, setCurrentMessage] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  
  const messages = [
    "Hey there! I'm ShoogSniffa, your AI nutrition detective. I've analyzed over 2 million foods and can spot hidden sugars instantly!",
    "Did you know that 'healthy' granola bars often contain more sugar than candy? I'll reveal the truth behind food marketing tricks.",
    "I use advanced algorithms to calculate your food's true metabolic impact - not just what's on the label, but how it affects YOUR body.",
    "Together, we'll build personalized strategies to reduce your sugar intake by 40% without sacrificing taste. Ready to start?"
  ];
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Bounce animation for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  const nextMessage = () => {
    if (currentMessage < messages.length - 1) {
      setCurrentMessage(currentMessage + 1);
    } else {
      router.push('/onboarding/features');
    }
  };
  
  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.avatarContainer,
            {
              transform: [{
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10]
                })
              }]
            }
          ]}
        >
          <ShoogSniffaAvatar size={120} animated={true} />
        </Animated.View>
        
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            {messages[currentMessage]}
          </Text>
          <View style={styles.speechTail} />
        </View>
        
        <View style={styles.personalityTags}>
          <View style={styles.tag}>
            <MessageCircle size={16} color="#00D4FF" />
            <Text style={styles.tagText}>Street Smart</Text>
          </View>
          <View style={styles.tag}>
            <Volume2 size={16} color="#00D4FF" />
            <Text style={styles.tagText}>Voice Enabled</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={nextMessage}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {currentMessage < messages.length - 1 ? 'CONTINUE' : 'MEET THE FEATURES'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.progressDots}>
          {messages.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.dot,
                index === currentMessage && styles.activeDot
              ]} 
            />
          ))}
        </View>
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
  avatarContainer: {
    marginBottom: 40,
  },
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  speechText: {
    fontSize: 18,
    color: '#2D3748',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  speechTail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
  },
  personalityTags: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  tagText: {
    color: '#00D4FF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  nextButton: {
    width: '100%',
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: '#00D4FF',
  }
});