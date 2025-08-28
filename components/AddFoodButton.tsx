import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import { Camera, Barcode, Plus } from 'lucide-react-native';

type AddFoodButtonType = 'camera' | 'barcode' | 'manual';

interface AddFoodButtonProps {
  type: AddFoodButtonType;
  onPress: () => void;
  style?: ViewStyle;
}

export default function AddFoodButton({ type, onPress, style }: AddFoodButtonProps) {
  const getIcon = () => {
    switch (type) {
      case 'camera':
        return <Camera size={20} color="white" />;
      case 'barcode':
        return <Barcode size={20} color="white" />;
      case 'manual':
        return <Plus size={20} color="white" />;
    }
  };
  
  const getLabel = () => {
    switch (type) {
      case 'camera':
        return 'Take Photo';
      case 'barcode':
        return 'Scan Barcode';
      case 'manual':
        return 'Add Manually';
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'camera':
        return Colors.primary;
      case 'barcode':
        return Colors.secondary;
      case 'manual':
        return Colors.accent;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor() },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {getIcon()}
      <Text style={styles.label}>{getLabel()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  }
});