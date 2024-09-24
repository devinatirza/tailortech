import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { HomeStackParamList } from './HomeStack';
import InputField from '../components/input-field';
import BackButton from '../components/back-button';

type MeasurementPageRouteProp = RouteProp<HomeStackParamList, 'Measurement'>;
type Navigation = NavigationProp<HomeStackParamList, 'Measurement'>;

type MeasurementTypes = 'TOPS' | 'BOTTOMS' | 'DRESSES' | 'SUITS' | 'TOTE BAGS';

interface Measurements {
  [key: string]: string | boolean;
}

interface RequiredFields {
  [key: string]: string[];
}

const MeasurementPage: React.FC = () => {
  const route = useRoute<MeasurementPageRouteProp>();
  const { selectedType } = route.params;
  const navigation = useNavigation<Navigation>();
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requiredFields: RequiredFields = {
    TOPS: ['neck', 'shoulder', 'shoulderToWaist', 'chest', 'waist', 'sleeveLength', 'collar'],
    BOTTOMS: ['waist', 'hip', 'thigh', 'knee', 'ankle', 'cuffWidth', 'waistToAnkle'],
    DRESSES: ['shoulder', 'chest', 'waist', 'hip', 'dressLength'],
    SUITS: ['neck', 'shoulder', 'chest', 'waist', 'hip', 'sleeveLength', 'jacketLength', 'inseam', 'outseam', 'thigh', 'knee', 'ankle'],
    'TOTE BAGS': ['color', 'material', 'writing', 'imageDesc'],
  };

  useEffect(() => {
    const currentFields = requiredFields[selectedType as MeasurementTypes];
    const allFilled = currentFields.every((field) => measurements[field] !== undefined && measurements[field] !== '');
    setAllFieldsFilled(allFilled);
  }, [measurements, selectedType]);

  const handleInputChange = (name: string, value: string | boolean) => {
    setMeasurements({
      ...measurements,
      [name]: value,
    });
  };

  const handleNext = () => {
    if (!allFieldsFilled) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    navigation.navigate('Confirmation', {
      measurements,
      selectedType,
      basePrice: route.params.basePrice,
      tailorId: route.params.tailorId,
      tailorName: route.params.tailorName
    });
  };

  const renderInputs = () => {
    const unit = selectedType !== 'TOTE BAGS' ? 'cm' : '';
    switch (selectedType) {
      case 'TOPS':
        return (
          <>
            <InputField label="Neck" name="neck" value={measurements.neck as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Shoulder" name="shoulder" value={measurements.shoulder as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Shoulder to Waist" name="shoulderToWaist" value={measurements.shoulderToWaist as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Chest" name="chest" value={measurements.chest as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Waist" name="waist" value={measurements.waist as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Sleeve Length" name="sleeveLength" value={measurements.sleeveLength as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Collar" name="collar" value={measurements.collar as boolean || false} onChange={handleInputChange} />
          </>
        );
      case 'BOTTOMS':
        return (
          <>
            <InputField label="Waist" name="waist" value={measurements.waist as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Hip" name="hip" value={measurements.hip as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Thigh" name="thigh" value={measurements.thigh as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Knee" name="knee" value={measurements.knee as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Ankle" name="ankle" value={measurements.ankle as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Cuff Width" name="cuffWidth" value={measurements.cuffWidth as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Waist to Ankle" name="waistToAnkle" value={measurements.waistToAnkle as string || ''} onChange={handleInputChange} unit={unit} />
          </>
        );
      case 'DRESSES':
        return (
          <>
            <InputField label="Shoulder" name="shoulder" value={measurements.shoulder as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Chest" name="chest" value={measurements.chest as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Waist" name="waist" value={measurements.waist as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Hip" name="hip" value={measurements.hip as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Dress Length" name="dressLength" value={measurements.dressLength as string || ''} onChange={handleInputChange} unit={unit} />
          </>
        );
      case 'SUITS':
        return (
          <>
            <InputField label="Neck" name="neck" value={measurements.neck as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Shoulder" name="shoulder" value={measurements.shoulder as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Chest" name="chest" value={measurements.chest as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Waist" name="waist" value={measurements.waist as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Hip" name="hip" value={measurements.hip as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Sleeve Length" name="sleeveLength" value={measurements.sleeveLength as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Jacket Length" name="jacketLength" value={measurements.jacketLength as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Inseam" name="inseam" value={measurements.inseam as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Outseam" name="outseam" value={measurements.outseam as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Thigh" name="thigh" value={measurements.thigh as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Knee" name="knee" value={measurements.knee as string || ''} onChange={handleInputChange} unit={unit} />
            <InputField label="Ankle" name="ankle" value={measurements.ankle as string || ''} onChange={handleInputChange} unit={unit} />
          </>
        );
      case 'TOTE BAGS':
        return (
          <>
            <InputField label="Color" name="color" value={measurements.color as string || ''} onChange={handleInputChange} />
            <InputField label="Material" name="material" value={measurements.material as string || ''} onChange={handleInputChange} />
            <InputField label="Writing" name="writing" value={measurements.writing as string || ''} onChange={handleInputChange} />
            <InputField label="Image Description" name="imageDesc" value={measurements.imageDesc as string || ''} onChange={handleInputChange} />
          </>
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    return selectedType === 'TOTE BAGS' ? 'Description' : 'Measurement';
  };

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>{getHeaderTitle()}</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.inputContainer}>
          {renderInputs()}
        </View>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !allFieldsFilled && styles.disabledButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Help')}>
          <Text style={styles.helpText}>Need Help?</Text>
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
    paddingHorizontal: (Dimensions.get('window').width * 0.04),
    backgroundColor: 'white',
  },
  title: {
    fontSize: (width * 0.08),
    fontWeight: 'bold',
    marginLeft: 70,
    color: '#260101',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  scrollViewContainer: {
    paddingHorizontal: 40,
    paddingBottom: height * 0.2, 
    paddingTop: height * 0.04, 
    flexGrow: 1,
  },
  inputContainer: {
    flexGrow: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 85,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  nextButton: {
    backgroundColor: '#D9C3A9',
    height: height * 0.06,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#D9C3A9',
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: width * 0.05,
    color: '#260101',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 16,
    color: '#260101',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default MeasurementPage;
