import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface DateSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ currentDate, onDateChange }: DateSelectorProps) {
  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateToCheck.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate <= today) {
      onDateChange(newDate);
    }
  };
  
  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.arrowButton} 
        onPress={goToPreviousDay}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <ChevronLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
      
      <TouchableOpacity 
        style={[styles.arrowButton, isToday() && styles.disabledButton]} 
        onPress={goToNextDay}
        disabled={isToday()}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <ChevronRight size={24} color={isToday() ? Colors.border : Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  arrowButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  }
});