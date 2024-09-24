import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ITailor } from '../interfaces/tailor-interfaces';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from './HomeStack'; 

type ClothingTypesScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'Categories'
>;

const TailorCard: React.FC<{ tailor: ITailor }> = ({ tailor }) => {
  const navigation = useNavigation<ClothingTypesScreenNavigationProp>();

  const formatSpecialities = (specialities: { Category: string, Price: number }[]) => {
    const categories = specialities.map(spec => spec.Category);
    if (categories.length === 1) {
      return `Speciality in ${categories[0]}`;
    } else if (categories.length === 2) {
      return `Speciality in ${categories[0]} and ${categories[1]}`;
    } else if (categories.length > 2) {
      return `Speciality in ${categories.slice(0, -1).join(', ')}, and ${categories[categories.length - 1]}`;
    }
    return '';
  };

  const formatPrices = (specialities: { Category: string, Price: number }[]) => {
    return specialities.map((spec, index) => (
      <Text key={index} style={styles.specialityText}>
        {spec.Category}: IDR {spec.Price}K
      </Text>
    ));
  };

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Categories', { 
      specialities: tailor.Speciality, 
      tailorId: tailor.ID, 
      tailorName: tailor.Name
    })}>
      <View style={styles.tailorItem}>
        <Image source={{ uri: tailor.ImgUrl }} style={styles.tailorImage} />
        <Text style={styles.tailorName}>{tailor.Name}</Text>
        <Text style={styles.tailorSpecialty}>{formatSpecialities(tailor.Speciality)}</Text>
        <View style={styles.locationContainer}>
          <Image source={require('../assets/location_icon.png')} style={styles.icon} />
          <Text style={styles.tailorLocation}>{tailor.Address}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Image source={require('../assets/rating_icon.png')} style={styles.icon} />
          <Text style={styles.ratingText}>{tailor.Rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tailorItem: {
    paddingVertical: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 160,
    marginHorizontal: 3,
  },
  tailorImage: {
    width: 155,
    height: 126,
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
  specialitiesContainer: {
    marginTop: 8,
  },
  specialityText: {
    fontSize: 15,
    color: '#593825',
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

export default TailorCard;
