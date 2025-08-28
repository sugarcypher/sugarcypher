import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { AlertTriangle, Shield, Info, X } from 'lucide-react-native';
import { useSecurityStore } from '@/store/securityStore';

interface SecurityAlertProps {
  alert: {
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: number;
    dismissed: boolean;
    actionRequired: boolean;
  };
  onDismiss?: () => void;
  onAction?: () => void;
}

export const SecurityAlert: React.FC<SecurityAlertProps> = ({ 
  alert, 
  onDismiss, 
  onAction 
}) => {
  const { dismissAlert } = useSecurityStore();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    // Slide out animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissAlert(alert.id);
      onDismiss?.();
    });
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'error':
        return <AlertTriangle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      case 'info':
        return <Info size={20} color="#3B82F6" />;
      default:
        return <Shield size={20} color="#6B7280" />;
    }
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'error':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          borderLeftColor: '#EF4444'
        };
      case 'warning':
        return {
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
          borderLeftColor: '#F59E0B'
        };
      case 'info':
        return {
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          borderLeftColor: '#3B82F6'
        };
      default:
        return {
          backgroundColor: '#F9FAFB',
          borderColor: '#E5E7EB',
          borderLeftColor: '#6B7280'
        };
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getAlertStyles(),
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getAlertIcon()}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(alert.timestamp)}</Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
            <X size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.message}>{alert.message}</Text>
        
        {alert.actionRequired && onAction && (
          <TouchableOpacity onPress={onAction} style={styles.actionButton}>
            <Text style={styles.actionText}>Take Action</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Security Alert Banner Component (for top-level alerts)
export const SecurityAlertBanner: React.FC = () => {
  const { securityAlerts, securityHealth } = useSecurityStore();
  
  const activeAlerts = securityAlerts.filter((alert: any) => !alert.dismissed);
  const criticalAlerts = activeAlerts.filter((alert: any) => alert.type === 'error');
  
  // Show banner only for critical security issues
  if (securityHealth.status !== 'critical' && criticalAlerts.length === 0) {
    return null;
  }

  const primaryAlert = criticalAlerts[0] || activeAlerts[0];
  
  if (!primaryAlert) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <SecurityAlert 
        alert={primaryAlert}
        onAction={() => {
          // Handle critical security action
          console.log('Critical security action required');
        }}
      />
    </View>
  );
};

// Floating Security Alert Component
export const FloatingSecurityAlert: React.FC<{
  visible: boolean;
  alert: SecurityAlertProps['alert'];
  onDismiss: () => void;
}> = ({ visible, alert, onDismiss }) => {
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <SecurityAlert alert={alert} onDismiss={onDismiss} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 50, // Account for tab bar
  },
});