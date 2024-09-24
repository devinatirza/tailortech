import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { IStackScreenProps } from '../src/library/StackScreenProps';
import { StatusBar } from 'expo-status-bar';
import axios, { AxiosError } from 'axios';
import StyledText from '../components/text-input';
import BackButton from '../components/back-button';

interface Styles {
  container: ViewStyle;
  inputContainer: ViewStyle;
  inputLabel: TextStyle;
  inputField: TextStyle;
  checkBoxText: TextStyle;
  validationContainer: ViewStyle;
  checkBoxRow: ViewStyle;
  title: TextStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  logo: ImageStyle;
  text: TextStyle;
  error: TextStyle;
  backButton: ViewStyle;
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: width * 0.04,
  },
  inputContainer: {
    paddingHorizontal: width * 0.12,
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    flex: 1, 
    marginRight: 10,
    fontSize: 16, 
  },
  inputField: {
    flex: 2, 
    borderBottomColor: '#401201',
    borderBottomWidth: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  validationContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginRight: 70,
  },
  checkBoxText: {
    fontSize: 16,
  },
  checkBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },  
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#401201',
  },
  buttonContainer: {
    width: '60%',
    alignItems: 'center',
  },
  button: {
    height: 50,
    backgroundColor: '#D9C3A9',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#260101',
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 30,
  },
});

const RegisterScreen: React.FunctionComponent<IStackScreenProps> = (props) => {
  const [nameProp, setNameProp] = useState('');
  const [emailProp, setEmailProp] = useState('');
  const [passwordProp, setPasswordProp] = useState('');
  const [confirmPasswordProp, setConfirmPasswordProp] = useState('');
  const [phoneNumberProp, setPhoneNumberProp] = useState('');
  const [addressProp, setAddressProp] = useState('');
  const [error, setError] = useState('');

  const [validations, setValidations] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });

  const {navigation} = props

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:8000/register", {
        name: nameProp,
        email: emailProp,
        password: passwordProp,
        confirm: confirmPasswordProp,
        phoneNumber: phoneNumberProp,
        address: addressProp
      });
      setError('');
      if(response.status === 200){
        navigation.navigate('Login')
      }
    } catch (error) {
      console.log('An error occurred');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPasswordProp(value);
  
    setValidations({
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      digit: /\d/.test(value),
      specialChar: /[~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(value),
    });
  };

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Registration</Text>
      <View style={styles.inputContainer}>
       <StyledText nameProp={nameProp} placeholder='Name' setNameProp={setNameProp}/> 
       <StyledText nameProp={emailProp} placeholder='Email' setNameProp={setEmailProp}/> 
       <StyledText nameProp={passwordProp} placeholder='Password' setNameProp={handlePasswordChange} secureTextEntry={true}/> 
        <Text style={styles.checkBoxText}>Password Requirements:</Text>
        <View style={styles.validationContainer}>
          <View style={styles.checkBoxRow}>
            <CheckBox
              checked={validations.minLength}
              disabled
              checkedColor="#C1AEA7"
            />
            <Text style={styles.checkBoxText}>Mininum 8 characters</Text>
          </View>
          <View style={styles.checkBoxRow}>
            <CheckBox
              checked={validations.uppercase && validations.lowercase}
              disabled
              checkedColor="#C1AEA7"
            />
            <Text style={styles.checkBoxText}>At least one uppercase and lowercase letter</Text>
          </View>
          <View style={styles.checkBoxRow}>
            <CheckBox
              checked={validations.digit && validations.specialChar}
              disabled
              checkedColor="#C1AEA7"
            />
            <Text style={styles.checkBoxText}>At least one number and special character</Text>
          </View>
        </View>
        <StyledText nameProp={confirmPasswordProp} placeholder='Confirm Password' setNameProp={setConfirmPasswordProp} secureTextEntry={true}/> 
        <StyledText nameProp={phoneNumberProp} placeholder='Phone Number' setNameProp={setPhoneNumberProp}/> 
        <StyledText nameProp={addressProp} placeholder='Address' setNameProp={setAddressProp}/> 
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.text}>Already have an account?</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};


export default RegisterScreen;