import React from 'react';
import { Image, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp, useNavigation } from '@react-navigation/native';
import HomeStack from './HomeStack'; 
import OrderScreen from './Order';
import ProfileStack from './ProfileStack'; 
import CartScreen from './Cartt';
import { ParamListBase } from '@react-navigation/routers';
import CartStack from './CartStack';

const Tab = createBottomTabNavigator();

type Props = {
  route: RouteProp<ParamListBase, string>;
};

const HomeIconActive = ({ color }: { color: string }) => (
  <Image source={require('../assets/home_icon.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const HomeIconInactive = ({ color }: { color: string }) => (
  <Image source={require('../assets/home_icon_inactive_9.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const CartIconActive = ({ color }: { color: string }) => (
  <Image source={require('../assets/cart_icon.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const CartIconInactive = ({ color }: { color: string }) => (
  <Image source={require('../assets/cart_icon_inactive_9.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const OrderIconActive = ({ color }: { color: string }) => (
  <Image source={require('../assets/order_icon.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const OrderIconInactive = ({ color }: { color: string }) => (
  <Image source={require('../assets/order_icon_inactive_9.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const ProfileIconActive = ({ color }: { color: string }) => (
  <Image source={require('../assets/profile_icon.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const ProfileIconInactive = ({ color }: { color: string }) => (
  <Image source={require('../assets/profile_icon_inactive_9.png')} style={{ width: 32, height: 32, tintColor: color }} />
);

const TabNavigation = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }: Props) => ({
        tabBarActiveTintColor: '#260101',
        tabBarInactiveTintColor: '#260101',
        headerShown: false,
        tabBarShowLabel: false,
        headerTitle: () => null,
        headerBackImage: (
          <Image source={require('../assets/back_icon.png')} style={{ width: 24, height: 24 }} />
        ),
        headerBackTitleVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => navigation.goBack()}>
            <Image source={require('../assets/back_icon.png')} style={{ width: 24, height: 24 }} />
          </Pressable>
        ),
        tabBarIcon: ({ color, focused }) => {
          if (route.name === 'HomeTab') {
            return focused ? <HomeIconActive color={color} /> : <HomeIconInactive color={color} />;
          } else if (route.name === 'CartTab') {
            return focused ? <CartIconActive color={color} /> : <CartIconInactive color={color} />;
          } else if (route.name === 'Order') {
            return focused ? <OrderIconActive color={color} /> : <OrderIconInactive color={color} />;
          } else if (route.name === 'ProfileTab') {
            return focused ? <ProfileIconActive color={color} /> : <ProfileIconInactive color={color} />;
          }
          return null;
        },
        tabBarStyle: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarPressOpacity: 1, 
        tabBarIconStyle: { width: 32, height: 32 }, 
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="CartTab" component={CartStack} />
      <Tab.Screen name="Order" component={OrderScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default TabNavigation;
