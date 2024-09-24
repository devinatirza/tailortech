import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { IProduct } from '../interfaces/product-interfaces';
import { TailorHomeStackParamList } from './TailorHomeStack';
import { useUser } from '../contexts/user-context';

type Navigation = NavigationProp<TailorHomeStackParamList>;

const TailorHomeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const [tailorProducts, setTailorProducts] = useState<IProduct[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'active' | 'inactive'>('active'); 

  const { user } = useUser();

  async function fetchProducts(query = '', view = 'active') {
    try {
      const endpoint = view === 'active' ? 'http://localhost:8000/products/get-tailor-active' : 'http://localhost:8000/products/get-tailor-inactive';
      const response = await axios.get(endpoint, {
        params: { query, tailor_id: user?.ID },
      });
      setTailorProducts(response.data || []);
    } catch (error) {
      console.log(error);
      setTailorProducts([]);
    }
  }

  async function handleRemoveFromProduct(productId: number) {
    try {
      await axios.delete(`http://localhost:8000/products/delete/${productId}`);
      setTailorProducts((prevProducts) => prevProducts.filter(product => product.ID !== productId));
    } catch (error) {
      console.log('Error removing product:', error);
    }
  }

  async function handleAddToProduct(productId: number) {
    try {
      await axios.put(`http://localhost:8000/products/activate/${productId}`);
      setTailorProducts((prevProducts) => prevProducts.filter(product => product.ID !== productId));
    } catch (error) {
      console.log('Error adding product:', error);
    }
  }

  useEffect(() => {
    if (user?.ID) {
      fetchProducts('', view);
    }
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      subscription?.remove();
    };
  }, [user, view]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchProducts(query, view);
  };

  const numColumns = 2;
  const itemWidth = screenWidth / numColumns - 30;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TailorTech</Text>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={require('../assets/searchbar.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Browse Your Collections..."
            placeholderTextColor="#260101"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.toggleButton, view === 'active' && styles.activeButton]} onPress={() => setView('active')}>
          <Text style={[styles.toggleButtonText, view === 'active' && styles.activeButtonText]}>Active Collections</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, view === 'inactive' && styles.activeButton]} onPress={() => setView('inactive')}>
          <Text style={[styles.toggleButtonText, view === 'inactive' && styles.activeButtonText]}>Inactive Collections</Text>
        </TouchableOpacity>
      </View>
      {(!tailorProducts || tailorProducts.length === 0) ? (
        <Text style={styles.noItemsText}>
          {view === 'active' ? 'No active collections available.' : 'No inactive collections available.'}
        </Text>
      ) : (
        <FlatList
          data={tailorProducts}
          renderItem={({ item }) => (
            <TailorProductCard 
              product={item} 
              itemWidth={itemWidth} 
              handleRemoveFromProduct={handleRemoveFromProduct} 
              handleAddToProduct={handleAddToProduct}
              view={view} 
            />
          )}
          keyExtractor={(item) => item.ID.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.productsContainer}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </View>
  );
};

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: deviceHeight * 0.05,
    paddingHorizontal: deviceWidth * 0.06,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: deviceWidth * 0.1,
    fontWeight: 'bold',
    color: '#260101',
    marginTop: 15,
    marginLeft: 5,
  },
  searchContainer: {
    marginTop: 18,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4DCD5',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    width: 25,
    height: 25,
    tintColor: '#260101',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    color: '#260101',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#E4DCD5',
  },
  activeButton: {
    backgroundColor: '#593825',
  },
  toggleButtonText: {
    color: '#260101',
    fontSize: 15,
  },
  activeButtonText: {
    color: 'white',
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
  iconContainer: {
    position: 'absolute',
    top: 6,
    right: 5.5,
  },
  deleteIcon: {
    width: 22,
    height: 25,
    resizeMode: 'contain',
  },
  restoreIcon: {
    width: 28,
    height: 28,
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

const TailorProductCard: React.FC<{ product: IProduct; itemWidth: number; handleRemoveFromProduct: (productId: number) => void, handleAddToProduct: (productId: number) => void, view: 'active' | 'inactive' }> = ({ product, itemWidth, handleRemoveFromProduct, handleAddToProduct, view }) => {
  return (
    <View style={[styles.productItem, { width: itemWidth }]}>
      <Image source={{ uri: product.ImgUrl }} style={styles.productImage} />
      {view === 'active' ? (
        <TouchableOpacity style={styles.iconContainer} onPress={() => handleRemoveFromProduct(product.ID)}>
          <Image source={require('../assets/delete_icon.png')} style={styles.deleteIcon} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.iconContainer} onPress={() => handleAddToProduct(product.ID)}>
          <Image source={require('../assets/restore_icon.png')} style={styles.restoreIcon} />
        </TouchableOpacity>
      )}
      <Text style={styles.productName}>{product.Product}</Text>
      <Text style={styles.tailorName}>{product.Tailor}</Text>
      <Text style={styles.productDesc}>{product.Desc}</Text>
      <Text style={styles.productSize}>Size {product.Size}</Text>
      <Text style={styles.productPrice}>IDR {product.Price}K</Text>
    </View>
  );
};

export default TailorHomeScreen;
