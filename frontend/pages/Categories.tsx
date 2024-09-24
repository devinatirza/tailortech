import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { HomeStackParamList } from './HomeStack';
import BackButton from '../components/back-button';

type ClothingTypesRouteProp = RouteProp<HomeStackParamList, 'Categories'>;
type Navigation = NavigationProp<HomeStackParamList, 'Measurement'>;

const clothingTypes = [
  { type: 'TOPS', basePrice: '' },
  { type: 'BOTTOMS', basePrice: '' },
  { type: 'DRESSES', basePrice: '' },
  { type: 'SUITS', basePrice: '' },
  { type: 'TOTE BAGS', basePrice: '' }
];

const CategoriesScreen: React.FC = () => {
  const route = useRoute<ClothingTypesRouteProp>();
  const navigation = useNavigation<Navigation>();
  const { specialities, tailorId, tailorName } = route.params;
  const [selected, setSelected] = useState<string | null>(null);

  const isSpeciality = (type: string) => {
    return specialities.some((speciality: { Category: string }) => speciality.Category.toUpperCase() === type);
  };

  const getPrice = (type: string) => {
    const speciality = specialities.find((speciality: { Category: string }) => speciality.Category.toUpperCase() === type);
    return speciality ? speciality.Price : 0;
  };

  const handleSelect = (type: string) => {
    setSelected(type);
  };

  const handleChoose = () => {
    if (selected) {
      const basePrice = getPrice(selected);
      navigation.navigate('Measurement', { 
        selectedType: selected,
        basePrice ,
        tailorId,
        tailorName,
      });
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Clothing Type</Text>
      {clothingTypes.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={[
            styles.option, 
            selected === item.type ? styles.activeOption : isSpeciality(item.type) ? styles.specialityOption : styles.inactiveOption
          ]}
          onPress={() => handleSelect(item.type)}
          disabled={!isSpeciality(item.type)}
        >
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionText, 
              selected === item.type ? styles.activeOptionText : isSpeciality(item.type) ? styles.specialityOptionText : styles.inactiveOptionText
            ]}>
              {item.type}
            </Text>
            {isSpeciality(item.type) && (
              <Text style={styles.basePriceText}>Base Price: {getPrice(item.type)}K</Text>
            )}
          </View>
          {selected === item.type && (
            <Image source={require('../assets/selected_icon.png')} style={styles.selectedIcon} />
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.chooseButton} onPress={handleChoose}>
        <Text style={styles.chooseButtonText}>Choose</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  title: {
    fontSize: width * 0.073,
    fontWeight: 'bold',
    marginLeft: 55,
    color: '#260101',
    marginBottom: 50,
  },
  container: {
    flex: 1,
    paddingTop: width * 0.2,
    paddingHorizontal: 30,
    backgroundColor: 'white',
  },
  option: {
    marginBottom: 25,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeOption: {
    borderColor: '#260101',
    backgroundColor: '#f0e2d0',
  },
  specialityOption: {
    borderColor: '#260101',
    backgroundColor: 'white',
  },
  inactiveOption: {
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
  },
  optionContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeOptionText: {
    color: '#260101',
    fontWeight: 'bold',
  },
  specialityOptionText: {
    color: '#260101',
  },
  inactiveOptionText: {
    color: '#ccc',
  },
  basePriceText: {
    fontSize: width * 0.04,
    color: '#260101',
    textAlign: 'center',
  },
  selectedIcon: {
    width: width * 0.07,
    height: width * 0.07,
    tintColor: '#260101',
    marginRight: 10,
  },
  chooseButton: {
    backgroundColor: '#D9C3A9',
    position: 'absolute',
    bottom: 40,
    left: width * 0.2,
    right: width * 0.2,
    height: height * 0.06,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooseButtonText: {
    fontSize: width * 0.05,
    color: '#260101',
    fontWeight: 'bold',
  },
});

export default CategoriesScreen;
