import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useFoodLogStore } from '@/store/foodLogStore';
import { generateFoodId, getCurrentMealType } from '@/utils/foodUtils';
import { ArrowLeft, Check } from 'lucide-react-native';

export default function AddFoodScreen() {
  const router = useRouter();
  const { addFood } = useFoodLogStore();
  
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sugarAmount, setSugarAmount] = useState('');
  const [servingSize, setServingSize] = useState('1 serving');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(getCurrentMealType());
  
  const handleSave = () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }
    
    if (!sugarAmount) {
      Alert.alert('Error', 'Please enter the sugar amount');
      return;
    }
    
    const sugar = parseFloat(sugarAmount);
    if (isNaN(sugar) || sugar < 0) {
      Alert.alert('Error', 'Please enter a valid sugar amount');
      return;
    }
    
    const newFood = {
      id: generateFoodId(),
      name,
      brand: brand || undefined,
      sugarPerServing: sugar,
      servingSize: servingSize || '1 serving',
      hiddenSugars: [],
      timestamp: Date.now(),
      mealType,
      calories: calories ? parseInt(calories) : undefined,
    };
    
    addFood(newFood);
    router.push('/');
  };
  
  const renderMealTypeButton = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack', label: string) => {
    const isSelected = mealType === type;
    
    return (
      <TouchableOpacity
        style={[
          styles.mealTypeButton,
          isSelected && { backgroundColor: Colors.primary }
        ]}
        onPress={() => setMealType(type)}
      >
        <Text
          style={[
            styles.mealTypeButtonText,
            isSelected && { color: 'white' }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Add Food Manually',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave}
              style={styles.headerButton}
              disabled={!name || !sugarAmount}
            >
              <Check size={24} color={name && sugarAmount ? Colors.primary : Colors.border} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Food Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Apple, Yogurt, Sandwich"
              placeholderTextColor={Colors.subtext}
            />
            
            <Text style={styles.label}>Brand (optional)</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g. Chobani, Kellogg's"
              placeholderTextColor={Colors.subtext}
            />
            
            <Text style={styles.label}>Sugar Amount (g) *</Text>
            <TextInput
              style={styles.input}
              value={sugarAmount}
              onChangeText={setSugarAmount}
              placeholder="e.g. 12"
              placeholderTextColor={Colors.subtext}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Serving Size</Text>
            <TextInput
              style={styles.input}
              value={servingSize}
              onChangeText={setServingSize}
              placeholder="e.g. 1 cup, 100g, 1 piece"
              placeholderTextColor={Colors.subtext}
            />
            
            <Text style={styles.label}>Calories (optional)</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g. 150"
              placeholderTextColor={Colors.subtext}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {renderMealTypeButton('breakfast', 'Breakfast')}
              {renderMealTypeButton('lunch', 'Lunch')}
              {renderMealTypeButton('dinner', 'Dinner')}
              {renderMealTypeButton('snack', 'Snack')}
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                * Required fields
              </Text>
              <Text style={styles.infoText}>
                If you're unsure about the exact sugar content, check the nutrition label 
                or make your best estimate.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!name || !sugarAmount) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!name || !sugarAmount}
            >
              <Text style={styles.saveButtonText}>Save Food</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 16,
  },
  mealTypeButton: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  infoContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.border,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});