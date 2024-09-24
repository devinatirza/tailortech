import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, TextInput } from 'react-native';
import axios from 'axios';
import { IProduct } from '../interfaces/product-interfaces';
import ProductCard from './ProductCard';
import BackButton from '../components/back-button';

const ProductScreen: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [searchQuery, setSearchQuery] = useState('');

  async function fetchProducts(query = '') {
    try {
      const response = await axios.get('http://localhost:8000/products/get-all', {
        params: { query },
      });
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchProducts();
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchProducts(query);
  };

  const numColumns = 2;
  const itemWidth = screenWidth / numColumns - 40;

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Products</Text>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={{ uri: '../assets/searchbar.png' }} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Products..."
            placeholderTextColor="#260101"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.ID.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
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
  },
  container: {
    flex: 1,
    paddingTop: (Dimensions.get('window').width * 0.18),
    paddingHorizontal: 30,
    backgroundColor: 'white',
  },
  searchContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4DCD5',
    borderRadius: 25,
    paddingHorizontal: 12,
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
  productsContainer: {
    paddingBottom: 20,
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    width: (Dimensions.get('window').width / 2) - 40,
  },
});

export default ProductScreen;
