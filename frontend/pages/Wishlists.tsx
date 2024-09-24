import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { IProduct } from '../interfaces/product-interfaces';
import { useUser } from '../contexts/user-context';
import BackButton from '../components/back-button';

const WishlistScreen: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<IProduct[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const { user } = useUser();

  async function fetchWishlistProducts() {
    if (!user || !user.ID) {
      console.log('User is not logged in or user ID is missing');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/wishlists/${user.ID}`);
      setWishlistProducts(response.data);
    } catch (error) {
      console.log('Error fetching wishlist products:', error);
    }
  }

  const handleAddToCart = async (productID: number) => {
    if (!user || !user.ID || !productID) {
      console.log('Invalid user or product ID');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/carts/add-to-cart', {
        user_id: user.ID,
        product_id: productID
      });
    } catch (error) {
      console.log('Error adding to cart:', error);
    }
  };

  const handleRemoveFromWishlist = async (productID: number) => {
    if (!user || !user.ID || !productID) {
      console.log('Invalid user or product ID');
      return;
    }

    try {
      const response = await axios.delete('http://localhost:8000/wishlists/remove', {
        data: {
          user_id: user.ID,
          product_id: productID
        }
      });
      fetchWishlistProducts(); 
    } catch (error) {
      console.log('Error removing from wishlist:', error);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  const numColumns = 2;
  const itemWidth = screenWidth / numColumns - 40;

  const WishlistCard: React.FC<{ product: IProduct }> = ({ product }) => {
    return (
      <View style={[styles.productItem, { width: itemWidth }]}>
        <Image source={{ uri: product.ImgUrl }} style={styles.productImage} />
        <TouchableOpacity style={styles.plusIconContainer} onPress={() => handleAddToCart(product.ID)}>
          <Image source={require('../assets/sale_icon.png')} style={styles.plusIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteIconContainer} onPress={() => handleRemoveFromWishlist(product.ID)}>
          <Image source={require('../assets/delete_icon.png')} style={styles.deleteIcon} />
        </TouchableOpacity>
        <Text style={styles.productName}>{product.Product}</Text>
        <Text style={styles.tailorName}>{product.Tailor}</Text>
        <Text style={styles.productDesc}>{product.Desc}</Text>
        <Text style={styles.productSize}>Size {product.Size}</Text>
        <Text style={styles.productPrice}>IDR {product.Price}K</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackButton /> 
      <Text style={styles.title}>Your Wishlists</Text>
      {wishlistProducts.length === 0 ? (
        <Text style={styles.noItemsText}>Your wishlist is currently empty</Text>
      ) : (
        <FlatList
          data={wishlistProducts}
          renderItem={({ item }) => <WishlistCard product={item} />}
          keyExtractor={(item) => item.ID.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.productsContainer}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: (Dimensions.get('window').width * 0.095),
    fontWeight: 'bold',
    marginLeft: 55,
    color: '#260101',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    paddingTop: (Dimensions.get('window').width * 0.18),
    paddingLeft: 24,
    paddingRight: 33,
    backgroundColor: 'white',
  },
  productsContainer: {
    paddingBottom: 20,
  },
  noItemsText: {
    fontSize: 20,
    color: '#260101',
    textAlign: 'center',
    marginTop: 20,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
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
  deleteIconContainer: {
    position: 'absolute',
    top: 45,
    right: 5.5,
  },
  deleteIcon: {
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
    marginHorizontal: 5,
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

export default WishlistScreen;

