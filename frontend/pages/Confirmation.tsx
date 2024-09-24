import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, ScrollView } from 'react-native';
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native';
import { HomeStackParamList } from './HomeStack';
import { useUser } from '../contexts/user-context';
import BackButton from '../components/back-button';

type ConfirmationPageRouteProp = RouteProp<HomeStackParamList, 'Confirmation'>;
type Navigation = NavigationProp<HomeStackParamList, 'Measurement' | 'RequestPayment'>;

const ConfirmationScreen: React.FC = () => {
  const route = useRoute<ConfirmationPageRouteProp>();
  const { measurements, selectedType, basePrice, tailorId, tailorName } = route.params;
  const navigation = useNavigation<Navigation>();
  const { user } = useUser();
  const [description, setDescription] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!description) {
      setErrorMessage('Please provide details for your tailoring request.');
      return;
    }

    navigation.navigate('RequestPayment', {
      measurements,
      selectedType,
      basePrice,
      tailorId,
      description,
    });
  };

  const getTitle = () => {
    return selectedType === 'TOTE BAGS' ? 'Description' : 'Measurement';
  };

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Confirm Order</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.Name}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Clothing Type</Text>
          <Text style={styles.value}>{selectedType}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>{getTitle()}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Measurement', { selectedType: selectedType, basePrice, tailorId, tailorName })}>
            <Image source={require('../assets/pencilIcon.png')} style={styles.pencilIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Tailor's Name</Text>
          <Text style={styles.value}>{tailorName}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Tailor's Base Price</Text>
          <Text style={styles.value}>{basePrice}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter tailoring details"
            value={description}
            onChangeText={setDescription}
          />
        </View>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: (Dimensions.get('window').width * 0.19),
    paddingHorizontal: (Dimensions.get('window').width * 0.01),
    backgroundColor: 'white',
  },
  title: {
    fontSize: (width * 0.08),
    fontWeight: 'bold',
    marginLeft: 80,
    color: '#260101',
    alignSelf: 'flex-start',
    marginBottom: 25,
  },
  scrollViewContainer: {
    paddingHorizontal: 40,
    paddingBottom: height * 0.17, 
    flexGrow: 1,
  },
  detailContainer: {
    marginVertical: 10,
    flexGrow: 1,
  },
  label: {
    fontSize: 20,
    color: '#260101',
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#5B3E31',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  pencilIcon: {
    width: 20,
    height: 20,
    alignSelf: 'flex-end',
    marginRight: 10,
    marginTop: -20,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#5B3E31',
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: 'grey',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 85,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  confirmButton: {
    backgroundColor: '#D9C3A9',
    height: height * 0.06,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {
    fontSize: width * 0.05,
    color: '#260101',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ConfirmationScreen;
