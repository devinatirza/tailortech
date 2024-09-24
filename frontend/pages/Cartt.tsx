import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../contexts/user-context';
import CartCard from './CartCard';
import { ICart } from '../interfaces/product-interfaces';
import { NavigationProp } from '@react-navigation/native';
import { CartStackParamList } from './CartStack';

type Navigation = NavigationProp<CartStackParamList, 'OrderPayment'>;

const CartScreen: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation<Navigation>();
  const [cartItems, setCartItems] = useState<ICart>({ TotalPrice: 0, Products: [] });
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/carts/get-cart/${user.ID}`);
      if (response.data.message === "Your cart is empty") {
        setCartItems({ TotalPrice: 0, Products: [] });
      } else {
        setCartItems(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [])
  );

  const groupItemsByTailor = (items: ICart) => {
    const groupedItems: { [key: string]: ICart['Products'] } = {};

    items.Products?.forEach((item) => {
      if (!groupedItems[item.Tailor]) {
        groupedItems[item.Tailor] = [];
      }
      groupedItems[item.Tailor].push(item);
    });

    return groupedItems;
  };

  const handleRemoveFromCart = async (productId: number) => {
    try {
      await axios.delete(`http://localhost:8000/carts/remove`, {
        data: { userId: user.ID, productId },
      });
      setCartItems((prev) => ({
        TotalPrice: prev.TotalPrice - prev.Products.find((item) => item.ID === productId)?.Price!,
        Products: prev.Products.filter((item) => item.ID !== productId),
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const groupedCartItems = groupItemsByTailor(cartItems);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Cart</Text>
        <View style={styles.cartQuantityCircle}>
          <Text style={styles.cartQuantityText}>{cartItems.Products.length}</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        {Object.keys(groupedCartItems).length > 0 ? (
          Object.keys(groupedCartItems).map((tailor) => (
            <View key={tailor} style={styles.tailorSection}>
              <Text style={styles.tailorName}>{tailor}</Text>
              {groupedCartItems[tailor].map((item) => (
                <CartCard key={item.ID} product={item} onRemove={handleRemoveFromCart} />
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
        )}
      </ScrollView>
      {cartItems.Products.length > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>
              IDR {cartItems.TotalPrice}K
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('OrderPayment', {
              TotalPrice: cartItems.TotalPrice,
              Products: cartItems.Products,
            })}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const { width: deviceWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 30,
    paddingVertical: 28,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 42,
    marginBottom: 20,
  },
  title: {
    fontSize: deviceWidth * 0.1,
    fontWeight: 'bold',
    color: '#260101',
  },
  cartQuantityCircle: {
    marginLeft: 12,
    marginTop: 5,
    backgroundColor: '#D9C3A9',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQuantityText: {
    fontSize: 16,
    color: '#260101',
    fontWeight: 'bold',
  },
  scrollView: {
    marginBottom: 20,
  },
  tailorSection: {
    marginBottom: 20,
  },
  tailorName: {
    fontSize: deviceWidth * 0.065,
    fontWeight: 'bold',
    color: '#260101',
  },
  cartContainer: {
    paddingBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#260101',
    textAlign: 'center',
    marginTop: 50,
  },
  checkoutContainer: {
    paddingHorizontal: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: deviceWidth * 0.055,
    fontWeight: '600',
    color: '#260101',
  },
  totalPrice: {
    fontSize: deviceWidth * 0.06,
    fontWeight: 'bold',
    color: '#260101',
  },
  checkoutButton: {
    backgroundColor: '#D9C3A9',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 70,
    alignSelf: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    fontSize: deviceWidth * 0.05,
    color: '#260101',
    fontWeight: 'bold',
  },
});

export default CartScreen;
