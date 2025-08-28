import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { DAILY_SUGAR_LIMIT_GRAMS } from '@/constants/sugarLimits';
import { AlertCircle, X } from 'lucide-react-native';

interface SugarThresholdAlertProps {
  currentSugar: number;
  onDismiss?: () => void;
}

export default function SugarThresholdAlert({ currentSugar, onDismiss }: SugarThresholdAlertProps) {
  const percentage = (currentSugar / DAILY_SUGAR_LIMIT_GRAMS) * 100;
  
  // Only show alert if over 80% of daily limit
  if (percentage < 80) return null;
  
  const getAlertLevel = () => {
    if (percentage >= 150) return { level: 'critical', color: Colors.danger, message: 'Critical: Far above daily limit' };
    if (percentage >= 120) return { level: 'high', color: Colors.danger, message: 'High: Well above daily limit' };
    if (percentage >= 100) return { level: 'warning', color: Colors.warning, message: 'Warning: At daily limit' };
    return { level: 'caution', color: Colors.warning, message: 'Caution: Approaching daily limit' };
  };
  
  const alert = getAlertLevel();
  
  const getRecommendation = () => {
    if (percentage >= 120) {
      return "Consider avoiding additional sugar today and focus on whole foods.";
    } else if (percentage >= 100) {
      return "You've reached your daily sugar limit. Try to avoid more sugar today.";
    } else {
      return "You're close to your daily sugar limit. Be mindful of your next food choices.";
    }
  };
  
  return (
    <View style={[styles.container, { borderLeftColor: alert.color }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AlertCircle size={20} color={alert.color} />
          <Text style={[styles.title, { color: alert.color }]}>{alert.message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <X size={18} color={Colors.subtext} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.currentAmount}>
        Current intake: {currentSugar.toFixed(1)}g ({percentage.toFixed(0)}% of daily limit)
      </Text>
      
      <Text style={styles.recommendation}>
        {getRecommendation()}
      </Text>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Quick tips:</Text>
        <Text style={styles.tip}>• Choose water over sugary drinks</Text>
        <Text style={styles.tip}>• Opt for whole fruits instead of fruit juices</Text>
        <Text style={styles.tip}>• Read labels carefully for hidden sugars</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dismissButton: {
    padding: 4,
  },
  currentAmount: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  recommendation: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    padding: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tip: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 2,
  }
});