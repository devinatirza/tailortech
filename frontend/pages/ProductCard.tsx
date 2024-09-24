import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { IProduct } from '../interfaces/product-interfaces';
import { useUser } from '../contexts/user-context';

const ProductCard: React.FC<{ product: IProduct }> = ({ product }) => {
  const itemWidth = Dimensions.get('window').width / 2 - 40;
  const { user } = useUser();

  const handleAddToCart = async () => {
    if (!user || !user.ID || !product.ID) {
      console.log('Invalid user or product ID');
      return;
    }

    try {
      await axios.post('http://localhost:8000/carts/add-to-cart', {
        UserID: user.ID,
        ProductID: product.ID
      });
    } catch (error) {
      console.log('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user || !user.ID || !product.ID) {
      console.log('Invalid user or product ID');
      return;
    }

    try {
      await axios.post('http://localhost:8000/wishlists/add-to-wishlist', {
        user_id: user.ID,
        product_id: product.ID
      });
    } catch (error) {
      console.log('Error adding to wishlist:', error);
    }
  };

  return (
    <View style={[styles.productItem, { width: itemWidth }]}>
      <Image source={{ uri: product.ImgUrl }} style={styles.productImage} />
      <TouchableOpacity style={styles.plusIconContainer} onPress={handleAddToCart} activeOpacity={0.6}>
        <Image source={require('../assets/sale_icon.png')} style={styles.plusIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.favIconContainer} onPress={handleAddToWishlist} activeOpacity={0.6}>
        <Image source={require('../assets/fav_icon.png')} style={styles.favIcon} />
      </TouchableOpacity>
      <Text style={styles.productName}>{product.Product}</Text>
      <Text style={styles.tailorName}>{product.Tailor}</Text>
      <Text style={styles.productDesc}>{product.Desc}</Text>
      <Text style={styles.productSize}>Size {product.Size}</Text>
      <Text style={styles.productPrice}>IDR {product.Price}K</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  productItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    paddingVertical: 10,
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  favIconContainer: {
    position: 'absolute',
    top: 40,
    right: 3,
  },
  favIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  plusIconContainer: {
    position: 'absolute',
    top: 6,
    right: 5.5,
  },
  plusIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  productName: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#260101',
  },
  tailorName: {
    fontSize: 16,
    textAlign: 'center',
    color: '#593825',
    fontWeight: '600',
    marginTop: 2,
  },
  productDesc: {
    marginTop: 2,
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 11,
  },
  productSize: {
    marginTop: 2,
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 5,
    color: '#260101',
    fontWeight: '600',
  },
  productPrice: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#260101',
  },
});

export default ProductCard;
