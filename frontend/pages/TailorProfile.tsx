import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Platform, Modal, TextInput, TouchableWithoutFeedback, Alert } from 'react-native';
import { useUser } from '../contexts/user-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ITailor } from '../interfaces/tailor-interfaces';

const TailorProfileScreen: React.FC = () => {
  const { updateUser, user } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  const handleLogout = async () => {
    if (!user) {
      console.error('Logout error: User is not logged in');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/logout', {
        withCredentials: true,
      });
      if (response.status === 200) {
        if (Platform.OS === 'web') {
          document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        Alert.alert('Success', 'You have been logged out')
        navigation.navigate('Role')
        updateUser(null); 
      } else {
        console.error('Logout error:', response.data);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchTailorDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/tailors/${user.ID}`);
      if (response.status === 200) {
        updateUser(response.data);
      } else {
        console.error('Failed to fetch tailor details');
      }
    } catch (error) {
      console.error('Failed to fetch tailor details', error);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount")
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/tailors/withdraw/${user.ID}`, {
        Amount: amount,
      }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Withdrawal Successful!")
        fetchTailorDetails(); 
        setIsModalVisible(false); 
        setWithdrawalAmount(''); 
      } else {
        console.error('Withdrawal error:', response.data);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
    }
  };

  useEffect(() => {
    fetchTailorDetails()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTailorDetails();
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.profileText}>Profile</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: (user as ITailor)?.ImgUrl }} style={styles.profileImage} />
        </View>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.text}>{user?.Name}</Text>
        <Text style={styles.label}>Money</Text>
        <View style={styles.text}>
          <Text style={{fontSize: 18}}>{(user as ITailor)?.Money}K</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Image source={require('../assets/withdrawal-icon.png')} style={styles.withdrawIcon} />
          </TouchableOpacity>
        </View> 
        <Text style={styles.label}>Email</Text>
        <Text style={styles.text}>{(user as ITailor)?.Email}</Text>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.text}>{(user as ITailor)?.Address}</Text>
        <Text style={styles.label}>Rating</Text>
        <Text style={styles.text}>{(user as ITailor)?.Rating}</Text>
        <View style={styles.specialitiesContainer}>
          <Text style={styles.label}>Specialities</Text>
          {(user as ITailor)?.Speciality && (user as ITailor).Speciality.length > 0 ? (
            (user as ITailor).Speciality.map((speciality, index) => (
              <View key={index} style={styles.specialityItem}>
                <Text style={styles.specialityCategory}>{speciality.Category}</Text>
                <Text style={styles.specialityPrice}>Base Price: IDR {speciality.Price}K</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSpecialitiesText}>No specialities available</Text>
          )}
        </View>
        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Withdraw Money</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={withdrawalAmount}
                  onChangeText={setWithdrawalAmount}
                />
                <TouchableOpacity style={styles.modalButton} onPress={handleWithdraw}>
                  <Text style={styles.modalButtonText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

const { width: deviceWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingVertical: deviceWidth * 0.14,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: deviceWidth * 0.1,
    paddingBottom: 30,
    width: '100%',
  },
  profileText: {
    fontSize: deviceWidth * 0.1,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#260101',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  profileImage: {
    width: deviceWidth * 0.4,
    height: deviceWidth * 0.4,
    borderRadius: deviceWidth * 0.2,
  },
  label: {
    color: '#260101',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: '500',
    marginLeft: 15,
  },
  text: {
    padding: 15,
    backgroundColor: '#F3EADE',
    height: 50,
    marginBottom: 20,
    color: '#260101',
    fontSize: 18,
    flexDirection: 'row',
  },
  moneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moneyTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EADE',
    borderRadius: 10,
    height: 50,
    padding: 15,
    marginBottom: 20,
    flex: 1,
  },
  withdrawIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  specialitiesContainer: {
    marginTop: 10,
  },
  specialityItem: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3EADE',
  },
  specialityCategory: {
    fontSize: 18,
    color: '#593825',
    fontWeight: '600',
    marginBottom: 5,
  },
  specialityPrice: {
    fontSize: 16,
    color: '#260101',
  },
  noSpecialitiesText: {
    fontSize: 16,
    color: '#260101',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    paddingBottom: 30,
  },
  buttonText: {
    fontSize: 18,
    color: '#AC1A1A',
    fontWeight    : 'bold',
    textAlign: 'center',
    marginTop: 20,
    paddingBottom: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: deviceWidth * 0.75,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize    : 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButton: {
    width: '40%',
    padding: 10,
    backgroundColor: '#D9C3A9',
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#401201',
    fontWeight: 'bold',
  },
});

export default TailorProfileScreen;
