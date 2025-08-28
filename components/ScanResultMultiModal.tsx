import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Colors from '@/constants/colors';
import ShoogSniffaAvatar from './ShoogSniffaAvatar';
import { Brain, MessageCircle, Shield, Volume2, Eye, AlertTriangle, Zap } from 'lucide-react-native';

interface ScanResult {
  name: string;
  totalSugars: number;
  addedSugars: number;
  aliases: string[];
  glycemicIndex: number;
  labelTricks: string[];
  sweetenerType: string;
  hiddenSugars: string[];
}

interface ScanResultMultiModalProps {
  result: ScanResult;
  onClose: () => void;
}

type ViewMode = 'cypher' | 'sniffa' | 'guardian';

const getSmartAlternative = (productName: string, sugarContent: number): string => {
  const name = productName.toLowerCase();
  
  // Determine product category
  const isBeverage = name.includes('cola') || name.includes('soda') || name.includes('drink') || 
                    name.includes('juice') || name.includes('smoothie') || name.includes('tea') ||
                    name.includes('coffee') || name.includes('latte') || name.includes('beverage');
  
  const isSnack = name.includes('cookie') || name.includes('chip') || name.includes('candy') ||
                  name.includes('bar') || name.includes('cracker') || name.includes('nuts');
  
  const isDessert = name.includes('cake') || name.includes('ice cream') || name.includes('donut') ||
                   name.includes('brownie') || name.includes('pie');
  
  const isBreakfast = name.includes('cereal') || name.includes('granola') || name.includes('muffin') ||
                     name.includes('pancake') || name.includes('waffle') || name.includes('yogurt');
  
  // Return category-appropriate alternatives
  if (isBeverage) {
    return `• Sparkling water with fresh lemon — 0g sugar, naturally refreshing`;
  }
  
  if (isSnack) {
    return `• Mixed raw almonds — 1g natural sugars, healthy fats & protein`;
  }
  
  if (isDessert) {
    return `• Fresh berries with Greek yogurt — 8g natural sugars, probiotics`;
  }
  
  if (isBreakfast) {
    return `• Steel-cut oats with cinnamon — 6g natural sugars, high fiber`;
  }
  
  // Generic healthy alternative
  return `• Fresh fruit salad — ${Math.max(6, Math.round(sugarContent * 0.3))}g natural sugars, vitamins & fiber`;
};

