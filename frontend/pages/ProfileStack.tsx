import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';
import ProfileScreen from './Profile';
import UpdateProfileScreen from './UpdateProfile';
import FAQsScreen from './FAQs';
import CouponCodeScreen from './CouponCode';
import CouponRedeemScreen from './CouponRedeem';

export type ProfileStackParamList = {
  Profile: undefined;
  UpdateProfile: undefined;
  FAQs: undefined;
  CouponCode: undefined;
  CouponRedeem: undefined;
  Role: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

const ProfileStack = () => {
  
  return (
    <Stack.Navigator initialRouteName={'Profile'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Profile' component={ProfileScreen}></Stack.Screen>
        <Stack.Screen name='UpdateProfile' component={UpdateProfileScreen}></Stack.Screen>
        <Stack.Screen name='CouponCode' component={CouponCodeScreen}></Stack.Screen>  
        <Stack.Screen name='CouponRedeem' component={CouponRedeemScreen}></Stack.Screen>  
        <Stack.Screen name='FAQs' component={FAQsScreen}></Stack.Screen>  
    </Stack.Navigator>
    );
};

export default ProfileStack;