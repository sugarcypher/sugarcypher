import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Camera, Receipt, TrendingUp, Award, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { useShoppingStore } from '@/store/shoppingStore';

export default function ShoppingScreen() {
  const [showScanner, setShowScanner] = useState(false);
  const { receipts, currentScore, weeklyAverage } = useShoppingStore();

  const handleScanReceipt = () => {
    setShowScanner(true);
  };

  const handleReceiptScanned = (receiptData: any) => {
    console.log('[Shopping] Receipt scanned:', receiptData);
    setShowScanner(false);
    
    Alert.alert(
      'Receipt Analyzed!',
      `Sugar Score: ${receiptData.sugarScore}/100\n${receiptData.items.length} items analyzed`,
      [{ text: 'OK' }]
    );
  };

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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Smart Shopping',
          headerStyle: { backgroundColor: Colors.card },
          headerTitleStyle: { color: Colors.text },
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Award size={20} color={getScoreColor(currentScore)} />
              <Text style={styles.statLabel}>Current Score</Text>
            </View>
            <Text style={[styles.statValue, { color: getScoreColor(currentScore) }]}>
              {currentScore}/100
            </Text>
            <Text style={[styles.statSubtext, { color: getScoreColor(currentScore) }]}>
              {getScoreLabel(currentScore)}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={20} color={Colors.primary} />
              <Text style={styles.statLabel}>Weekly Avg</Text>
            </View>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {weeklyAverage}/100
            </Text>
            <Text style={styles.statSubtext}>
              {weeklyAverage > currentScore ? '+' : ''}{weeklyAverage - currentScore} vs last
            </Text>
          </View>
        </View>

        {/* Scan Receipt Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt}>
          <Camera size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan Receipt</Text>
          <Text style={styles.scanButtonSubtext}>Get your sugar shopping score</Text>
        </TouchableOpacity>

        {/* Recent Receipts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Shopping Trips</Text>
          
          {receipts.length === 0 ? (
            <View style={styles.emptyState}>
              <Receipt size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No receipts yet</Text>
              <Text style={styles.emptySubtext}>
                Scan your first receipt to start tracking your sugar shopping habits
              </Text>
            </View>
          ) : (
            receipts.map((receipt, index) => (
              <View key={index} style={styles.receiptCard}>
                <View style={styles.receiptHeader}>
                  <View>
                    <Text style={styles.receiptStore}>{receipt.store}</Text>
                    <Text style={styles.receiptDate}>{receipt.date}</Text>
                  </View>
                  <View style={styles.receiptScore}>
                    <Text style={[styles.scoreText, { color: getScoreColor(receipt.sugarScore) }]}>
                      {receipt.sugarScore}
                    </Text>
                    <Text style={styles.scoreLabel}>Score</Text>
                  </View>
                </View>
                
                <View style={styles.receiptStats}>
                  <View style={styles.receiptStat}>
                    <Text style={styles.receiptStatValue}>{receipt.totalItems}</Text>
                    <Text style={styles.receiptStatLabel}>Items</Text>
                  </View>
                  <View style={styles.receiptStat}>
                    <Text style={styles.receiptStatValue}>{receipt.highSugarItems}</Text>
                    <Text style={styles.receiptStatLabel}>High Sugar</Text>
                  </View>
                  <View style={styles.receiptStat}>
                    <Text style={styles.receiptStatValue}>${receipt.total.toFixed(2)}</Text>
                    <Text style={styles.receiptStatLabel}>Total</Text>
                  </View>
                </View>
                
                {receipt.warnings && receipt.warnings.length > 0 && (
                  <View style={styles.warningsContainer}>
                    <AlertTriangle size={16} color={Colors.warning} />
                    <Text style={styles.warningText}>
                      {receipt.warnings.length} item{receipt.warnings.length > 1 ? 's' : ''} with hidden sugars
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Shopping Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Shopping Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🛒 Shop the Perimeter</Text>
            <Text style={styles.tipText}>
              Fresh produce, dairy, and proteins are usually located around the store's perimeter
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🔍 Read Labels Carefully</Text>
            <Text style={styles.tipText}>
              Look for hidden sugars like high fructose corn syrup, dextrose, and maltose
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📋 Plan Your Meals</Text>
            <Text style={styles.tipText}>
              Having a meal plan helps you avoid impulse purchases of sugary snacks
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Receipt Scanner Modal */}
      <ReceiptScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onReceiptScanned={handleReceiptScanned}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '500' as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: Colors.subtext,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: 8,
  },
  scanButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  receiptCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  receiptStore: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  receiptDate: {
    fontSize: 14,
    color: Colors.subtext,
    marginTop: 2,
  },
  receiptScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.subtext,
  },
  receiptStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  receiptStat: {
    alignItems: 'center',
  },
  receiptStatValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  receiptStatLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 2,
  },
  warningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.warning,
    flex: 1,
  },
  tipCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.subtext,
    lineHeight: 20,
  },
});