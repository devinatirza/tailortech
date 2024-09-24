import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, Alert, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import axios from 'axios';
import { useUser } from '../contexts/user-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from './ProfileStack';
import BackButton from '../components/back-button';

type Navigation = NavigationProp<ProfileStackParamList, 'Profile'>;
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

interface Validations {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
  specialChar: boolean;
}

interface ErrorMessages {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UpdateProfileScreen: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigation = useNavigation<Navigation>();

  const [name, setName] = useState(user.Name);
  const [email, setEmail] = useState(user.Email);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user.PhoneNumber);
  const [address, setAddress] = useState(user.Address);

  const [validations, setValidations] = useState<Validations>({
    minLength: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });

  const [errorMessages, setErrorMessages] = useState<ErrorMessages>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);

    setValidations({
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      digit: /\d/.test(value),
      specialChar: /[~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(value),
    });

    const errors: string[] = [];
    if (value.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(value)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(value)) errors.push('Password must contain at least one digit');
    if (!/[~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(value)) errors.push('Password must contain at least one special character');

    setErrorMessages(prev => ({ ...prev, newPassword: errors.join(', ') }));
  };

  const handleSave = async () => {
    setErrorMessages({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessages(prev => ({ ...prev, confirmPassword: 'New passwords do not match' }));
      return;
    }

    if (newPassword && !oldPassword) {
      setErrorMessages(prev => ({ ...prev, oldPassword: 'Please enter your old password' }));
      return;
    }

    const updatedUser: any = {
      userId: user.ID,
      name,
      email,
      phoneNumber,
      address,
      points: user.Points,
    };

    if (newPassword) {
      updatedUser.oldPassword = oldPassword;
      updatedUser.newPassword = newPassword;
      updatedUser.confirmPassword = confirmPassword;
    }

    try {
      const response = await axios.post(`http://localhost:8000/users/update`, updatedUser, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      if (response.status !== 200) {
        Alert.alert('Error', result.error);
      } else {
        updateUser(result.user);
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.navigate('Profile');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'An error occurred. Please try again later.';
      if (errorMsg.includes('Old password is incorrect')) {
        setErrorMessages(prev => ({ ...prev, oldPassword: errorMsg }));
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  return (
    <>
    <BackButton/>
    <ScrollView style={styles.mainContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.imageContainer}>
          <Image source={require('../assets/profileIcon.png')} style={styles.profileImage} />
        </View>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
        <Text style={styles.label}>Old Password</Text>
        <TextInput
          style={styles.input}
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder="Old Password"
          secureTextEntry
        />
        {errorMessages.oldPassword ? <Text style={styles.errorText}>{errorMessages.oldPassword}</Text> : null}
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={handlePasswordChange}
          placeholder="New Password"
          secureTextEntry
        />
        {errorMessages.newPassword ? <Text style={styles.errorText}>{errorMessages.newPassword}</Text> : null}
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm New Password"
          secureTextEntry
        />
        {errorMessages.confirmPassword ? <Text style={styles.errorText}>{errorMessages.confirmPassword}</Text> : null}
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.addressInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
          multiline
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone Number"
        />
        <TouchableOpacity style={styles.buttonContainer} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingVertical: 30,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    paddingTop: deviceHeight * 0.09,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 30,
    width: '100%',
    paddingBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  profileImage: {
    width: deviceWidth * 0.4,
    height: deviceWidth * 0.4,
  },
  label: {
    color: '#260101',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: '500',
    marginLeft: 15,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F3EADE',
    height: 50,
    marginBottom: 20,
    color: '#260101',
    fontSize: 18,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 15,
  },
  buttonContainer: {
    backgroundColor: '#D9C3A9',
    marginHorizontal: 50,
    height: 45,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 18,
    color: '#260101',
    fontWeight: 'bold',
  },
});

export default UpdateProfileScreen;
