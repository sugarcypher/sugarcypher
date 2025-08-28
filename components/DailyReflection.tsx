import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Colors from '@/constants/colors';
import { Heart, Zap, Brain, X } from 'lucide-react-native';

interface ReflectionData {
  date: string;
  energyLevel: number; // 1-5
  moodLevel: number; // 1-5
  cravings: number; // 1-5
  notes: string;
}

interface DailyReflectionProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reflection: ReflectionData) => void;
  currentReflection?: ReflectionData;
}

export default function DailyReflection({ 
  visible, 
  onClose, 
  onSave, 
  currentReflection 
}: DailyReflectionProps) {
  const [energyLevel, setEnergyLevel] = useState(currentReflection?.energyLevel || 3);
  const [moodLevel, setMoodLevel] = useState(currentReflection?.moodLevel || 3);
  const [cravings, setCravings] = useState(currentReflection?.cravings || 3);
  const [notes, setNotes] = useState(currentReflection?.notes || '');
  
  const handleSave = () => {
    const reflection: ReflectionData = {
      date: new Date().toISOString().split('T')[0],
      energyLevel,
      moodLevel,
      cravings,
      notes
    };
    
    onSave(reflection);
    onClose();
  };
  
  const renderRatingScale = (
    title: string,
    icon: React.ReactNode,
    value: number,
    onChange: (value: number) => void,
    labels: string[]
  ) => {
    return (
      <View style={styles.ratingContainer}>
        <View style={styles.ratingHeader}>
          {icon}
          <Text style={styles.ratingTitle}>{title}</Text>
        </View>
        
        <View style={styles.scaleContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                value === rating && styles.ratingButtonActive
              ]}
              onPress={() => onChange(rating)}
            >
              <Text style={[
                styles.ratingButtonText,
                value === rating && styles.ratingButtonTextActive
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.ratingLabel}>
          {labels[value - 1]}
        </Text>
      </View>
    );
  };
  
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Daily Reflection</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
          <Text style={styles.subtitle}>
            How are you feeling today? This helps track patterns between your sugar intake and wellbeing.
          </Text>
          
          {renderRatingScale(
            "Energy Level",
            <Zap size={20} color={Colors.primary} />,
            energyLevel,
            setEnergyLevel,
            ["Very Low", "Low", "Moderate", "High", "Very High"]
          )}
          
          {renderRatingScale(
            "Mood",
            <Heart size={20} color={Colors.primary} />,
            moodLevel,
            setMoodLevel,
            ["Very Poor", "Poor", "Neutral", "Good", "Excellent"]
          )}
          
          {renderRatingScale(
            "Sugar Cravings",
            <Brain size={20} color={Colors.primary} />,
            cravings,
            setCravings,
            ["None", "Mild", "Moderate", "Strong", "Intense"]
          )}
          
          <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Additional Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did you feel after meals? Any observations about your sugar intake today?"
              placeholderTextColor={Colors.subtext}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Reflection</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 24,
    lineHeight: 22,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: Colors.primary,
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.subtext,
  },
  ratingButtonTextActive: {
    color: 'white',
  },
  ratingLabel: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});