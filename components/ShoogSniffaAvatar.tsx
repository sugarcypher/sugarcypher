import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Zap } from 'lucide-react-native';

interface ShoogSniffaAvatarProps {
  size?: number;
  animated?: boolean;
  mood?: 'normal' | 'alert' | 'happy' | 'concerned';
}

export default function ShoogSniffaAvatar({ 
  size = 80, 
  animated = false,
  mood = 'normal' 
}: ShoogSniffaAvatarProps) {
  
  const getMoodColors = (): [string, string] => {
    switch (mood) {
      case 'alert':
        return ['#FF6B6B', '#FF8E53'];
      case 'happy':
        return ['#4ECDC4', '#44A08D'];
      case 'concerned':
        return ['#FFD93D', '#FF6B6B'];
      default:
        return ['#00D4FF', '#5A67D8'];
    }
  };
  
  const getEyeIcon = () => {
    switch (mood) {
      case 'alert':
        return <Zap size={size * 0.3} color="white" />;
      case 'happy':
        return <Eye size={size * 0.3} color="white" />;
      case 'concerned':
        return <Eye size={size * 0.3} color="white" />;
      default:
        return <Eye size={size * 0.3} color="white" />;
    }
  };
  
  return (
    <View 
      style={[
        styles.container,
        {
          width: size,
          height: size,
        }
      ]}
    >
      {/* Main avatar */}
      <LinearGradient
        colors={getMoodColors()}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      >
        {/* Eyes */}
        <View style={styles.eyesContainer}>
          <View style={[styles.eye, { width: size * 0.15, height: size * 0.15 }]}>
            <View style={[styles.pupil, { width: size * 0.08, height: size * 0.08 }]} />
          </View>
          <View style={[styles.eye, { width: size * 0.15, height: size * 0.15 }]}>
            <View style={[styles.pupil, { width: size * 0.08, height: size * 0.08 }]} />
          </View>
        </View>
        
        {/* Nose/Snout */}
        <View style={[styles.snout, { 
          width: size * 0.2, 
          height: size * 0.15,
          borderRadius: size * 0.1
        }]} />
        
        {/* Tech elements */}
        <View style={[styles.techElement, styles.topLeft, { 
          width: size * 0.12, 
          height: size * 0.12 
        }]}>
          {getEyeIcon()}
        </View>
        
        <View style={[styles.techElement, styles.bottomRight, { 
          width: size * 0.1, 
          height: size * 0.1 
        }]} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#00D4FF',
    opacity: 0.3,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginBottom: 8,
  },
  eye: {
    backgroundColor: 'white',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    backgroundColor: '#2D3748',
    borderRadius: 50,
  },
  snout: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  techElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLeft: {
    top: '10%',
    left: '10%',
  },
  bottomRight: {
    bottom: '15%',
    right: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  }
});