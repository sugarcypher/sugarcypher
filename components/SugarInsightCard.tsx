import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { SugarInsight } from '@/types/food';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react-native';
import { DAILY_SUGAR_LIMIT_GRAMS } from '@/constants/sugarLimits';

interface SugarInsightCardProps {
  insight: SugarInsight;
}

export default function SugarInsightCard({ insight }: SugarInsightCardProps) {
  const getTrendIcon = () => {
    switch (insight.trend) {
      case 'increasing':
        return <TrendingUp size={20} color={Colors.danger} />;
      case 'decreasing':
        return <TrendingDown size={20} color={Colors.success} />;
      case 'stable':
        return <Minus size={20} color={Colors.subtext} />;
    }
  };
  
  const getTrendText = () => {
    switch (insight.trend) {
      case 'increasing':
        return 'Your sugar intake is trending up';
      case 'decreasing':
        return 'Your sugar intake is trending down';
      case 'stable':
        return 'Your sugar intake is stable';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const getComparisonToLimit = () => {
    const percentage = (insight.averageSugar / DAILY_SUGAR_LIMIT_GRAMS) * 100;
    
    if (percentage <= 50) {
      return 'Well below the recommended limit';
    } else if (percentage <= 80) {
      return 'Below the recommended limit';
    } else if (percentage <= 100) {
      return 'Close to the recommended limit';
    } else if (percentage <= 150) {
      return 'Above the recommended limit';
    } else {
      return 'Far above the recommended limit';
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {insight.type === 'weekly' ? '7-Day' : insight.type === 'monthly' ? 'Monthly' : 'Daily'} Sugar Insight
      </Text>
      
      <View style={styles.averageContainer}>
        <Text style={styles.averageLabel}>Average Sugar</Text>
        <Text style={styles.averageValue}>{insight.averageSugar.toFixed(1)}g</Text>
        <Text style={styles.comparisonText}>{getComparisonToLimit()}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        {insight.highestDay && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Highest Day</Text>
            <Text style={styles.detailValue}>
              {formatDate(insight.highestDay.date)}: {insight.highestDay.amount.toFixed(1)}g
            </Text>
          </View>
        )}
        
        {insight.lowestDay && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Lowest Day</Text>
            <Text style={styles.detailValue}>
              {formatDate(insight.lowestDay.date)}: {insight.lowestDay.amount.toFixed(1)}g
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.trendContainer}>
        {getTrendIcon()}
        <Text style={styles.trendText}>{getTrendText()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  averageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  averageLabel: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.subtext,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  }
});