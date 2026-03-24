import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CaseProvider } from './src/store/caseStore';

import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import CaseManagementScreen from './src/screens/CaseManagementScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ImageAnalysisScreen from './src/screens/ImageAnalysisScreen';
import VideoAnalysisScreen from './src/screens/VideoAnalysisScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import FeatureExtractionScreen from './src/screens/FeatureExtractionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    // @ts-ignore
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(2, 4, 10, 0.9)',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null
        ),
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          letterSpacing: 0.5,
          marginTop: -5,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Image') {
            iconName = focused ? 'image' : 'image-outline';
          } else if (route.name === 'Video') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'Cases') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Image" component={ImageAnalysisScreen} />
      <Tab.Screen name="Video" component={VideoAnalysisScreen} />
      <Tab.Screen name="Cases" component={CaseManagementScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Auth' | 'Main'>('Onboarding');

  // Set to true to force onboarding to show again (resets the flag once, then set back to false)
  const FORCE_ONBOARDING_RESET = true;

  useEffect(() => {
    async function checkOnboarding() {
      try {
        if (FORCE_ONBOARDING_RESET) {
          await AsyncStorage.removeItem('hasSeenIntro');
        }

        const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
        if (hasSeenIntro === 'true') {
          setInitialRoute('Auth');
        }
      } catch (error) {
        console.error('Error reading onboarding status:', error);
      } finally {
        setIsReady(true);
      }
    }

    checkOnboarding();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <CaseProvider>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#02040A' }}>
        <StatusBar style="light" />
        <NavigationContainer>
          {/* @ts-ignore */}
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#02040A' } }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="FeatureExtraction" component={FeatureExtractionScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </CaseProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1117',
  },
});

