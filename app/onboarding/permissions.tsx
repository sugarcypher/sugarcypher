import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Bell, Mic, Shield } from 'lucide-react-native';
import { useTourStore } from '@/store/tourStore';

export default function PermissionsScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [notifications, setNotifications] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [parentalMode, setParentalMode] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const { setShowTour } = useTourStore();
  
  const handleComplete = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Required",
          "Camera access is needed to scan barcodes and analyze food photos.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    
    // Save preferences to storage here
    // Trigger the tour after onboarding is complete
    setShowTour(true);
    router.replace('/(tabs)');
  };
  
  const permissions = [
    {
      icon: <Camera size={24} color="#00D4FF" />,
      title: "Camera Access",
      description: "Required to scan barcodes and analyze food packaging",
      required: true,
      granted: cameraPermission?.granted,
      onRequest: requestCameraPermission
    },
    {
      icon: <Bell size={24} color="#FF6B6B" />,
      title: "Smart Notifications",
      description: "Get personalized alerts about sugar intake and healthier alternatives",
      required: false,
      granted: notifications,
      onToggle: setNotifications
    },
    {
      icon: <Mic size={24} color="#4ECDC4" />,
      title: "Voice Analysis",
      description: "Describe food verbally for instant nutritional analysis",
      required: false,
      granted: voiceEnabled,
      onToggle: setVoiceEnabled
    },
    {
      icon: <Shield size={24} color="#FFD93D" />,
      title: "Family Protection",
      description: "Enhanced safety features and kid-friendly explanations",
      required: false,
      granted: parentalMode,
      onToggle: setParentalMode
    },
    {
      icon: <Shield size={24} color="#FF6B6B" />,
      title: "Strict Mode",
      description: "Zero tolerance for hidden sugars. Get alerts for ANY sugar content above 2g per serving",
      required: false,
      granted: strictMode,
      onToggle: setStrictMode
    }
  ];
  
  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Customize Your Experience</Text>
        <Text style={styles.subtitle}>
          These settings will personalize SugarCypher to match your health goals and lifestyle preferences
        </Text>
        
        <View style={styles.permissionsContainer}>
          {permissions.map((permission, index) => (
            <View key={index} style={styles.permissionCard}>
              <View style={styles.permissionIcon}>
                {permission.icon}
              </View>
              
              <View style={styles.permissionInfo}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionTitle}>{permission.title}</Text>
                  {permission.required && (
                    <Text style={styles.requiredBadge}>REQUIRED</Text>
                  )}
                </View>
                <Text style={styles.permissionDescription}>
                  {permission.description}
                </Text>
              </View>
              
              <View style={styles.permissionControl}>
                {permission.onRequest ? (
                  <TouchableOpacity
                    style={[
                      styles.grantButton,
                      permission.granted && styles.grantedButton
                    ]}
                    onPress={permission.onRequest}
                    disabled={permission.granted}
                  >
                    <Text style={[
                      styles.grantButtonText,
                      permission.granted && styles.grantedButtonText
                    ]}>
                      {permission.granted ? 'GRANTED' : 'GRANT'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Switch
                    value={permission.granted}
                    onValueChange={permission.onToggle}
                    trackColor={{ false: '#2D3748', true: '#00D4FF' }}
                    thumbColor="white"
                  />
                )}
              </View>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>ACTIVATE SUGARCYPHER</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8892B0',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  permissionsContainer: {
    flex: 1,
    marginBottom: 30,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  requiredBadge: {
    fontSize: 10,
    color: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '700',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#8892B0',
    lineHeight: 18,
  },
  permissionControl: {
    marginLeft: 16,
  },
  grantButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  grantedButton: {
    backgroundColor: '#4ECDC4',
  },
  grantButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  grantedButtonText: {
    color: 'white',
  },
  completeButton: {
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