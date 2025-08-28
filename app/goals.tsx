import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  Trophy,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  X
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCommunityStore } from '@/store/communityStore';
import { Goal, GoalType } from '@/types/community';

const GoalTypes: { key: GoalType; label: string; description: string; unit: string }[] = [
  {
    key: 'daily_sugar_limit',
    label: 'Daily Sugar Limit',
    description: 'Set a maximum daily sugar intake goal',
    unit: 'grams'
  },
  {
    key: 'weekly_average',
    label: 'Weekly Average',
    description: 'Target weekly average sugar consumption',
    unit: 'grams'
  },
  {
    key: 'streak',
    label: 'Streak Goal',
    description: 'Maintain consecutive days under your limit',
    unit: 'days'
  },
  {
    key: 'custom',
    label: 'Custom Goal',
    description: 'Create your own personalized goal',
    unit: 'custom'
  }
];

export default function GoalsScreen() {
  const {
    goals,
    activeGoals,
    currentUser,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress
  } = useCommunityStore();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedGoalType, setSelectedGoalType] = useState<GoalType>('daily_sugar_limit');
  const [goalTitle, setGoalTitle] = useState<string>('');
  const [goalDescription, setGoalDescription] = useState<string>('');
  const [targetValue, setTargetValue] = useState<string>('');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>('');

  const resetForm = () => {
    setGoalTitle('');
    setGoalDescription('');
    setTargetValue('');
    setCustomUnit('');
    setIsPublic(false);
    setEndDate('');
    setSelectedGoalType('daily_sugar_limit');
  };

  const handleCreateGoal = () => {
    if (!goalTitle.trim() || !targetValue.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const selectedType = GoalTypes.find(type => type.key === selectedGoalType);
    const unit = selectedGoalType === 'custom' ? customUnit : selectedType?.unit || '';

    const newGoal = {
      title: goalTitle.trim(),
      description: goalDescription.trim(),
      type: selectedGoalType,
      targetValue: parseFloat(targetValue),
      unit,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate || undefined,
      isActive: true,
      isPublic,
      milestones: []
    };

    createGoal(newGoal);
    resetForm();
    setShowCreateModal(false);
  };

  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goalTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteGoal(goalId)
        }
      ]
    );
  };

  const toggleGoalActive = (goal: Goal) => {
    updateGoal(goal.id, { isActive: !goal.isActive });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 1) return '#4CAF50';
    if (progress >= 0.7) return '#FF9800';
    return Colors.primary;
  };

  const renderGoalCard = (goal: Goal) => {
    const progressPercentage = Math.round(goal.progress * 100);
    const progressColor = getProgressColor(goal.progress);

    return (
      <View key={goal.id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalDescription}>{goal.description}</Text>
            <View style={styles.goalMeta}>
              <Text style={styles.goalType}>
                {GoalTypes.find(type => type.key === goal.type)?.label}
              </Text>
              {goal.isPublic && (
                <View style={styles.publicBadge}>
                  <Text style={styles.publicBadgeText}>Public</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.goalActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleGoalActive(goal)}
            >
              {goal.isActive ? (
                <CheckCircle size={20} color={Colors.primary} />
              ) : (
                <Circle size={20} color={Colors.subtext} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteGoal(goal.id, goal.title)}
            >
              <Trash2 size={18} color={Colors.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </Text>
            <Text style={[styles.progressPercentage, { color: progressColor }]}>
              {progressPercentage}%
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: progressColor
                }
              ]} 
            />
          </View>
        </View>

        {goal.endDate && (
          <View style={styles.goalFooter}>
            <Calendar size={14} color={Colors.subtext} />
            <Text style={styles.endDate}>
              Ends: {new Date(goal.endDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Goal</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalContentContainer}
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Goal Type</Text>
            <View style={styles.goalTypeGrid}>
              {GoalTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.goalTypeCard,
                    selectedGoalType === type.key && styles.goalTypeCardSelected
                  ]}
                  onPress={() => setSelectedGoalType(type.key)}
                >
                  <Text style={[
                    styles.goalTypeLabel,
                    selectedGoalType === type.key && styles.goalTypeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.goalTypeDescription,
                    selectedGoalType === type.key && styles.goalTypeDescriptionSelected
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Goal Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholder="Enter goal title"
                placeholderTextColor={Colors.subtext}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={goalDescription}
                onChangeText={setGoalDescription}
                placeholder="Describe your goal"
                placeholderTextColor={Colors.subtext}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Value *</Text>
                <TextInput
                  style={styles.textInput}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="0"
                  placeholderTextColor={Colors.subtext}
                  keyboardType="numeric"
                />
              </View>

              {selectedGoalType === 'custom' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customUnit}
                    onChangeText={setCustomUnit}
                    placeholder="unit"
                    placeholderTextColor={Colors.subtext}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>End Date (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.subtext}
              />
            </View>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsPublic(!isPublic)}
            >
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Make Public</Text>
                <Text style={styles.toggleDescription}>
                  Share this goal with the community
                </Text>
              </View>
              <View style={[styles.toggle, isPublic && styles.toggleActive]}>
                {isPublic && <View style={styles.toggleIndicator} />}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateGoal}
          >
            <Text style={styles.createButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Goals',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color={Colors.text} />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Trophy size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{activeGoals.length}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </View>
          
          <View style={styles.statCard}>
            <Target size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>
              {activeGoals.filter(g => g.progress >= 1).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>
              {Math.round(
                activeGoals.reduce((sum, g) => sum + g.progress, 0) / 
                Math.max(activeGoals.length, 1) * 100
              )}%
            </Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
        </View>

        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          {activeGoals.length > 0 ? (
            activeGoals.map(renderGoalCard)
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color={Colors.subtext} />
              <Text style={styles.emptyTitle}>No Active Goals</Text>
              <Text style={styles.emptyDescription}>
                Create your first goal to start tracking your progress
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={20} color={Colors.background} />
                <Text style={styles.emptyButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          )}

          {goals.filter(g => !g.isActive).length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
                Inactive Goals
              </Text>
              {goals.filter(g => !g.isActive).map(renderGoalCard)}
            </>
          )}
        </View>
      </ScrollView>

      {renderCreateModal()}
    </View>
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
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  goalsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 8,
    lineHeight: 20,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  publicBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  publicBadgeText: {
    fontSize: 10,
    color: Colors.background,
    fontWeight: '600',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  endDate: {
    fontSize: 12,
    color: Colors.subtext,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: Colors.background,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  formSection: {
    marginBottom: 24,
  },
  goalTypeGrid: {
    gap: 12,
  },
  goalTypeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  goalTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  goalTypeLabelSelected: {
    color: Colors.primary,
  },
  goalTypeDescription: {
    fontSize: 14,
    color: Colors.subtext,
    lineHeight: 20,
  },
  goalTypeDescriptionSelected: {
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: Colors.subtext,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.background,
    alignSelf: 'flex-end',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});