import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera, Flashlight, Receipt } from 'lucide-react-native';
import Colors from '@/constants/colors';

import { useShoppingStore } from '@/store/shoppingStore';

interface ReceiptScannerProps {
  visible: boolean;
  onClose: () => void;
  onReceiptScanned: (receiptData: any) => void;
  testId?: string;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  visible,
  onClose,
  onReceiptScanned,
  testId
}) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addReceipt } = useShoppingStore();

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  const handleTakePhoto = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // For demo purposes, we'll simulate taking a photo and analyzing it
      console.log('[ReceiptScanner] Simulating photo capture and analysis...');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock receipt data
      const mockReceiptData = generateMockReceiptData();
      
      // Add to store
      addReceipt(mockReceiptData);
      
      // Notify parent
      onReceiptScanned(mockReceiptData);
      
    } catch (error) {
      console.error('[ReceiptScanner] Error processing receipt:', error);
      Alert.alert(
        'Processing Error',
        'Failed to analyze the receipt. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockReceiptData = () => {
    const stores = ['Whole Foods', 'Safeway', 'Target', 'Walmart', 'Kroger'];
    const mockItems = [
      { name: 'Organic Apples', price: 4.99, sugarContent: 0, category: 'Produce', isHighSugar: false, hasHiddenSugars: false, warnings: [] },
      { name: 'Coca Cola 12pk', price: 5.99, sugarContent: 39, category: 'Beverages', isHighSugar: true, hasHiddenSugars: false, warnings: ['High sugar content'] },
      { name: 'Whole Wheat Bread', price: 3.49, sugarContent: 2, category: 'Bakery', isHighSugar: false, hasHiddenSugars: true, warnings: ['Contains added sugars'] },
      { name: 'Greek Yogurt', price: 1.99, sugarContent: 6, category: 'Dairy', isHighSugar: false, hasHiddenSugars: false, warnings: [] },
      { name: 'Granola Bars', price: 4.49, sugarContent: 12, category: 'Snacks', isHighSugar: true, hasHiddenSugars: true, warnings: ['High sugar content', 'Contains corn syrup'] },
      { name: 'Pasta Sauce', price: 2.99, sugarContent: 8, category: 'Condiments', isHighSugar: false, hasHiddenSugars: true, warnings: ['Contains added sugars'] },
      { name: 'Chicken Breast', price: 8.99, sugarContent: 0, category: 'Meat', isHighSugar: false, hasHiddenSugars: false, warnings: [] },
    ];
    
    // Select random items
    const selectedItems = mockItems.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const highSugarItems = selectedItems.filter(item => item.isHighSugar).length;
    const totalSugar = selectedItems.reduce((sum, item) => sum + item.sugarContent, 0);
    
    // Calculate sugar score (0-100, higher is better)
    const sugarScore = Math.max(0, Math.min(100, 100 - (totalSugar * 2) - (highSugarItems * 10)));
    
    const warnings = selectedItems.flatMap(item => item.warnings).filter((warning, index, arr) => arr.indexOf(warning) === index);
    
    return {
      id: Date.now().toString(),
      store: stores[Math.floor(Math.random() * stores.length)],
      date: new Date().toLocaleDateString(),
      total,
      totalItems: selectedItems.length,
      highSugarItems,
      sugarScore: Math.round(sugarScore),
      items: selectedItems,
      warnings,
    };
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (!visible) {
    return null;
  }

  if (!permission) {
    return (
      <View style={styles.container} testID={testId}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container} testID={testId}>
        <View style={styles.permissionContainer}>
          <Camera size={48} color="#666" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionMessage}>
            We need access to your camera to scan receipts and analyze your shopping habits.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container} testID={testId}>
        <View style={styles.webFallbackContainer}>
          <Receipt size={48} color="#666" />
          <Text style={styles.webFallbackTitle}>Receipt Scanning Not Available</Text>
          <Text style={styles.webFallbackMessage}>
            Receipt scanning is not available in the web version. Please use the mobile app for full functionality.
          </Text>
          <TouchableOpacity style={styles.demoButton} onPress={handleTakePhoto}>
            <Text style={styles.demoButtonText}>Try Demo Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testId}>
      <CameraView
        style={styles.camera}
        facing={facing}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Receipt</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanningArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>
            Position your receipt within the frame and tap the capture button
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Flashlight size={24} color={flashEnabled ? Colors.primary : "white"} />
            <Text style={styles.controlText}>Flash</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]} 
            onPress={handleTakePhoto}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <Camera size={32} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Camera size={24} color="white" />
            <Text style={styles.controlText}>Flip</Text>
          </TouchableOpacity>
        </View>

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Analyzing receipt...</Text>
            <Text style={styles.processingSubtext}>This may take a few seconds</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionMessage: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#ccc',
    fontSize: 16,
  },
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 40,
  },
  webFallbackTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  webFallbackMessage: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  demoButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 300,
    height: 400,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  processingSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
  },
});

export default ReceiptScanner;