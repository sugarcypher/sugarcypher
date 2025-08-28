import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Food } from '@/types/food';
import Colors from '@/constants/colors';
import { getSugarSeverity } from '@/constants/sugarLimits';
import { AlertTriangle, Clock, Trash2, Zap, Sparkles } from 'lucide-react-native';

interface FoodCardProps {
  food: Food;
  onPress?: () => void;
  onDelete?: () => void;
  showTime?: boolean;
}

export default function FoodCard({ food, onPress, onDelete, showTime = true }: FoodCardProps) {
  const severity = getSugarSeverity(food.sugarPerServing);
  const totalSugarImpact = food.sugarPerServing + (food.sugarEquivalent || 0);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getHighestRiskHiddenSugar = () => {
    if (!food.hiddenSugarTypes || food.hiddenSugarTypes.length === 0) return null;
    
    const highRisk = food.hiddenSugarTypes.find(sugar => sugar.severity === 'high');
    if (highRisk) return highRisk;
    
    const mediumRisk = food.hiddenSugarTypes.find(sugar => sugar.severity === 'medium');
    return mediumRisk || food.hiddenSugarTypes[0];
  };
  
  const highestRiskSugar = getHighestRiskHiddenSugar();
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.card, Colors.cardElevated]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {food.imageUri ? (
              <Image source={{ uri: food.imageUri }} style={styles.image} />
            ) : (
              <LinearGradient
                colors={[Colors.surface, Colors.border]}
                style={styles.imagePlaceholder}
              >
                <Sparkles size={24} color={Colors.textMuted} />
              </LinearGradient>
            )}
          </View>
          
          <View style={styles.details}>
            <Text style={styles.name}>{food.name || 'Unknown Food'}</Text>
            {food.brand && <Text style={styles.brand}>{food.brand}</Text>}
            
            <View style={styles.nutritionRow}>
              <LinearGradient
                colors={[Colors.sugar, Colors.sugarDark]}
                style={styles.sugarBadge}
              >
                <Text style={styles.sugarText}>
                  {totalSugarImpact.toFixed(1)}g sugar
                  {food.sugarEquivalent && food.sugarEquivalent > 0 && '*'}
                </Text>
              </LinearGradient>
              
              {food.calories && (
                <View style={styles.caloriesBadge}>
                  <Text style={styles.calories}>{food.calories} cal</Text>
                </View>
              )}
            </View>
            
            {food.sugarEquivalent && food.sugarEquivalent > 0 && (
              <View style={styles.equivalentRow}>
                <Zap size={12} color={Colors.warning} />
                <Text style={styles.equivalentText}>
                  +{food.sugarEquivalent}g sugar equivalent
                </Text>
              </View>
            )}
            
            {highestRiskSugar && (
              <View style={styles.warningRow}>
                <AlertTriangle size={12} color={Colors.danger} />
                <Text style={styles.warningText}>
                  Contains {highestRiskSugar.name} ({highestRiskSugar.severity} risk)
                </Text>
              </View>
            )}
            
            {showTime && (
              <View style={styles.timeRow}>
                <Clock size={11} color={Colors.textMuted} />
                <Text style={styles.timeText}>{formatTime(food.timestamp)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.rightContent}>
            <LinearGradient
              colors={[severity.color, severity.color + '80']}
              style={styles.severityIndicator}
            />
            
            {onDelete && (
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={onDelete}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Trash2 size={16} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  brand: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 8,
    fontWeight: '500',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  sugarBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  sugarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  caloriesBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  calories: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  equivalentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  equivalentText: {
    fontSize: 11,
    color: Colors.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  warningText: {
    fontSize: 10,
    color: Colors.danger,
    marginLeft: 4,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
    fontWeight: '500',
  },
  rightContent: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  severityIndicator: {
    width: 6,
    height: 48,
    borderRadius: 3,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  }
});