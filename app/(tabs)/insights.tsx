import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useFoodLogStore } from '@/store/foodLogStore';
import Colors from '@/constants/colors';
import SugarInsightCard from '@/components/SugarInsightCard';
import EmptyState from '@/components/EmptyState';
import { BarChart2 } from 'lucide-react-native';

export default function InsightsScreen() {
  const { insights, calculateInsights, logs } = useFoodLogStore();
  
  useEffect(() => {
    calculateInsights();
  }, [logs, calculateInsights]);
  
  return (
    <>
      <Stack.Screen options={{ title: 'Sugar Insights' }} />
      
      <View style={styles.container}>
        <Text style={styles.title}>Your Sugar Consumption</Text>
        
        {Object.keys(logs).length > 0 ? (
          <ScrollView style={styles.scrollView}>
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <SugarInsightCard key={index} insight={insight} />
              ))
            ) : (
              <Text style={styles.noInsightsText}>
                Not enough data to generate insights yet. Keep logging your foods!
              </Text>
            )}
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Did you know?</Text>
              <Text style={styles.infoText}>
                The World Health Organization recommends limiting added sugar intake to less than 10% of total daily calories, 
                which is about 25 grams (6 teaspoons) for an average adult.
              </Text>
              
              <Text style={styles.infoTitle}>Hidden Sugars</Text>
              <Text style={styles.infoText}>
                Sugar can hide in many foods under different names like high-fructose corn syrup, 
                dextrose, maltose, and fruit juice concentrate. Our app helps you identify these hidden sugars.
              </Text>
              
              <Text style={styles.infoTitle}>Sugar and Health</Text>
              <Text style={styles.infoText}>
                Excessive sugar consumption has been linked to various health issues including obesity, 
                type 2 diabetes, heart disease, and tooth decay.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <EmptyState 
            title="No data yet"
            message="Start logging your foods to see insights about your sugar consumption patterns."
            icon={<BarChart2 size={60} color={Colors.primary} />}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  noInsightsText: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  }
});