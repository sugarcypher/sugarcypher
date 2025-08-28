import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Scan, Type, Mic, X } from 'lucide-react-native';
import BarcodeScanner from './BarcodeScanner';
import MetaSweetProcessor from './MetaSweetProcessor';
import { resolveFoodData, FoodData as ResolverFoodData, ResolverResult } from '@/utils/foodDataResolver';
import { trpcClient } from '@/lib/trpc';

// Define interfaces for MetaSweet compatibility
interface FoodData {
  ingredients: string[];
  nutrition_label: {
    total_carbs: number;
    fiber: number;
    sugar: number;
    protein?: number;
    fat?: number;
  };
  serving_size_g: number;
  product_name: string;
  brand: string;
  glycemic_index?: number;
}

interface MetaSweetResult {
  sugar_equivalent_g: number;
  glycemic_load: number;
  net_carbs: number;
  delta_vs_label: number;
  tts_response: string;
  text_overlay: string;
  alerts: string[];
  confidence_score: number;
}

interface FoodScannerProps {
  visible: boolean;
  onClose: () => void;
  onFoodScanned: (foodData: FoodData, metaSweetResult: MetaSweetResult) => void;
  testId?: string;
}

interface ScanResult {
  success: boolean;
  foodData?: FoodData;
  error?: string;
  source?: string;
  trust_score?: number;
}

