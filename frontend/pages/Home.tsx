import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ITailor } from '../interfaces/tailor-interfaces';
import { IProduct } from '../interfaces/product-interfaces';
import TailorCard from './TailorCard';
import ProductCard from './ProductCard';
import { HomeStackParamList } from './HomeStack';
import { useUser } from '../contexts/user-context';

type Navigation = NavigationProp<HomeStackParamList, 'Wishlists', 'Chats'>;

interface ServiceItemProps {
  src: any;
  label: string;
  onPress: () => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ src, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.serviceItem}>
    <Image source={src} style={styles.serviceImage} />
    <Text style={styles.serviceLabel}>{label}</Text>
  </TouchableOpacity>
);

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [tailors, setTailors] = useState<ITailor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ip } = useUser();

  async function fetchProducts() {
    try {
      const response = await axios.get(`http://${ip}:8000/products/get-all`);
      setProducts(response.data);
    } catch (error) {
      setError('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTailors() {
    try {
      const response = await axios.get(`http://${ip}:8000/tailors/get-all`);
      setTailors(response.data);
    } catch (error) {
      setError('Failed to fetch tailors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchTailors();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
      fetchTailors();
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { src: require('../assets/tops_icon.webp'), label: 'Tops' },
    { src: require('../assets/bottoms_icon.webp'), label: 'Bottoms' },
    { src: require('../assets/dresses_icon.png'), label: 'Dresses' },
    { src: require('../assets/suits_icon.png'), label: 'Suits' },
    { src: require('../assets/totebag_icon.png'), label: 'ToteBags' },
  ];

  const formatServiceLabel = (label: string) => {
    return label.replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TailorTech</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Wishlists')}>
            <Image source={require('../assets/wishlist_icon.png')} style={styles.wishlistIcon} />
          </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle} id='Services'>Services</Text>
        <View style={styles.servicesContainer}>
          {services.map((service, index) => (
            <ServiceItem
              key={index}
              src={service.src}
              label={service.label}
              onPress={() => navigation.navigate('Services', { speciality: formatServiceLabel(service.label) })}
            />
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} id='Tailors'>Tailors</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tailors')}>
            <Text style={styles.moreButton}>More {'>'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tailorsContainer}>
          {tailors.slice(0, 8).map((tailor) => (
            <TailorCard key={tailor.ID} tailor={tailor} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} id='Products'>Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.moreButton}>More {'>'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsContainer}>
          {products.slice(0, 8).map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: deviceWidth * 0.1,
    fontWeight: 'bold',
    marginTop: 25,
    color: '#260101',
  },

  wishlistIcon: {
    width: 36,
    height: 32,
    top: 12,
    right: 8,
  },
  container: {
    paddingTop: 30,
    paddingHorizontal: 25,
    backgroundColor: 'white',
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    marginTop: 10,
    backgroundColor: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  serviceItem: {
    alignItems: 'center',
    width: (deviceWidth / 5) - 15,
    marginBottom: 15,
  },
  serviceImage: {
    width: deviceWidth * 0.15,
    height: deviceWidth * 0.15,
    aspectRatio: 1,
    borderRadius: 28,
  },
  serviceLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  moreButton: {
    fontSize: 16,
    color: 'black',
  },
  tailorsContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  productsContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
});

export default HomeScreen;
