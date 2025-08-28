import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useFoodLogStore } from '@/store/foodLogStore';
import { getSugarSeverity } from '@/constants/sugarLimits';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react-native';

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { todaysFoods, removeFood } = useFoodLogStore();
  const food = todaysFoods.find(f => f.id === id);
  
  if (!food) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Food not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const severity = getSugarSeverity(food.sugarPerServing);
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Food",
      "Are you sure you want to remove this food from your log?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            removeFood(food.id);
            router.back();
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: food.name,
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
              onPress={handleDelete}
              style={styles.headerButton}
            >
              <Trash2 size={24} color={Colors.danger} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          {food.imageUri ? (
            <Image 
              source={{ uri: food.imageUri }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: Colors.border }]}>
              <Text style={styles.placeholderText}>{food.name?.charAt(0) || '?'}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{food.name || 'Unknown Food'}</Text>
          {food.brand && <Text style={styles.brand}>{food.brand}</Text>}
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Logged at:</Text>
            <Text style={styles.timeValue}>{formatTime(food.timestamp)}</Text>
          </View>
          
          <View style={styles.mealTypeContainer}>
            <Text style={styles.mealTypeLabel}>Meal:</Text>
            <Text style={styles.mealTypeValue}>
              {food.mealType?.charAt(0).toUpperCase() + food.mealType?.slice(1) || 'Unknown'}
            </Text>
          </View>
        </View>
        
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Sugar</Text>
            <Text style={[styles.nutritionValue, { color: severity.color }]}>
              {food.sugarPerServing}g
            </Text>
          </View>
          
          {food.calories !== undefined && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>{food.calories}</Text>
            </View>
          )}
          
          {food.carbs !== undefined && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Carbohydrates</Text>
              <Text style={styles.nutritionValue}>{food.carbs}g</Text>
            </View>
          )}
          
          {food.protein !== undefined && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>{food.protein}g</Text>
            </View>
          )}
          
          {food.fat !== undefined && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>{food.fat}g</Text>
            </View>
          )}
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Serving Size</Text>
            <Text style={styles.nutritionValue}>{food.servingSize}</Text>
          </View>
        </View>
        
        {food.hiddenSugars && food.hiddenSugars.length > 0 && (
          <View style={styles.hiddenSugarsContainer}>
            <View style={styles.hiddenSugarsHeader}>
              <AlertTriangle size={20} color={Colors.warning} />
              <Text style={styles.hiddenSugarsTitle}>Hidden Sugars Detected</Text>
            </View>
            
            <Text style={styles.hiddenSugarsDescription}>
              This product contains the following hidden sugar types:
            </Text>
            
            {food.hiddenSugars.map((sugar, index) => (
              <View key={index} style={styles.sugarItem}>
                <View style={styles.sugarBullet} />
                <Text style={styles.sugarName}>{sugar}</Text>
              </View>
            ))}
            
            <Text style={styles.hiddenSugarsInfo}>
              Hidden sugars can contribute to excessive sugar consumption without you realizing it.
            </Text>
          </View>
        )}
        
        {food.barcode && (
          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeLabel}>Barcode:</Text>
            <Text style={styles.barcodeValue}>{food.barcode}</Text>
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: Colors.card,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  brand: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.subtext,
    width: 80,
  },
  timeValue: {
    fontSize: 14,
    color: Colors.text,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  mealTypeLabel: {
    fontSize: 14,
    color: Colors.subtext,
    width: 80,
  },
  mealTypeValue: {
    fontSize: 14,
    color: Colors.text,
  },
  nutritionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nutritionLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  hiddenSugarsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.card,
  },
  hiddenSugarsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hiddenSugarsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 8,
  },
  hiddenSugarsDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  sugarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sugarBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sugar,
    marginRight: 8,
  },
  sugarName: {
    fontSize: 14,
    color: Colors.text,
  },
  hiddenSugarsInfo: {
    fontSize: 14,
    color: Colors.subtext,
    fontStyle: 'italic',
    marginTop: 12,
  },
  barcodeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.card,
    flexDirection: 'row',
  },
  barcodeLabel: {
    fontSize: 16,
    color: Colors.text,
    marginRight: 8,
  },
  barcodeValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  footer: {
    height: 40,
  }
});