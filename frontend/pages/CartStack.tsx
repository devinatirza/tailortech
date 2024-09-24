import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CartScreen from './Cartt';
import OrderPaymentScreen from './OrderPayment';
import { IProduct } from '../interfaces/product-interfaces';

export type CartStackParamList = {
  Cart: undefined;
  OrderPayment: {
    TotalPrice: number,
    Products:  IProduct[],
  };
  OrderSent: undefined;
};

const Stack = createStackNavigator<CartStackParamList>();

const CartStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Cart">
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
      />
      <Stack.Screen 
        name="OrderPayment" 
        component={OrderPaymentScreen}
      />
    </Stack.Navigator>
  );
};

export default CartStack;
