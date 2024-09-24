import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import HomeServiceScreen from './HomeService';
import { HomeStackParamList } from './HomeStack';
import BackButton from '../components/back-button';

type Navigation = NavigationProp<HomeStackParamList, 'HomeService'>;

const HelpOption = () => {
  const navigation = useNavigation<Navigation>();

  const handleChatCallAssistant = () => {
    Linking.openURL('https://wa.me/628975611789'); 
  };

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Help</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.button1} onPress={handleChatCallAssistant}>
          <Text style={styles.buttonText}>Chat or Call Assistant</Text>
        </TouchableOpacity>
        <Text style={styles.buttonDescription}>
          Our Assistant will walk you through each step, making sure you get a flawless fit.
        </Text>
      </View>
      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('HomeService')}>
          <Text style={styles.buttonText}>Home Service</Text>
        </TouchableOpacity>
        <Text style={styles.buttonDescription}>
          Book a home service to get your clothes tailored perfectly for your fit.
        </Text>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: height * 0.0752,
    paddingHorizontal: width * 0.1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 30,
    color: '#260101',
    marginLeft: 40,
  },
  optionContainer: {
    marginBottom: 30,
  },
  button1: {
    backgroundColor: '#f0e2d0',
    borderColor:'#401201',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 50,
    marginBottom: 10,
    alignItems: 'center',
    width: '75%',
  },
  button2: {
    backgroundColor: '#f0e2d0',
    borderColor:'#401201',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 50,
    marginBottom: 10,
    alignItems: 'center',
    width: '55%',
  },
  buttonText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#5A2D0C',
  },
  buttonDescription: {
    fontSize: 18,
    color: '#5A2D0C',
    textAlign: 'left',
    marginBottom: 17,
  },
});

export default HelpOption;
