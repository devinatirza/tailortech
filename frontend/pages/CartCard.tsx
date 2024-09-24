import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { IProduct } from '../interfaces/product-interfaces';

interface CartCardProps {
  product: IProduct;
  onRemove: (productId: number) => void;
}

const CartCard: React.FC<CartCardProps> = ({ product, onRemove }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.ImgUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.Product}</Text>
        <Text style={styles.productSize}>Size - {product.Size}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.productPrice}>IDR {product.Price}K</Text>
        <TouchableOpacity onPress={() => onRemove(product.ID)}>
          <Image source={require('../assets/delete_icon.png')} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  productImage: {
    width: width * 0.2,
    height: width * 0.23,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: width * 0.05,
    color: '#260101',
    fontWeight: 'bold',
    marginRight: 5,
  },
  productSize: {
    fontSize: 18,
    color: '#260101',
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 18,
    color: '#260101',
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  deleteIcon: {
    width: width * 0.05,
    height: width * 0.06,
    marginTop: 5,
    marginRight: 5,
  },
});

export default CartCard;