export default function ScanResultMultiModal({ result, onClose }: ScanResultMultiModalProps) {
  const [activeMode, setActiveMode] = useState<ViewMode>('sniffa');
  const [sniffaMessage, setSniffaMessage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedMolecular, setExpandedMolecular] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);
  
  // Cleanup speech when component unmounts
  React.useEffect(() => {
    return () => {
      if (Platform.OS !== 'web' && isSpeaking) {
        Speech.stop();
      }
    };
  }, [isSpeaking]);
  
  const sniffaMessages = [
    `Shoog, this ${result.name.toLowerCase()} is dressed like a salad but parties like a candy cane.`,
    `They split sugar ${result.aliases.length} ways to dodge the top line. Classic sweet smokescreen.`,
    `Wanna Cypher deeper? Let's sniff the brand's other products too...`
  ];
  
  const handlePlayVoice = async () => {
    if (Platform.OS === 'web') {
      console.log('Text-to-speech not available on web');
      return;
    }
    
    try {
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
        console.log('Speech stopped');
      } else {
        const message = sniffaMessages[sniffaMessage];
        console.log('Speaking:', message);
        setIsSpeaking(true);
        
        await Speech.speak(message, {
          language: 'en-US',
          pitch: 0.9,
          rate: 0.8,
          voice: 'com.apple.ttsbundle.Moira-compact', // iOS voice
          onDone: () => {
            console.log('Speech completed');
            setIsSpeaking(false);
          },
          onError: (error) => {
            console.error('Speech error:', error);
            setIsSpeaking(false);
          },
          onStopped: () => {
            console.log('Speech stopped by user');
            setIsSpeaking(false);
          }
        });
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
    }
  };
  
  const renderCypherMode = () => (
    <View style={styles.modeContent}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.modeHeader}
      >
        <Brain size={24} color="white" />
        <Text style={styles.modeTitle}>CY-PHER DATA BREAKDOWN</Text>
      </LinearGradient>
      
      <View style={styles.dataGrid}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Total Sugars:</Text>
          <Text style={styles.dataValue}>{result.totalSugars}g</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Added Sugars:</Text>
          <Text style={styles.dataValue}>{result.addedSugars}g</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Known Aliases:</Text>
          <Text style={styles.dataValue}>{result.aliases.join(', ')}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Glycemic Index:</Text>
          <Text style={styles.dataValue}>~{result.glycemicIndex}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Label Trick Detected:</Text>
          <Text style={styles.dataValue}>{result.labelTricks.join(', ')}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Sweetener Type:</Text>
          <Text style={styles.dataValue}>{result.sweetenerType}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.expandButton}
        onPress={() => {
          console.log('Molecular expand button pressed, current state:', expandedMolecular);
          setExpandedMolecular(!expandedMolecular);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.expandText}>
          {expandedMolecular ? '🔼 Collapse' : '🔎 Expand for'} molecular source, glycemic load, daily impact
        </Text>
      </TouchableOpacity>
      
      {expandedMolecular && (
        <View style={styles.molecularDetails}>
          <View style={styles.molecularSection}>
            <Text style={styles.molecularTitle}>🧬 Molecular Source Analysis</Text>
            <Text style={styles.molecularText}>
              Primary sugars: Sucrose (C₁₂H₂₂O₁₁), Fructose (C₆H₁₂O₆)
            </Text>
            <Text style={styles.molecularText}>
              Processing method: High-temperature crystallization
            </Text>
            <Text style={styles.molecularText}>
              Bioavailability: 95% within 15 minutes
            </Text>
          </View>
          
          <View style={styles.molecularSection}>
            <Text style={styles.molecularTitle}>⚡ Glycemic Load Impact</Text>
            <Text style={styles.molecularText}>
              Glycemic Load: {Math.round(result.glycemicIndex * result.totalSugars / 100 * 2.5)}
            </Text>
            <Text style={styles.molecularText}>
              Blood sugar spike: Expected within 30-45 minutes
            </Text>
            <Text style={styles.molecularText}>
              Insulin response: High (requires {Math.round(result.totalSugars * 0.5)}IU)
            </Text>
          </View>
          
          <View style={styles.molecularSection}>
            <Text style={styles.molecularTitle}>📊 Daily Impact Assessment</Text>
            <Text style={styles.molecularText}>
              Daily sugar budget used: {Math.round((result.totalSugars / 25) * 100)}%
            </Text>
            <Text style={styles.molecularText}>
              Metabolic stress level: {result.totalSugars > 20 ? 'High' : result.totalSugars > 10 ? 'Moderate' : 'Low'}
            </Text>
            <Text style={styles.molecularText}>
              Recovery time: {Math.round(result.totalSugars * 0.3)} hours
            </Text>
          </View>
        </View>
      )}
    </View>
  );
  
  const renderSniffaMode = () => (
    <View style={styles.modeContent}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        style={styles.modeHeader}
      >
        <MessageCircle size={24} color="white" />
        <Text style={styles.modeTitle}>SHOOGSNIFFA COMMENTARY</Text>
      </LinearGradient>
      
      <View style={styles.sniffaContainer}>
        <ShoogSniffaAvatar size={80} animated={true} mood="alert" />
        
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            {sniffaMessages[sniffaMessage]}
          </Text>
        </View>
        
        <View style={styles.sniffaControls}>
          <TouchableOpacity 
            style={[styles.voiceButton, isSpeaking && { backgroundColor: 'rgba(255, 107, 107, 0.4)' }]}
            onPress={handlePlayVoice}
          >
            <Volume2 size={20} color="#FF6B6B" />
            <Text style={styles.voiceText}>{isSpeaking ? 'Stop Voice' : 'Play Voice'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.nextMessageButton}
            onPress={() => setSniffaMessage((prev) => (prev + 1) % sniffaMessages.length)}
          >
            <Text style={styles.nextMessageText}>Next Insight</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  const renderGuardianMode = () => (
    <View style={styles.modeContent}>
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        style={styles.modeHeader}
      >
        <Shield size={24} color="white" />
        <Text style={styles.modeTitle}>GUARDIAN SUMMARY</Text>
      </LinearGradient>
      
      <View style={styles.alertsContainer}>
        <View style={styles.alertItem}>
          <AlertTriangle size={20} color={Colors.danger} />
          <Text style={styles.alertText}>High Added Sugar</Text>
        </View>
        <View style={styles.alertItem}>
          <AlertTriangle size={20} color={Colors.warning} />
          <Text style={styles.alertText}>Sweeteners hidden behind alternate names</Text>
        </View>
        <View style={styles.alertItem}>
          <AlertTriangle size={20} color={Colors.warning} />
          <Text style={styles.alertText}>Artificial flavoring listed as "natural enhancement"</Text>
        </View>
      </View>
      
      <View style={styles.alternativeSection}>
        <Text style={styles.alternativeTitle}>✅ Try this instead:</Text>
        <View style={styles.alternativeItem}>
          <Text style={styles.alternativeName}>
            {getSmartAlternative(result.name, result.totalSugars)}
          </Text>
        </View>
        
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>🧠 Tip:</Text>
          <Text style={styles.tipText}>If "evaporated" or "nectar" appears, sugar's just in disguise.</Text>
        </View>
      </View>
      
      <View style={styles.guardianActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Add Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Remind Later</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Find Better Option</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderModeContent = () => {
    switch (activeMode) {
      case 'cypher':
        return renderCypherMode();
      case 'sniffa':
        return renderSniffaMode();
      case 'guardian':
        return renderGuardianMode();
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [300, 0]
            })
          }]
        }
      ]}
    >
      <LinearGradient
        colors={['#1A1A2E', '#16213E']}
        style={styles.background}
      >
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'cypher' && styles.activeModeTab]}
            onPress={() => setActiveMode('cypher')}
          >
            <Brain size={20} color={activeMode === 'cypher' ? 'white' : '#8892B0'} />
            <Text style={[styles.modeTabText, activeMode === 'cypher' && styles.activeModeTabText]}>
              CYPHER
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'sniffa' && styles.activeModeTab]}
            onPress={() => setActiveMode('sniffa')}
          >
            <MessageCircle size={20} color={activeMode === 'sniffa' ? 'white' : '#8892B0'} />
            <Text style={[styles.modeTabText, activeMode === 'sniffa' && styles.activeModeTabText]}>
              SNIFFA
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeTab, activeMode === 'guardian' && styles.activeModeTab]}
            onPress={() => setActiveMode('guardian')}
          >
            <Shield size={20} color={activeMode === 'guardian' ? 'white' : '#8892B0'} />
            <Text style={[styles.modeTabText, activeMode === 'guardian' && styles.activeModeTabText]}>
              GUARDIAN
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <ScrollView style={styles.contentContainer}>
          {renderModeContent()}
        </ScrollView>
        
        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => {
              console.log('Scan Another pressed');
              onClose();
            }}
          >
            <Zap size={20} color="white" />
            <Text style={styles.floatingButtonText}>Scan Another</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => {
              console.log('Sniff Brand pressed - analyzing brand patterns...');
              // This would trigger brand analysis functionality
              alert('Brand analysis feature coming soon! This will analyze all products from this brand.');
            }}
          >
            <Eye size={20} color="white" />
            <Text style={styles.floatingButtonText}>Sniff Brand</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
  },
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeModeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeTabText: {
    color: '#8892B0',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  activeModeTabText: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modeContent: {
    paddingBottom: 20,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 1,
  },
  dataGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dataLabel: {
    color: '#8892B0',
    fontSize: 14,
    flex: 1,
  },
  dataValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  expandButton: {
    padding: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  expandText: {
    color: '#667EEA',
    fontSize: 12,
  },
  molecularDetails: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  molecularSection: {
    marginBottom: 16,
  },
  molecularTitle: {
    color: '#667EEA',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  molecularText: {
    color: '#8892B0',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  sniffaContainer: {
    alignItems: 'center',
  },
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    maxWidth: '90%',
  },
  speechText: {
    color: '#2D3748',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  sniffaControls: {
    flexDirection: 'row',
    gap: 16,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voiceText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  nextMessageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextMessageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  alertsContainer: {
    marginBottom: 20,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  alternativeSection: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  alternativeTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  alternativeItem: {
    marginBottom: 12,
  },
  alternativeName: {
    color: 'white',
    fontSize: 14,
  },
  tipContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipTitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    color: '#8892B0',
    fontSize: 14,
  },
  guardianActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  floatingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
    paddingVertical: 12,
    borderRadius: 8,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  }
});