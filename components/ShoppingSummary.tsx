import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useShoppingStore } from '@/store/shoppingStore';

interface ShoppingSummaryProps {
  testId?: string;
}

export const ShoppingSummary: React.FC<ShoppingSummaryProps> = ({ testId }) => {
  const { receipts, currentScore, weeklyAverage, monthlyTrend } = useShoppingStore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = () => {
    const trend = monthlyTrend[monthlyTrend.length - 1] - monthlyTrend[monthlyTrend.length - 2];
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    const trend = monthlyTrend[monthlyTrend.length - 1] - monthlyTrend[monthlyTrend.length - 2];
    return trend > 0 ? Colors.success : Colors.error;
  };

  const recentHighSugarItems = receipts
    .slice(0, 5)
    .flatMap(receipt => receipt.items.filter(item => item.isHighSugar))
    .slice(0, 10);

  const totalSpentThisWeek = receipts
    .filter(receipt => {
      const receiptDate = new Date(receipt.date);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return receiptDate >= oneWeekAgo;
    })
    .reduce((sum, receipt) => sum + receipt.total, 0);

  const TrendIcon = getTrendIcon();

  return (
    <ScrollView style={styles.container} testID={testId}>
      {/* Score Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shopping Score Overview</Text>
        
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Award size={24} color={getScoreColor(currentScore)} />
            <Text style={styles.scoreTitle}>Current Score</Text>
          </View>
          
          <Text style={[styles.scoreValue, { color: getScoreColor(currentScore) }]}>
            {currentScore}/100
          </Text>
          
          <Text style={[styles.scoreLabel, { color: getScoreColor(currentScore) }]}>
            {getScoreLabel(currentScore)}
          </Text>
          
          <View style={styles.scoreTrend}>
            <TrendIcon size={16} color={getTrendColor()} />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {Math.abs(monthlyTrend[monthlyTrend.length - 1] - monthlyTrend[monthlyTrend.length - 2])} points vs last month
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{receipts.filter(r => {
              const date = new Date(r.date);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return date >= weekAgo;
            }).length}</Text>
            <Text style={styles.statLabel}>Shopping Trips</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalSpentThisWeek.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {weeklyAverage}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>
      </View>

      {/* High Sugar Items Alert */}
      {recentHighSugarItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent High Sugar Items</Text>
          
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color={Colors.warning} />
              <Text style={styles.alertTitle}>Items to Watch</Text>
            </View>
            
            {recentHighSugarItems.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.alertItem}>
                <Text style={styles.alertItemName}>{item.name}</Text>
                <Text style={styles.alertItemSugar}>{item.sugarContent}g sugar</Text>
              </View>
            ))}
            
            {recentHighSugarItems.length > 5 && (
              <Text style={styles.alertMore}>
                +{recentHighSugarItems.length - 5} more items
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Monthly Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Trend</Text>
        
        <View style={styles.trendCard}>
          <View style={styles.trendChart}>
            {monthlyTrend.map((score, index) => (
              <View key={index} style={styles.trendBar}>
                <View 
                  style={[
                    styles.trendBarFill, 
                    { 
                      height: `${score}%`,
                      backgroundColor: getScoreColor(score)
                    }
                  ]} 
                />
                <Text style={styles.trendBarLabel}>
                  {['W1', 'W2', 'W3', 'W4'][index]}
                </Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.trendDescription}>
            Your sugar shopping score over the past 4 weeks
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>🎯 Focus Areas</Text>
          
          {currentScore < 60 && (
            <Text style={styles.recommendationText}>
              • Try to reduce sugary beverages and snacks
            </Text>
          )}
          
          {recentHighSugarItems.length > 5 && (
            <Text style={styles.recommendationText}>
              • Consider healthier alternatives for frequently purchased high-sugar items
            </Text>
          )}
          
          <Text style={styles.recommendationText}>
            • Shop the perimeter of the store for fresh produce
          </Text>
          
          <Text style={styles.recommendationText}>
            • Read nutrition labels carefully for hidden sugars
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  scoreCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 12,
  },
  scoreTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  alertItemName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  alertItemSugar: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500' as const,
  },
  alertMore: {
    fontSize: 12,
    color: Colors.subtext,
    fontStyle: 'italic',
    marginTop: 8,
  },
  trendCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 12,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 40,
  },
  trendBarFill: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginBottom: 8,
  },
  trendBarLabel: {
    fontSize: 12,
    color: Colors.subtext,
  },
  trendDescription: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default ShoppingSummary;