export const FoodScanner: React.FC<FoodScannerProps> = ({
  visible,
  onClose,
  onFoodScanned,
  testId
}) => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFoodData, setCurrentFoodData] = useState<FoodData | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showNotFoundError, setShowNotFoundError] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState('');

  // Convert ResolverFoodData to FoodData format for MetaSweet compatibility
  const convertToMetaSweetFormat = (resolverData: ResolverFoodData): FoodData => {
    return {
      ingredients: resolverData.ingredients,
      nutrition_label: {
        total_carbs: resolverData.nutrition_facts.total_carbs_g,
        fiber: resolverData.nutrition_facts.fiber_g,
        sugar: resolverData.nutrition_facts.sugars_g,
        protein: resolverData.nutrition_facts.protein_g,
        fat: resolverData.nutrition_facts.fat_g
      },
      serving_size_g: resolverData.serving_size_g,
      product_name: resolverData.product_name,
      brand: resolverData.brand,
      glycemic_index: resolverData.glycemic_index
    };
  };

  const lookupFoodData = async (identifier: string): Promise<ScanResult> => {
    try {
      // Record evidence of food lookup
      await trpcClient.security.evidence.record.mutate({
        eventType: 'user_action',
        action: 'food_lookup',
        metadata: {
          identifier,
          lookup_method: identifier.length > 10 ? 'barcode' : 'manual',
          timestamp: new Date().toISOString()
        }
      });

      console.log(`[FoodScanner] Looking up identifier: ${identifier}`);
      
      // Use the FoodDataResolver for barcode lookups
      if (identifier.length >= 8 && /^\d+$/.test(identifier)) {
        const resolverResult: ResolverResult = await resolveFoodData(identifier);
        
        if (resolverResult.success && resolverResult.foodData) {
          const metaSweetData = convertToMetaSweetFormat(resolverResult.foodData);
          console.log(`[FoodScanner] Resolved via ${resolverResult.source} (trust: ${resolverResult.trust_score})`);
          
          return {
            success: true,
            foodData: metaSweetData,
            source: resolverResult.source,
            trust_score: resolverResult.trust_score
          };
        } else {
          return {
            success: false,
            error: resolverResult.error || 'Failed to resolve food data'
          };
        }
      }
      
      // For manual text entries, try to match against known products
      const manualLookupDatabase: Record<string, FoodData> = {
        'apple': {
          ingredients: ['apple'],
          nutrition_label: {
            total_carbs: 25,
            fiber: 4,
            sugar: 19
          },
          serving_size_g: 182,
          product_name: 'Apple',
          brand: 'Nature'
        },
        'banana': {
          ingredients: ['banana'],
          nutrition_label: {
            total_carbs: 27,
            fiber: 3,
            sugar: 14
          },
          serving_size_g: 118,
          product_name: 'Banana',
          brand: 'Nature'
        },
        'orange': {
          ingredients: ['orange'],
          nutrition_label: {
            total_carbs: 15,
            fiber: 3,
            sugar: 12
          },
          serving_size_g: 154,
          product_name: 'Orange',
          brand: 'Nature'
        }
      };
      
      const manualData = manualLookupDatabase[identifier.toLowerCase()];
      if (manualData) {
        console.log(`[FoodScanner] Found manual entry: ${manualData.product_name}`);
        return {
          success: true,
          foodData: manualData,
          source: 'Manual Database',
          trust_score: 0.8
        };
      }
      
      // If not found, return error
      return {
        success: false,
        error: 'Food not found. Please try a different search term or barcode.'
      };
    } catch (error) {
      console.error('[FoodScanner] Lookup error:', error);
      return {
        success: false,
        error: 'Failed to lookup food data. Please try again.'
      };
    }
  };

  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    setScannerVisible(false);
    setIsProcessing(true);
    setShowNotFoundError(false);
    setLastSearchTerm(barcode);

    try {
      const result = await lookupFoodData(barcode);
      
      if (result.success && result.foodData) {
        setCurrentFoodData(result.foodData);
      } else {
        // Show cute error message instead of 404
        setShowNotFoundError(true);
        setIsProcessing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process barcode. Please try again.');
      setIsProcessing(false);
    }
  }, []);

  const handleManualEntry = useCallback(async () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter a food name or barcode.');
      return;
    }

    setManualEntryVisible(false);
    setIsProcessing(true);
    setShowNotFoundError(false);
    setLastSearchTerm(manualInput.trim());

    try {
      const result = await lookupFoodData(manualInput.trim());
      
      if (result.success && result.foodData) {
        setCurrentFoodData(result.foodData);
      } else {
        // Show cute error message instead of 404
        setShowNotFoundError(true);
        setIsProcessing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process manual entry. Please try again.');
      setIsProcessing(false);
    }
  }, [manualInput]);

  const handleMetaSweetResult = useCallback((result: MetaSweetResult) => {
    if (currentFoodData) {
      onFoodScanned(currentFoodData, result);
      // Reset state
      setCurrentFoodData(null);
      setIsProcessing(false);
      setManualInput('');
      onClose();
    }
  }, [currentFoodData, onFoodScanned, onClose]);

  const handleMetaSweetError = useCallback((error: string) => {
    Alert.alert('Processing Error', error);
    setIsProcessing(false);
    setCurrentFoodData(null);
  }, []);

  const handleClose = useCallback(() => {
    setCurrentFoodData(null);
    setIsProcessing(false);
    setManualInput('');
    setShowNotFoundError(false);
    setLastSearchTerm('');
    setScannerVisible(false);
    setManualEntryVisible(false);
    onClose();
  }, [onClose]);

  const handleTryAgain = useCallback(() => {
    setShowNotFoundError(false);
    setIsProcessing(false);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Main Scanner Modal */}
      <Modal
        visible={visible && !scannerVisible && !manualEntryVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={styles.container} testID={testId}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Food</Text>
            <View style={styles.headerSpacer} />
          </View>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Text style={styles.processingTitle}>Analyzing Food...</Text>
              <Text style={styles.processingSubtitle}>
                MetaSweet™ is calculating the true sugar impact
              </Text>
              {currentFoodData && (
                <Text style={styles.processingDetails}>
                  Found: {currentFoodData.product_name} by {currentFoodData.brand}
                </Text>
              )}
              {currentFoodData && (
                <MetaSweetProcessor
                  foodData={currentFoodData}
                  onResult={handleMetaSweetResult}
                  onError={handleMetaSweetError}
                />
              )}
            </View>
          ) : showNotFoundError ? (
            <View style={styles.notFoundContainer}>
              <Text style={styles.notFoundEmoji}>🔍😅</Text>
              <Text style={styles.notFoundTitle}>Oops!</Text>
              <Text style={styles.notFoundMessage}>
                That item is not findable with the various libraries we reference.
              </Text>
              <Text style={styles.notFoundSubMessage}>
                We searched through our food databases but couldn&apos;t locate &quot;{lastSearchTerm}&quot;. 
                Don&apos;t worry though - you can try a different barcode or add it manually!
              </Text>
              
              <View style={styles.notFoundActions}>
                <TouchableOpacity
                  style={styles.tryAgainButton}
                  onPress={handleTryAgain}
                >
                  <Text style={styles.tryAgainButtonText}>Try Another Item</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.manualEntryButton}
                  onPress={() => {
                    setShowNotFoundError(false);
                    setManualEntryVisible(true);
                  }}
                >
                  <Text style={styles.manualEntryButtonText}>Add Manually</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <Text style={styles.instructionText}>
                Choose how you'd like to identify your food:
              </Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setScannerVisible(true)}
              >
                <Scan size={32} color="#00ff88" />
                <Text style={styles.optionTitle}>Scan Barcode</Text>
                <Text style={styles.optionDescription}>
                  Use your camera to scan product barcodes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setManualEntryVisible(true)}
              >
                <Type size={32} color="#00ff88" />
                <Text style={styles.optionTitle}>Manual Entry</Text>
                <Text style={styles.optionDescription}>
                  Type the food name or barcode manually
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, styles.disabledOption]}
                disabled={true}
              >
                <Mic size={32} color="#666" />
                <Text style={[styles.optionTitle, styles.disabledText]}>Voice Input</Text>
                <Text style={[styles.optionDescription, styles.disabledText]}>
                  Coming soon - speak the food name
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScanned}
      />

      {/* Manual Entry Modal */}
      <Modal
        visible={manualEntryVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setManualEntryVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.manualEntryContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setManualEntryVisible(false)}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manual Entry</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Food Name or Barcode</Text>
            <TextInput
              style={styles.textInput}
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="e.g., 'Apple' or '123456789012'"
              placeholderTextColor="#999"
              autoFocus={true}
              returnKeyType="search"
              onSubmitEditing={handleManualEntry}
            />
            
            <TouchableOpacity
              style={[styles.searchButton, !manualInput.trim() && styles.disabledButton]}
              onPress={handleManualEntry}
              disabled={!manualInput.trim()}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  processingDetails: {
    fontSize: 14,
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500' as const,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  disabledOption: {
    backgroundColor: '#f0f0f0',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  disabledText: {
    color: '#999',
  },
  manualEntryContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  notFoundEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  notFoundTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  notFoundMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
    fontWeight: '500' as const,
  },
  notFoundSubMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  notFoundActions: {
    width: '100%',
    gap: 12,
  },
  tryAgainButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  tryAgainButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  manualEntryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  manualEntryButtonText: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default FoodScanner;