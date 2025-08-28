import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Camera, Scan, Zap, AlertTriangle, Info } from 'lucide-react-native';
import FoodScanner from '@/components/FoodScanner';
import colors from '@/constants/colors';
import { useNavigation } from 'expo-router';
import { useFoodLogStore } from '@/store/foodLogStore';
import { findHiddenSugars } from '@/constants/hiddenSugarTypes';
import { Food } from '@/types/food';

export default function ScannerScreen() {
  const [scannerVisible, setScannerVisible] = useState(false);
  const navigation = useNavigation();
  const { addFood } = useFoodLogStore();

  const handleFoodScanned = (foodData: any, metaSweetResult: any) => {
    console.log('Food scanned:', foodData, metaSweetResult);
    
    // Find hidden sugars in ingredients
    const ingredientsString = foodData.ingredients?.join(', ') || '';
    const hiddenSugarTypes = findHiddenSugars(ingredientsString);
    
    // Create Food object
    const food: Food = {
      id: Date.now().toString(),
      name: foodData.product_name,
      brand: foodData.brand,
      sugarPerServing: metaSweetResult.sugar_equivalent_g,
      servingSize: `${foodData.serving_size_g}g`,
      servingSizeGrams: foodData.serving_size_g,
      hiddenSugars: hiddenSugarTypes.map(h => h.name),
      hiddenSugarTypes: hiddenSugarTypes,
      timestamp: Date.now(),
      mealType: 'snack',
      calories: foodData.nutrition_label.protein ? 
        (foodData.nutrition_label.protein * 4) + 
        (foodData.nutrition_label.fat * 9) + 
        (foodData.nutrition_label.total_carbs * 4) : undefined,
      carbs: foodData.nutrition_label.total_carbs,
      protein: foodData.nutrition_label.protein,
      fat: foodData.nutrition_label.fat,
      ingredients: foodData.ingredients,
      glycemicIndex: foodData.glycemic_index,
      sugarEquivalent: metaSweetResult.sugar_equivalent_g
    };
    
    addFood(food);
    
    // Show success alert with sugar analysis
    Alert.alert(
      'Food Added Successfully!',
      `${food.name} has been added to your log.\n\nSugar Impact: ${metaSweetResult.sugar_equivalent_g}g\n${hiddenSugarTypes.length > 0 ? `Hidden sugars found: ${hiddenSugarTypes.length}` : 'No hidden sugars detected'}`,
      [
        { text: 'View Log', onPress: () => navigation.navigate('(tabs)/log' as never) },
        { text: 'Scan Another', onPress: () => setScannerVisible(true) },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleCloseScanner = () => {
    setScannerVisible(false);
  };

  const handleStartScanning = () => {
    setScannerVisible(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Scanner', headerShown: true }} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Camera size={48} color={colors.primary} />
            </View>
          </View>
          
          <Text style={styles.title}>Advanced Food Scanner</Text>
          <Text style={styles.subtitle}>
            Scan barcodes to get comprehensive nutritional analysis with MetaSweet™ technology
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Scan size={20} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Barcode Scanning</Text>
                <Text style={styles.featureDescription}>Instant product recognition</Text>
              </View>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Zap size={20} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>MetaSweet™ Analysis</Text>
                <Text style={styles.featureDescription}>True sugar impact calculation</Text>
              </View>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <AlertTriangle size={20} color={colors.warning} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Hidden Sugar Detection</Text>
                <Text style={styles.featureDescription}>Identify disguised sweeteners</Text>
              </View>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Info size={20} color={colors.info} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Glycemic Impact</Text>
                <Text style={styles.featureDescription}>Blood sugar response prediction</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={handleStartScanning}
            testID="start-scan-button"
          >
            <View style={styles.scanButtonContent}>
              <Camera size={24} color="#000" />
              <Text style={styles.scanButtonText}>Start Advanced Scan</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Enterprise-Grade Analysis</Text>
            <Text style={styles.infoText}>
              Our proprietary MetaSweet™ technology goes beyond basic nutrition labels to calculate the true metabolic impact of foods, including hidden sugars and glycemic response.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <FoodScanner 
        visible={scannerVisible} 
        onClose={handleCloseScanner} 
        onFoodScanned={handleFoodScanned}
        testId="food-scanner"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    minHeight: '100%',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    marginBottom: 48,
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    marginBottom: 32,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  scanButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
