import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IStackScreenProps } from '../src/library/StackScreenProps';

const selectedIcon = require('../assets/selected_icon.png');
const logoImage = require('../assets/TailorTech_Logo.png');

const RoleSelection: React.FC<IStackScreenProps> = (props) => {
  const [selectedRole, setSelectedRole] = useState<'Client' | 'Tailor'>('Client');
  const { navigation, route, nameProp } = props;

  const handleNext = () => {
    if (selectedRole === 'Tailor') {
      navigation.navigate('TailorLogin');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logo} />
      </View>
      <TouchableOpacity
        style={[styles.option, selectedRole === 'Client' ? styles.activeOption : styles.inactiveOption]}
        onPress={() => setSelectedRole('Client')}
      >
        <View style={styles.optionContent}>
          <Text style={[styles.optionText, selectedRole === 'Client' ? styles.activeOptionText : styles.inactiveOptionText]}>
            I am a Client
          </Text>
        </View>
        {selectedRole === 'Client' && <Image source={selectedIcon} style={styles.selectedIcon} />}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, selectedRole === 'Tailor' ? styles.activeOption : styles.inactiveOption]}
        onPress={() => setSelectedRole('Tailor')}
      >
        <View style={styles.optionContent}>
          <Text style={[styles.optionText, selectedRole === 'Tailor' ? styles.activeOptionText : styles.inactiveOptionText]}>
            I am a Tailor
          </Text>
        </View>
        {selectedRole === 'Tailor' && <Image source={selectedIcon} style={styles.selectedIcon} />}
      </TouchableOpacity>
      <TouchableOpacity style={styles.chooseButton} onPress={handleNext}>
        <Text style={styles.chooseButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9C3A9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingRight: 10,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.45,
  },
  option: {
    width: '80%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  activeOption: {
    backgroundColor: '#F3EADE',
  },
  inactiveOption: {
    backgroundColor: '#F3EADE',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: width * 0.055,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeOptionText: {
    color: '#260101',
    fontWeight: 'bold',
  },
  inactiveOptionText: {
    color: '#260101',
  },
  selectedIcon: {
    width: width * 0.07,
    height: width * 0.07,
    tintColor: '#260101',
    marginRight: 5,
  },
  chooseButton: {
    backgroundColor: '#593825',
    padding: 15,
    borderRadius: 25,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  chooseButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default RoleSelection;
