import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { HiddenSugarType } from '@/constants/hiddenSugarTypes';
import { AlertTriangle, Info, X } from 'lucide-react-native';

interface HiddenSugarAlertProps {
  hiddenSugars: HiddenSugarType[];
  onDismiss?: () => void;
  showDetails?: boolean;
}

export default function HiddenSugarAlert({ 
  hiddenSugars, 
  onDismiss, 
  showDetails = false 
}: HiddenSugarAlertProps) {
  if (hiddenSugars.length === 0) return null;
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return Colors.danger;
      case 'medium': return Colors.warning;
      case 'low': return Colors.success;
      default: return Colors.subtext;
    }
  };
  
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      case 'low': return 'Low Risk';
      default: return '';
    }
  };
  
  const highRiskCount = hiddenSugars.filter(s => s.severity === 'high').length;
  const mediumRiskCount = hiddenSugars.filter(s => s.severity === 'medium').length;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AlertTriangle size={20} color={Colors.danger} />
          <Text style={styles.title}>Hidden Sugars Detected</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <X size={18} color={Colors.subtext} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.summary}>
        Found {hiddenSugars.length} hidden sugar{hiddenSugars.length > 1 ? 's' : ''}
        {highRiskCount > 0 && ` (${highRiskCount} high risk)`}
        {mediumRiskCount > 0 && ` (${mediumRiskCount} medium risk)`}
      </Text>
      
      {showDetails && (
        <View style={styles.detailsContainer}>
          {hiddenSugars.map((sugar, index) => (
            <View key={index} style={styles.sugarItem}>
              <View style={styles.sugarHeader}>
                <Text style={styles.sugarName}>{sugar.name}</Text>
                <View style={[
                  styles.severityBadge, 
                  { backgroundColor: getSeverityColor(sugar.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {getSeverityText(sugar.severity)}
                  </Text>
                </View>
              </View>
              <Text style={styles.sugarDescription}>{sugar.description}</Text>
              <Text style={styles.commonIn}>
                Common in: {sugar.commonIn.join(', ')}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <Info size={16} color={Colors.primary} />
        <Text style={styles.infoText}>
          Hidden sugars can contribute significantly to your daily intake without you realizing it.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  dismissButton: {
    padding: 4,
  },
  summary: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 8,
  },
  sugarItem: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  sugarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sugarName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  sugarDescription: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 4,
  },
  commonIn: {
    fontSize: 11,
    color: Colors.subtext,
    fontStyle: 'italic',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 6,
  },
  infoText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 6,
    flex: 1,
  }
});