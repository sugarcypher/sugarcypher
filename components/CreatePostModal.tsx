import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  X, 
  Trophy, 
  Target, 
  MessageCircle, 
  Award,
  Tag,
  Image as ImageIcon
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCommunityStore } from '@/store/communityStore';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

const PostTypes = [
  { key: 'success', label: 'Success Story', icon: Trophy, color: '#4CAF50' },
  { key: 'tip', label: 'Pro Tip', icon: Target, color: '#2196F3' },
  { key: 'challenge', label: 'Need Help', icon: MessageCircle, color: '#FF9800' },
  { key: 'milestone', label: 'Milestone', icon: Award, color: '#9C27B0' }
];

const SuggestedTags = [
  'streak', 'milestone', 'energy', 'tips', 'hidden-sugars', 'shopping',
  'cravings', 'help', 'afternoon', 'breakfast', 'lunch', 'dinner',
  'snacks', 'meal-prep', 'motivation', 'progress', 'health'
];

export default function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const { createPost } = useCommunityStore();
  
  const [selectedType, setSelectedType] = useState<string>('success');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>('');
  const [beforeAmount, setBeforeAmount] = useState<string>('');
  const [afterAmount, setAfterAmount] = useState<string>('');
  const [period, setPeriod] = useState<string>('');
  const [showSugarData, setShowSugarData] = useState<boolean>(false);

  const resetForm = () => {
    setSelectedType('success');
    setTitle('');
    setContent('');
    setTags([]);
    setCustomTag('');
    setBeforeAmount('');
    setAfterAmount('');
    setPeriod('');
    setShowSugarData(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setCustomTag('');
    }
  };

  const handleCreatePost = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    const postData: any = {
      type: selectedType as any,
      title: title.trim(),
      content: content.trim(),
      tags
    };

    if (showSugarData && beforeAmount && afterAmount && period) {
      postData.sugarData = {
        beforeAmount: parseFloat(beforeAmount),
        afterAmount: parseFloat(afterAmount),
        period: period.trim()
      };
    }

    createPost(postData);
    handleClose();
    Alert.alert('Success', 'Your post has been shared with the community!');
  };

  const renderPostTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Post Type</Text>
      <View style={styles.postTypeGrid}>
        {PostTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = selectedType === type.key;
          
          return (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.postTypeCard,
                isSelected && { borderColor: type.color, backgroundColor: type.color + '10' }
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <IconComponent 
                size={24} 
                color={isSelected ? type.color : Colors.subtext} 
              />
              <Text style={[
                styles.postTypeLabel,
                isSelected && { color: type.color }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSugarDataSection = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setShowSugarData(!showSugarData)}
      >
        <Text style={styles.sectionTitle}>Include Sugar Data</Text>
        <View style={[styles.toggle, showSugarData && styles.toggleActive]}>
          {showSugarData && <View style={styles.toggleIndicator} />}
        </View>
      </TouchableOpacity>
      
      {showSugarData && (
        <View style={styles.sugarDataForm}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Before (g)</Text>
              <TextInput
                style={styles.textInput}
                value={beforeAmount}
                onChangeText={setBeforeAmount}
                placeholder="65"
                placeholderTextColor={Colors.subtext}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>After (g)</Text>
              <TextInput
                style={styles.textInput}
                value={afterAmount}
                onChangeText={setAfterAmount}
                placeholder="25"
                placeholderTextColor={Colors.subtext}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time Period</Text>
            <TextInput
              style={styles.textInput}
              value={period}
              onChangeText={setPeriod}
              placeholder="30 days"
              placeholderTextColor={Colors.subtext}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderTagsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tags ({tags.length}/5)</Text>
      
      {tags.length > 0 && (
        <View style={styles.selectedTags}>
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.selectedTag}
              onPress={() => handleRemoveTag(tag)}
            >
              <Text style={styles.selectedTagText}>#{tag}</Text>
              <X size={14} color={Colors.background} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.customTagInput}>
        <TextInput
          style={[styles.textInput, { flex: 1 }]}
          value={customTag}
          onChangeText={setCustomTag}
          placeholder="Add custom tag"
          placeholderTextColor={Colors.subtext}
          onSubmitEditing={handleAddCustomTag}
        />
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={handleAddCustomTag}
          disabled={!customTag.trim() || tags.length >= 5}
        >
          <Tag size={16} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <Text style={styles.suggestedTitle}>Suggested Tags</Text>
      <View style={styles.suggestedTags}>
        {SuggestedTags.filter(tag => !tags.includes(tag)).slice(0, 10).map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestedTag}
            onPress={() => handleAddTag(tag)}
            disabled={tags.length >= 5}
          >
            <Text style={[
              styles.suggestedTagText,
              tags.length >= 5 && { color: Colors.subtext, opacity: 0.5 }
            ]}>
              #{tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Post</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}
        >
          {renderPostTypeSelector()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="What's your story?"
              placeholderTextColor={Colors.subtext}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Share your experience, tips, or ask for help..."
              placeholderTextColor={Colors.subtext}
              multiline
              numberOfLines={6}
              maxLength={500}
            />
            <Text style={styles.charCount}>{content.length}/500</Text>
          </View>

          {(selectedType === 'success' || selectedType === 'milestone') && renderSugarDataSection()}

          {renderTagsSection()}

          <View style={styles.section}>
            <TouchableOpacity style={styles.imageButton} disabled>
              <ImageIcon size={20} color={Colors.subtext} />
              <Text style={styles.imageButtonText}>Add Image (Coming Soon)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!title.trim() || !content.trim()) && styles.createButtonDisabled
            ]}
            onPress={handleCreatePost}
            disabled={!title.trim() || !content.trim()}
          >
            <Text style={styles.createButtonText}>Share Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  postTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  postTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  postTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
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
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'right',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  sugarDataForm: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  selectedTagText: {
    fontSize: 12,
    color: Colors.background,
    fontWeight: '500',
  },
  customTagInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedTag: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestedTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 8,
    opacity: 0.5,
  },
  imageButtonText: {
    fontSize: 14,
    color: Colors.subtext,
  },
  footer: {
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
  createButtonDisabled: {
    backgroundColor: Colors.subtext,
    opacity: 0.5,
  },
  createButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});