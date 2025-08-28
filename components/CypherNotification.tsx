import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCypherStore } from '@/store/cypherStore';
import ShoogSniffaAvatar from './ShoogSniffaAvatar';
import { X, AlertTriangle } from 'lucide-react-native';

interface CypherNotificationProps {
  visible: boolean;
  productName: string;
  sugarContent: number;
  onDismiss: () => void;
}

export default function CypherNotification({ 
  visible, 
  productName, 
  sugarContent, 
  onDismiss 
}: CypherNotificationProps) {
  const { preferences, getSniffaResponse } = useCypherStore();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  const getNotificationMessage = () => {
    switch (preferences.notificationTone) {
      case 'clinical':
        return `${productName} exceeds your daily added sugar target. ${sugarContent}g detected. Tap for Cypher.`;
      case 'humor':
        return getSniffaResponse(productName, sugarContent);
      default: // balanced
        return `Yo Shoog—your ${productName.toLowerCase()}'s rocking ${sugarContent}g sugar. Wanna sniff a better option?`;
    }
  };
  
  const getGradientColors = (): [string, string] => {
    if (sugarContent > 25) return ['#FF6B6B', '#FF8E53'];
    if (sugarContent > 15) return ['#FFD93D', '#FF6B6B'];
    return ['#4ECDC4', '#44A08D'];
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.notification}
      >
        <View style={styles.content}>
          <ShoogSniffaAvatar 
            size={40} 
            animated={true} 
            mood={sugarContent > 25 ? 'alert' : sugarContent > 15 ? 'concerned' : 'normal'} 
          />
          
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              {getNotificationMessage()}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {sugarContent > 25 && (
          <View style={styles.crisisIndicator}>
            <AlertTriangle size={16} color="white" />
            <Text style={styles.crisisText}>CRISIS MODE</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
  },
  crisisIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  crisisText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 1,
  }
});