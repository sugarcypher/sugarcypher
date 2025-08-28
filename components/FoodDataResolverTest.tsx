import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Search, Database, Trash2 } from 'lucide-react-native';
import { resolveFoodData, clearFoodCache, getCacheStats, API_SOURCES } from '@/utils/foodDataResolver';

export const FoodDataResolverTest: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<{ size: number; entries: string[] }>({ size: 0, entries: [] });

  const handleSearch = async () => {
    if (!barcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log(`[Test] Testing barcode: ${barcode}`);
      const resolverResult = await resolveFoodData(barcode.trim());
      setResult(resolverResult);
      updateCacheStats();
    } catch (error) {
      console.error('[Test] Error:', error);
      setResult({ success: false, error: `Test error: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCache = () => {
    clearFoodCache();
    updateCacheStats();
    Alert.alert('Cache Cleared', 'Food data cache has been cleared');
  };

  const testBarcodes = [
    { code: '049000006346', name: 'Coca-Cola (Mock)' },
    { code: '038000138416', name: 'Lays Chips (Mock)' },
    { code: '021130126026', name: 'Honey Nut Cheerios (Mock)' },
    { code: '123456789012', name: 'Granola Bar (Mock)' },
    { code: '3017620422003', name: 'Nutella (OpenFoodFacts)' },
    { code: '7622210951965', name: 'Oreo (OpenFoodFacts)' },
    { code: '8901030835289', name: 'Unknown Product' }
  ];

  React.useEffect(() => {
    updateCacheStats();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Database size={24} color="#00ff88" />
        <Text style={styles.title}>FoodDataResolver Test</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Test Barcode Lookup</Text>
        <TextInput
          style={styles.input}
          value={barcode}
          onChangeText={setBarcode}
          placeholder="Enter barcode (e.g., 049000006346)"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.disabledButton]}
          onPress={handleSearch}
          disabled={isLoading}
        >
          <Search size={20} color="#000" />
          <Text style={styles.searchButtonText}>
            {isLoading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickTestSection}>
        <Text style={styles.sectionTitle}>Quick Test Barcodes</Text>
        {testBarcodes.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickTestButton}
            onPress={() => setBarcode(item.code)}
          >
            <Text style={styles.quickTestCode}>{item.code}</Text>
            <Text style={styles.quickTestName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {result && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Result</Text>
          <View style={[styles.resultCard, result.success ? styles.successCard : styles.errorCard]}>
            <Text style={styles.resultStatus}>
              {result.success ? '✅ Success' : '❌ Failed'}
            </Text>
            
            {result.success && result.foodData ? (
              <View style={styles.foodDataContainer}>
                <Text style={styles.foodName}>{result.foodData.product_name}</Text>
                <Text style={styles.foodBrand}>by {result.foodData.brand}</Text>
                
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Source:</Text>
                  <Text style={styles.metadataValue}>{result.source}</Text>
                </View>
                
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Trust Score:</Text>
                  <Text style={[styles.metadataValue, { color: result.trust_score >= 0.8 ? '#00ff88' : '#ff6b6b' }]}>
                    {(result.trust_score * 100).toFixed(0)}%
                  </Text>
                </View>
                
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Incomplete:</Text>
                  <Text style={[styles.metadataValue, { color: result.incomplete_flag ? '#ff6b6b' : '#00ff88' }]}>
                    {result.incomplete_flag ? 'Yes' : 'No'}
                  </Text>
                </View>

                <View style={styles.nutritionSection}>
                  <Text style={styles.nutritionTitle}>Nutrition (per {result.foodData.serving_size_g}g)</Text>
                  <Text style={styles.nutritionItem}>Carbs: {result.foodData.nutrition_facts.total_carbs_g}g</Text>
                  <Text style={styles.nutritionItem}>Fiber: {result.foodData.nutrition_facts.fiber_g}g</Text>
                  <Text style={styles.nutritionItem}>Sugars: {result.foodData.nutrition_facts.sugars_g}g</Text>
                  {result.foodData.nutrition_facts.protein_g && (
                    <Text style={styles.nutritionItem}>Protein: {result.foodData.nutrition_facts.protein_g}g</Text>
                  )}
                  {result.foodData.nutrition_facts.calories && (
                    <Text style={styles.nutritionItem}>Calories: {result.foodData.nutrition_facts.calories}</Text>
                  )}
                </View>

                <View style={styles.ingredientsSection}>
                  <Text style={styles.ingredientsTitle}>Ingredients ({result.foodData.ingredients.length})</Text>
                  <Text style={styles.ingredientsText}>
                    {result.foodData.ingredients.join(', ')}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.errorText}>{result.error}</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.cacheSection}>
        <View style={styles.cacheSectionHeader}>
          <Text style={styles.sectionTitle}>Cache Stats</Text>
          <TouchableOpacity style={styles.clearCacheButton} onPress={handleClearCache}>
            <Trash2 size={16} color="#ff6b6b" />
            <Text style={styles.clearCacheText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cacheStats}>Cached entries: {cacheStats.size}</Text>
        {cacheStats.entries.length > 0 && (
          <View style={styles.cacheEntries}>
            {cacheStats.entries.map((entry, index) => (
              <Text key={index} style={styles.cacheEntry}>{entry}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.apiSourcesSection}>
        <Text style={styles.sectionTitle}>API Sources (Priority Order)</Text>
        {API_SOURCES.map((source, index) => (
          <View key={index} style={styles.apiSourceCard}>
            <Text style={styles.apiSourceName}>{index + 1}. {source.name}</Text>
            <Text style={styles.apiSourceAccess}>{source.access}</Text>
            <Text style={styles.apiSourceNotes}>{source.notes}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#333',
    marginLeft: 12,
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff88',
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  quickTestSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  quickTestButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  quickTestCode: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  quickTestName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  resultSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  resultCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  successCard: {
    backgroundColor: '#f0fff4',
    borderColor: '#00ff88',
  },
  errorCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff6b6b',
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  foodDataContainer: {
    gap: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
  },
  foodBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  nutritionSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  nutritionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 6,
  },
  nutritionItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  ingredientsSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 6,
  },
  ingredientsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
  },
  cacheSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  cacheSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearCacheText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginLeft: 4,
  },
  cacheStats: {
    fontSize: 14,
    color: '#666',
  },
  cacheEntries: {
    marginTop: 8,
  },
  cacheEntry: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  apiSourcesSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  apiSourceCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  apiSourceName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  apiSourceAccess: {
    fontSize: 12,
    color: '#00ff88',
    marginTop: 2,
  },
  apiSourceNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default FoodDataResolverTest;