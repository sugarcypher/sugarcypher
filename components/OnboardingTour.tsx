import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/colors';
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Home, 
  Camera, 
  BarChart, 
  Settings,
  Plus,
  MessageCircle,
  BookOpen,
  ScanLine,
  Brain,
  Shield
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'center';
}

interface OnboardingTourProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SugarCypher! 🍭',
    description: 'Let me show you around your new sugar detective toolkit. Ready to decode your diet?',
    targetArea: { x: 0, y: 0, width: screenWidth, height: screenHeight * 0.3 },
    icon: <Shield size={32} color={Colors.primary} />,
    position: 'center'
  },
  {
    id: 'progress_bar',
    title: 'Sugar Progress Tracker 📊',
    description: 'This shows your daily sugar intake vs. the recommended limit. Watch it change as you log foods!',
    targetArea: { x: 16, y: 120, width: screenWidth - 32, height: 80 },
    icon: <BarChart size={24} color={Colors.primary} />,
    position: 'bottom'
  },
  {
    id: 'tab_home',
    title: 'Home Tab 🏠',
    description: 'Your home base! See today\'s food log, sugar progress, and get personalized insights.',
    targetArea: { x: 0, y: screenHeight - 80, width: screenWidth / 7, height: 80 },
    icon: <Home size={24} color={Colors.primary} />,
    position: 'top'
  },
  {
    id: 'tab_log',
    title: 'Log Food Tab 📝',
    description: 'Manually log your foods and meals with detailed nutritional information.',
    targetArea: { x: screenWidth / 7, y: screenHeight - 80, width: screenWidth / 7, height: 80 },
    icon: <Camera size={24} color={Colors.primary} />,
    position: 'top'
  },
  {
    id: 'tab_scanner',
    title: 'Scanner Tab 📷',
    description: 'Your SugarCypher scanner! Take photos of food, scan barcodes, or use AI to identify foods.',
    targetArea: { x: (screenWidth / 7) * 2, y: screenHeight - 80, width: screenWidth / 7, height: 80 },
    icon: <ScanLine size={24} color={Colors.primary} />,
    position: 'top'
  },
  {
    id: 'tab_insights',
    title: 'Insights Tab 📈',
    description: 'Discover patterns in your sugar consumption and get personalized health insights.',
    targetArea: { x: (screenWidth / 7) * 3, y: screenHeight - 80, width: screenWidth / 7, height: 80 },
    icon: <BarChart size={24} color={Colors.primary} />,
    position: 'top'
  },
  {
    id: 'tab_shopping',
    title: 'Smart Shopping Tab 🛒',
    description: 'Scan receipts to get a sugar score for your shopping trips and track your progress.',
    targetArea: { x: (screenWidth / 7) * 4, y: screenHeight - 80, width: screenWidth / 7, height: 80 },
    icon: <BookOpen size={24} color={Colors.primary} />,
    position: 'top'
  },
  {
    id: 'tab_community',
    title: 'Community Tab 👥',
    description: 'Connect with others, share your progress, join challenges, and set goals together.',
    targetArea: { x: (screenWidth / 7) * 5, y: screenHeight - 80, width: screenWidth / 7, height: 80 },
    icon: <MessageCircle size={24} color={Colors.primary} />,
    position: 'top'
  },
  {
    id: 'tab_settings',
    title: 'Settings Tab ⚙️',
    description: 'Customize your experience, manage your data, and adjust app preferences.',
    targetArea: { x: (screenWidth / 7) * 6, y: screenHeight - 80, width: screenWidth / 7, height: 80 },
    icon: <Settings size={24} color={Colors.primary} />,
    position: 'top'
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    description: 'That\'s the tour! Start by scanning your first food item, joining the community, or setting your first goal. Happy sugar sleuthing!',
    targetArea: { x: 0, y: 0, width: screenWidth, height: screenHeight },
    icon: <Shield size={32} color={Colors.primary} />,
    position: 'center'
  }
];

export default function OnboardingTour({ visible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onSkip();
    });
  };

  if (!visible) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const getTooltipStyle = () => {
    const { targetArea, position } = step;
    let tooltipStyle: any = {
      position: 'absolute',
      maxWidth: screenWidth - 40,
      minWidth: 280,
    };

    switch (position) {
      case 'top':
        tooltipStyle.bottom = screenHeight - targetArea.y + 20;
        tooltipStyle.left = Math.max(20, Math.min(
          targetArea.x + (targetArea.width / 2) - 140,
          screenWidth - 300
        ));
        break;
      case 'bottom':
        tooltipStyle.top = targetArea.y + targetArea.height + 20;
        tooltipStyle.left = Math.max(20, Math.min(
          targetArea.x + (targetArea.width / 2) - 140,
          screenWidth - 300
        ));
        break;
      case 'center':
        tooltipStyle.top = screenHeight / 2 - 100;
        tooltipStyle.left = 20;
        tooltipStyle.right = 20;
        break;
    }

    return tooltipStyle;
  };

  const renderHighlight = () => {
    if (step.id === 'welcome' || step.id === 'complete') return null;

    const { targetArea } = step;
    return (
      <View
        style={[
          styles.highlight,
          {
            left: targetArea.x - 8,
            top: targetArea.y - 8,
            width: targetArea.width + 16,
            height: targetArea.height + 16,
          }
        ]}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
        )}
        
        {renderHighlight()}
        
        <Animated.View
          style={[
            styles.tooltip,
            getTooltipStyle(),
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.tooltipHeader}>
            <View style={styles.iconContainer}>
              {step.icon}
            </View>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <X size={20} color={Colors.subtext} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Text style={styles.tooltipDescription}>{step.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {tourSteps.length}
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                <ArrowLeft size={16} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>
                {currentStep === tourSteps.length - 1 ? 'Get Started!' : 'Next'}
              </Text>
              {currentStep < tourSteps.length - 1 && (
                <ArrowRight size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  highlight: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltip: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    padding: 8,
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  tooltipDescription: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});