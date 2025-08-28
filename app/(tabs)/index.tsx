import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { DesignSystem, PremiumColors } from '@/constants/designSystem';
import { Camera, BarChart, Receipt, Users, Settings, Scan, Zap } from 'lucide-react-native';
import { useTourStore } from '@/store/tourStore';
import { useFoodLogStore } from '@/store/foodLogStore';
import OnboardingTour from '@/components/OnboardingTour';
import SugarProgressBar from '@/components/SugarProgressBar';
import EnterpriseCard from '@/components/ui/EnterpriseCard';
import EnterpriseButton from '@/components/ui/EnterpriseButton';

const { width } = Dimensions.get('window');

export default function TabsIndex() {
  const router = useRouter();
  const { showTour, initializeTour, completeTour } = useTourStore();
  const { todaysTotalSugar, isLoading } = useFoodLogStore();
  
  useEffect(() => {
    console.log('TabsIndex component mounted, initializing tour...');
    const initTour = async () => {
      try {
        await initializeTour();
        console.log('Tour initialization completed in TabsIndex');
      } catch (error) {
        console.error('Error initializing tour in TabsIndex:', error);
      }
    };
    
    initTour();
  }, [initializeTour]);
  
  const handleTourComplete = () => {
    console.log('Tour completed from home screen');
    completeTour();
  };
  
  const handleTourSkip = () => {
    console.log('Tour skipped from home screen');
    completeTour();
  };
  
  const menuItems = [
    { 
      title: 'Food Log', 
      icon: Camera, 
      route: '/log', 
      description: 'Track your daily food intake',
      gradient: Colors.gradientPrimary,
      featured: true
    },
    { 
      title: 'Scanner', 
      icon: Scan, 
      route: '/scanner', 
      description: 'Scan food items and barcodes',
      gradient: Colors.gradientSecondary,
      featured: true
    },
    { 
      title: 'Insights', 
      icon: BarChart, 
      route: '/insights', 
      description: 'View your sugar consumption analytics',
      gradient: Colors.gradientSuccess
    },
    { 
      title: 'Shopping', 
      icon: Receipt, 
      route: '/shopping', 
      description: 'Smart shopping assistance',
      gradient: Colors.gradientDanger
    },
    { 
      title: 'Community', 
      icon: Users, 
      route: '/community', 
      description: 'Connect with others',
      gradient: ['#8B5CF6', '#EC4899'] as const
    },
    { 
      title: 'Settings', 
      icon: Settings, 
      route: '/settings', 
      description: 'App preferences and account',
      gradient: ['#6B7280', '#374151'] as const
    },
  ];
  
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={PremiumColors.background.primary} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Logo Only */}
        <View style={styles.heroContainer}>
          <View style={styles.logoHero}>
            <Image
              source={{ uri: 'https://r2-pub.rork.com/attachments/hoc92s8e3ut1pf75jyxn7' }}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
        </View>
        
        {/* Sugar Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Today's Sugar Intake</Text>
          {!isLoading && (
            <SugarProgressBar 
              currentSugar={todaysTotalSugar}
              showLabel={true}
              height={16}
            />
          )}
        </View>
        
        {/* Premium Quick Actions */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.featuredGrid}>
            {menuItems.filter(item => item.featured).map((item, index) => {
              const IconComponent = item.icon;
              return (
                <EnterpriseCard
                  key={index}
                  variant="gradient"
                  gradientColors={item.gradient as readonly [string, string, ...string[]]}
                  shadow="lg"
                  style={styles.featuredCard}
                >
                  <TouchableOpacity
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.8}
                    style={styles.featuredContent}
                  >
                    <View style={styles.featuredIconContainer}>
                      <View style={styles.featuredIcon}>
                        <IconComponent size={32} color="white" />
                      </View>
                      <View style={styles.featuredBadge}>
                        <Zap size={12} color={PremiumColors.semantic.warning} />
                      </View>
                    </View>
                    <Text style={styles.featuredTitle}>{item.title}</Text>
                    <Text style={styles.featuredDescription}>{item.description}</Text>
                    <EnterpriseButton
                      title="Launch"
                      onPress={() => router.push(item.route as any)}
                      variant="ghost"
                      size="sm"
                      style={styles.launchButton}
                    />
                  </TouchableOpacity>
                </EnterpriseCard>
              );
            })}
          </View>
        </View>
        
        {/* Enterprise Feature Grid */}
        <View style={styles.allFeaturesSection}>
          <Text style={styles.sectionTitle}>All Features</Text>
          <View style={styles.menuGrid}>
            {menuItems.filter(item => !item.featured).map((item, index) => {
              const IconComponent = item.icon;
              return (
                <EnterpriseCard
                  key={index}
                  variant="elevated"
                  shadow="md"
                  style={styles.menuCard}
                >
                  <TouchableOpacity
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.8}
                    style={styles.menuContent}
                  >
                    <View style={styles.menuIconContainer}>
                      <LinearGradient
                        colors={item.gradient as readonly [string, string, ...string[]]}
                        style={styles.menuIconGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <IconComponent size={24} color="white" />
                      </LinearGradient>
                    </View>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </TouchableOpacity>
                </EnterpriseCard>
              );
            })}
          </View>
        </View>
        
        <OnboardingTour
          visible={showTour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PremiumColors.background.primary,
  },
  
  // Hero Section - Logo Only
  heroContainer: {
    marginTop: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  logoHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.xl,
  },
  heroLogo: {
    width: 320,
    height: 180,
  },
  
  // Progress Section
  progressSection: {
    padding: DesignSystem.spacing.lg,
    paddingTop: 0,
    paddingBottom: DesignSystem.spacing.xl,
  },
  progressTitle: {
    ...DesignSystem.typography.h3,
    color: PremiumColors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  
  // Featured Section
  featuredSection: {
    padding: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...DesignSystem.typography.h2,
    color: PremiumColors.text.primary,
    marginBottom: DesignSystem.spacing.lg,
  },
  featuredGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  featuredCard: {
    flex: 1,
  },
  featuredContent: {
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'space-between',
  },
  featuredIconContainer: {
    position: 'relative',
    marginBottom: DesignSystem.spacing.md,
  },
  featuredIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PremiumColors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PremiumColors.semantic.warning,
  },
  featuredTitle: {
    ...DesignSystem.typography.h4,
    color: 'white',
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  featuredDescription: {
    ...DesignSystem.typography.body2,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  launchButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  
  // All Features Section
  allFeaturesSection: {
    padding: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.sm,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  menuCard: {
    width: (width - (DesignSystem.spacing.lg * 2) - DesignSystem.spacing.md) / 2,
  },
  menuContent: {
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  menuIconContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  menuIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    ...DesignSystem.typography.body1,
    fontWeight: '700',
    color: PremiumColors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  menuDescription: {
    ...DesignSystem.typography.caption,
    color: PremiumColors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});