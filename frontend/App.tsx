import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';
import routes from './src/config/routes';
import SplashScreen from './pages/SplashScreen';
import TabScreen from './pages/TabScreen';
import { UserProvider } from './contexts/user-context';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'SplashScreen'} screenOptions={{headerShown: false}}>
          <Stack.Screen name='SplashScreen' component={SplashScreen}></Stack.Screen>
          {routes.map((r, i) =>(
              <Stack.Screen key={i} name={r.name}>
                {(props) => <r.component nameProp={r.name} {...props} />} 

              </Stack.Screen>

            ))}
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
    );
};

export default App;