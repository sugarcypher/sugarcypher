import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useFoodLogStore } from '@/store/foodLogStore';
import { useCypherStore } from '@/store/cypherStore';
import { useSecurityStore } from '@/store/securityStore';
import { useTourStore } from '@/store/tourStore';
import { DAILY_SUGAR_LIMIT_GRAMS } from '@/constants/sugarLimits';
import ShoogSniffaAvatar from '@/components/ShoogSniffaAvatar';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { 
  Bell, 
  Info, 
  Heart, 
  Trash2, 
  ChevronRight, 
  Shield, 
  HelpCircle,
  Volume2,
  Brain,
  Award,
  Lock
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { clearToday } = useFoodLogStore();
  const { preferences, updatePreferences, badges } = useCypherStore();
  const { securityHealth, privacySettings } = useSecurityStore();
  const { resetTour } = useTourStore();
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  
  const handleClearToday = () => {
    Alert.alert(
      "Clear Today's Log",
      "Are you sure you want to clear all food entries for today? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          onPress: () => {
            clearToday();
            Alert.alert("Success", "Today's log has been cleared");
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleAccentChange = () => {
    const accents = ['urban', 'cajun', 'posh', 'glitchy'] as const;
    const currentIndex = accents.indexOf(preferences.sniffaAccent);
    const nextIndex = (currentIndex + 1) % accents.length;
    updatePreferences({ sniffaAccent: accents[nextIndex] });
  };
  
  const handleToneChange = () => {
    const tones = ['balanced', 'clinical', 'humor'] as const;
    const currentIndex = tones.indexOf(preferences.notificationTone);
    const nextIndex = (currentIndex + 1) % tones.length;
    updatePreferences({ notificationTone: tones[nextIndex] });
  };
  
  const getAccentLabel = () => {
    switch (preferences.sniffaAccent) {
      case 'urban': return 'Urban Street';
      case 'cajun': return 'Cajun Spice';
      case 'posh': return 'Posh British';
      case 'glitchy': return 'Glitchy AI';
    }
  };
  
  const getToneLabel = () => {
    switch (preferences.notificationTone) {
      case 'balanced': return 'Balanced';
      case 'clinical': return 'Clinical';
      case 'humor': return 'Humor Mode';
    }
  };
  
  const earnedBadges = badges.filter(b => b.earned);
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => {
    return (
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement}
      </TouchableOpacity>
    );
  };
  
  return (
    <>
      <Stack.Screen options={{ title: 'Cypher Settings' }} />
      
      <ScrollView style={styles.container}>
        {/* ShoogSniffa Section */}
        <Text style={styles.sectionTitle}>ShoogSniffa™ Settings</Text>
        
        <View style={styles.sniffaPreview}>
          <ShoogSniffaAvatar size={60} animated={true} />
          <View style={styles.sniffaInfo}>
            <Text style={styles.sniffaName}>ShoogSniffa™</Text>
            <Text style={styles.sniffaStatus}>
              {preferences.sniffaVoiceEnabled ? 'Voice Active' : 'Voice Disabled'} • {getAccentLabel()}
            </Text>
          </View>
        </View>
        
        {renderSettingItem(
          <Volume2 size={22} color={Colors.primary} />,
          "Voice Commentary",
          "Enable ShoogSniffa voice responses",
          <Switch
            value={preferences.sniffaVoiceEnabled}
            onValueChange={(value) => updatePreferences({ sniffaVoiceEnabled: value })}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="white"
          />
        )}
        
        {renderSettingItem(
          <Brain size={22} color={Colors.primary} />,
          "Voice Accent",
          getAccentLabel(),
          <ChevronRight size={20} color={Colors.subtext} />,
          handleAccentChange
        )}
        
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {renderSettingItem(
          <Bell size={22} color={Colors.primary} />,
          "Notification Tone",
          getToneLabel(),
          <ChevronRight size={20} color={Colors.subtext} />,
          handleToneChange
        )}
        
        {renderSettingItem(
          <Shield size={22} color={Colors.primary} />,
          "Guardian Mode",
          "Enhanced protection for family use",
          <Switch
            value={preferences.parentalMode}
            onValueChange={(value) => updatePreferences({ parentalMode: value })}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="white"
          />
        )}
        
        {renderSettingItem(
          <Info size={22} color={Colors.primary} />,
          "Daily Sugar Limit",
          `${preferences.dailySugarLimit}g (WHO recommendation)`,
          <ChevronRight size={20} color={Colors.subtext} />,
          () => {
            Alert.alert(
              "Daily Sugar Limit",
              "The World Health Organization recommends limiting added sugar intake to 25g per day for adults."
            );
          }
        )}
        
        {/* Badges Section */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        
        <View style={styles.badgesContainer}>
          {earnedBadges.length > 0 ? (
            earnedBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noBadgesText}>
              Start scanning to earn your first badge!
            </Text>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
        
        {renderSettingItem(
          <Lock size={22} color={securityHealth.status === 'healthy' ? Colors.primary : Colors.danger} />,
          "Security Dashboard",
          `Status: ${securityHealth.status.toUpperCase()} • Privacy: ${privacySettings.level.toUpperCase()}`,
          <ChevronRight size={20} color={Colors.subtext} />,
          () => setShowSecurityDashboard(true)
        )}
        
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {renderSettingItem(
          <Trash2 size={22} color={Colors.danger} />,
          "Clear Today's Log",
          "Remove all food entries for today",
          <ChevronRight size={20} color={Colors.subtext} />,
          handleClearToday
        )}
        
        <Text style={styles.sectionTitle}>Help & Learning</Text>
        
        {renderSettingItem(
          <HelpCircle size={22} color={Colors.primary} />,
          "Replay App Tour",
          "Show the interactive walkthrough again",
          <ChevronRight size={20} color={Colors.subtext} />,
          () => {
            resetTour();
            Alert.alert(
              "Tour Reset",
              "The app tour will start when you return to the home screen."
            );
          }
        )}
        
        <Text style={styles.sectionTitle}>About</Text>
        
        {renderSettingItem(
          <Heart size={22} color={Colors.primary} />,
          "About SugarCypher",
          "Version 2.0.0 - Multimodal Edition",
          <ChevronRight size={20} color={Colors.subtext} />,
          () => {
            Alert.alert(
              "About SugarCypher",
              "SugarCypher with ShoogSniffa™ helps you decode hidden sugars using advanced AI analysis and street-smart commentary."
            );
          }
        )}
        
        {renderSettingItem(
          <Shield size={22} color={Colors.primary} />,
          "Privacy Policy",
          "How we handle your data",
          <ChevronRight size={20} color={Colors.subtext} />,
          () => {
            Alert.alert(
              "Privacy Policy",
              "We take your privacy seriously. Your food data is stored locally on your device and is not shared with third parties."
            );
          }
        )}
        
        {renderSettingItem(
          <HelpCircle size={22} color={Colors.primary} />,
          "Help & Support",
          "Get assistance with the app",
          <ChevronRight size={20} color={Colors.subtext} />,
          () => {
            Alert.alert(
              "Help & Support",
              "For assistance with using SugarCypher, please visit our support website or contact us at support@sugarcypher.app"
            );
          }
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SugarCypher © 2025 • Powered by ShoogSniffa™
          </Text>
        </View>
      </ScrollView>
      
      <SecurityDashboard 
        visible={showSecurityDashboard}
        onClose={() => setShowSecurityDashboard(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sniffaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  sniffaInfo: {
    marginLeft: 16,
    flex: 1,
  },
  sniffaName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sniffaStatus: {
    fontSize: 14,
    color: Colors.subtext,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.subtext,
    marginTop: 2,
  },
  badgesContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: 14,
    color: Colors.subtext,
  },
  noBadgesText: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.subtext,
  }
});