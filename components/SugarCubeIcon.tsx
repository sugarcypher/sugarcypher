import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Search, Shield, Zap, Activity } from 'lucide-react-native';

interface SugarCypherIconProps {
  size?: number;
  color?: string;
}

export default function SugarCubeIcon({ size = 24, color = '#32CD32' }: SugarCypherIconProps) {
  const hexagonPoints = [
    { x: size * 0.5, y: size * 0.15 },
    { x: size * 0.85, y: size * 0.35 },
    { x: size * 0.85, y: size * 0.65 },
    { x: size * 0.5, y: size * 0.85 },
    { x: size * 0.15, y: size * 0.65 },
    { x: size * 0.15, y: size * 0.35 }
  ];

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      {/* Outer hexagonal cypher ring */}
      <View style={[styles.hexagonRing, { 
        width: size * 1.4, 
        height: size * 1.4,
        borderColor: '#14B8A6',
        borderRadius: size * 0.1
      }]}>
        {/* Hexagon corner indicators */}
        {hexagonPoints.map((point, index) => (
          <View 
            key={index}
            style={[styles.hexCorner, {
              left: point.x - size * 0.03,
              top: point.y - size * 0.03,
              width: size * 0.06,
              height: size * 0.06,
              backgroundColor: '#00FFCC'
            }]}
          />
        ))}
      </View>
      
      {/* Radial data lines */}
      <View style={[styles.radialLine, {
        width: size * 0.3,
        height: 2,
        backgroundColor: '#14B8A6',
        top: size * 0.25,
        left: size * 0.65,
        transform: [{ rotate: '30deg' }]
      }]} />
      <View style={[styles.radialLine, {
        width: size * 0.25,
        height: 2,
        backgroundColor: '#14B8A6',
        top: size * 0.45,
        left: size * 0.15,
        transform: [{ rotate: '-45deg' }]
      }]} />
      <View style={[styles.radialLine, {
        width: size * 0.2,
        height: 2,
        backgroundColor: '#14B8A6',
        top: size * 0.7,
        left: size * 0.6,
        transform: [{ rotate: '60deg' }]
      }]} />
      
      {/* Central molecular structure background */}
      <View style={[styles.molecularBg, { 
        width: size * 0.8, 
        height: size * 0.8,
        backgroundColor: 'rgba(0, 255, 204, 0.05)',
        borderRadius: size * 0.4,
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 204, 0.2)'
      }]} />
      
      {/* Central stylized sugar cube with molecular structure */}
      <View style={styles.molecularContainer}>
        {/* Main sugar cube - crystalline structure */}
        <View style={[styles.mainCrystal, {
          width: size * 0.24,
          height: size * 0.24,
          backgroundColor: '#FFFFFF',
          borderColor: '#00FFCC',
          borderWidth: 1
        }]} />
        
        {/* Glucose molecule nodes */}
        <View style={[styles.moleculeNode, {
          width: size * 0.08,
          height: size * 0.08,
          backgroundColor: '#FFD700',
          top: -size * 0.15,
          left: -size * 0.05
        }]} />
        <View style={[styles.moleculeNode, {
          width: size * 0.06,
          height: size * 0.06,
          backgroundColor: '#FF6B8B',
          top: -size * 0.08,
          right: -size * 0.08
        }]} />
        <View style={[styles.moleculeNode, {
          width: size * 0.07,
          height: size * 0.07,
          backgroundColor: '#8B5CF6',
          bottom: -size * 0.12,
          left: -size * 0.02
        }]} />
        <View style={[styles.moleculeNode, {
          width: size * 0.05,
          height: size * 0.05,
          backgroundColor: '#00FFCC',
          bottom: -size * 0.06,
          right: -size * 0.06
        }]} />
        
        {/* DNA strand elements */}
        <View style={[styles.dnaStrand, {
          width: size * 0.4,
          height: 2,
          backgroundColor: '#14B8A6',
          transform: [{ rotate: '45deg' }]
        }]} />
        <View style={[styles.dnaStrand, {
          width: size * 0.4,
          height: 2,
          backgroundColor: '#14B8A6',
          transform: [{ rotate: '-45deg' }]
        }]} />
      </View>
      
      {/* Integrated functional icons */}
      <View style={[styles.iconOverlay, {
        top: size * 0.2,
        right: size * 0.2
      }]}>
        <Search 
          size={size * 0.18} 
          color={'#FFD700'} 
          strokeWidth={2.5}
        />
      </View>
      
      <View style={[styles.iconOverlay, {
        bottom: size * 0.15,
        left: size * 0.15
      }]}>
        <Activity 
          size={size * 0.16} 
          color={'#FF6B8B'} 
          strokeWidth={2.5}
        />
      </View>
      
      <View style={[styles.iconOverlay, {
        top: size * 0.12,
        left: size * 0.12
      }]}>
        <Shield 
          size={size * 0.14} 
          color={'#14B8A6'} 
          strokeWidth={2.5}
        />
      </View>
      
      <View style={[styles.iconOverlay, {
        bottom: size * 0.18,
        right: size * 0.18
      }]}>
        <Zap 
          size={size * 0.15} 
          color={'#8B5CF6'} 
          strokeWidth={2.5}
        />
      </View>
      
      {/* Outer pulse rings with hexagonal influence */}
      <View style={[styles.pulseRing1, { 
        width: size * 1.5, 
        height: size * 1.5,
        borderColor: 'rgba(0, 255, 204, 0.2)',
        borderRadius: size * 0.15
      }]} />
      
      <View style={[styles.pulseRing2, { 
        width: size * 1.7, 
        height: size * 1.7,
        borderColor: 'rgba(0, 255, 204, 0.1)',
        borderRadius: size * 0.2
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagonRing: {
    position: 'absolute',
    borderWidth: 2,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '30deg' }],
  },
  hexCorner: {
    position: 'absolute',
    borderRadius: 50,
    zIndex: 2,
    shadowColor: '#00FFCC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  radialLine: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.7,
  },
  molecularBg: {
    position: 'absolute',
    zIndex: 2,
    shadowColor: '#00FFCC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  molecularContainer: {
    position: 'absolute',
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCrystal: {
    borderRadius: 4,
    shadowColor: '#00FFCC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ rotate: '45deg' }],
  },
  moleculeNode: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  dnaStrand: {
    position: 'absolute',
    opacity: 0.6,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  iconOverlay: {
    position: 'absolute',
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pulseRing1: {
    position: 'absolute',
    borderWidth: 2,
    zIndex: 0,
    opacity: 0.6,
  },
  pulseRing2: {
    position: 'absolute',
    borderWidth: 1,
    zIndex: 0,
    opacity: 0.3,
  }
});