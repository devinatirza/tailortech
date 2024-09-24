import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, TextInput } from 'react-native';
import axios from 'axios';
import { ITailor } from '../interfaces/tailor-interfaces';
import TailorCard from './TailorCard';
import { useRoute } from '@react-navigation/native';
import BackButton from '../components/back-button';

const TailorService: React.FC = () => {
  const route = useRoute();
  const { speciality } = route.params as { speciality: string };

  const [tailors, setTailors] = useState<ITailor[]>([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [searchQuery, setSearchQuery] = useState('');

  async function fetchTailors(query = '', speciality = '') {
    try {
      const response = await axios.get('http://localhost:8000/tailors/get-all', {
        params: { query, speciality },
      });
      setTailors(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchTailors('', speciality);
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      subscription?.remove();
    };
  }, [speciality]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchTailors(query, speciality);
  };

  const numColumns = 2;
  const itemWidth = screenWidth / numColumns - 40;

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>{speciality} Tailors</Text>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={{ uri: '../assets/searchbar.png' }} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Tailors..."
            placeholderTextColor="#260101"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <FlatList
        data={tailors}
        renderItem={({ item }) => <TailorCard tailor={item} />}
        keyExtractor={(item) => item.ID.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.tailorsContainer}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: (Dimensions.get('window').width * 0.09),
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
    backgroundColor: '#F3EADE',
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
    fontSize: 16.5,
    color: '#260101',
  },
  tailorsContainer: {
    paddingBottom: 10,
  },
  tailorItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    width: (Dimensions.get('window').width / 2) - 40,
  },
  tailorImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 4 / 3,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  tailorName: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#260101',
  },
  tailorSpecialty: {
    marginTop: 3,
    fontSize: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tailorLocation: {
    fontSize: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#181818',
  },
  icon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
});

export default TailorService;
