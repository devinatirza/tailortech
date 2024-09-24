import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { useUser } from '../contexts/user-context';
import axios from 'axios';
import { NavigationProp, useNavigation } from '@react-navigation/native'; 
import { ProfileStackParamList } from './ProfileStack';
import BackButton from '../components/back-button';

type Navigation = NavigationProp<ProfileStackParamList, 'CouponCode'>;

const CouponRedeemScreen = () => {
  const { user, updateUser } = useUser();
  const navigation = useNavigation<Navigation>(); 
  const points = user.Points;
  const id = user.ID;
  const remainingPoints = 100 - points;
  const [selected, setSelected] = useState<string | null>(null);

  const handleExchange = async (promoCode: string, pointsRequired: number) => {
    const newPoints = points - pointsRequired;

    try {
      const response = await axios.post('http://localhost:8000/coupons/exchange', {
        userId: id,
        promoCode
      });

      if (response.data.success) {
        updateUser({ ...user, Points: newPoints });
        Alert.alert('Success!', `Your promo code is: ${promoCode}`);
        navigation.navigate('CouponCode');
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Exchange error:', error);
      Alert.alert('Error', 'Failed to exchange points. Please try again.');
    }
  };

  const handleSelect = (promoCode: string) => {
    setSelected(promoCode);
  };

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Point Redeem</Text>
      <Text style={styles.pointsText}>You have {points} points!</Text>
      {points >= 100 && (
        <>
          <Text style={styles.congratulationsText}>
            Congratulations! You can exchange your points for a discount. Please choose an option below:
          </Text>
          <View style={styles.optionsContainer}>
            {points >= 100 && (
              <TouchableOpacity 
                style={[
                  styles.option, 
                  selected === 'TECH15' ? styles.activeOption : styles.inactiveOption
                ]}
                onPress={() => handleSelect('TECH15')}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionText, 
                    selected === 'TECH15' ? styles.activeOptionText : styles.inactiveOptionText
                  ]}>
                    100 points for IDR150K discount
                  </Text>
                </View>
                {selected === 'TECH15' && (
                  <Image source={require('../assets/selected_icon.png')} style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            )}
            {points >= 200 && (
              <TouchableOpacity 
                style={[
                  styles.option, 
                  selected === 'TECH35' ? styles.activeOption : styles.inactiveOption
                ]}
                onPress={() => handleSelect('TECH35')}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionText, 
                    selected === 'TECH35' ? styles.activeOptionText : styles.inactiveOptionText
                  ]}>
                    200 points for IDR350K discount
                  </Text>
                </View>
                {selected === 'TECH35' && (
                  <Image source={require('../assets/selected_icon.png')} style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            )}
            {points >= 500 && (
              <TouchableOpacity 
                style={[
                  styles.option, 
                  selected === 'TECH75' ? styles.activeOption : styles.inactiveOption
                ]}
                onPress={() => handleSelect('TECH75')}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionText, 
                    selected === 'TECH75' ? styles.activeOptionText : styles.inactiveOptionText
                  ]}>
                    500 points for IDR750K discount
                  </Text>
                </View>
                {selected === 'TECH75' && (
                  <Image source={require('../assets/selected_icon.png')} style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            )}
          </View>
          {selected && (
            <TouchableOpacity 
              style={styles.redeemButton}
              onPress={() => handleExchange(selected, selected === 'TECH75' ? 500 : selected === 'TECH35' ? 200 : 100)}
            >
              <Text style={styles.redeemButtonText}>Redeem</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {points < 100 && (
        <Text style={styles.keepGoingText}>
          Keep going! You need {remainingPoints} more points to earn a coupon code. Continue shopping to unlock your discount reward!
        </Text>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.088,
    backgroundColor: 'white',
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#260101',
    marginBottom: 10,
    marginLeft: 65,
  },
  pointsText: {
    marginTop: width * 0.07,
    fontSize: width * 0.065,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#260101',
  },
  congratulationsText: {
    fontSize: width * 0.05,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#260101',
  },
  keepGoingText: {
    fontSize: width * 0.05,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#260101',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    marginBottom: 25,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeOption: {
    borderColor: '#260101',
    backgroundColor: '#f0e2d0',
  },
  inactiveOption: {
    borderColor: '#260101',
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
  inactiveOptionText: {
    color: '#260101',
  },
  selectedIcon: {
    width: width * 0.07,
    height: width * 0.07,
    tintColor: '#260101',
    marginRight: 10,
  },
  redeemButton: {
    backgroundColor: '#D9C3A9',
    marginHorizontal: width * 0.2,
    height: height * 0.06,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  redeemButtonText: {
    fontSize: width * 0.05,
    color: '#260101',
    fontWeight: 'bold',
  },
});

export default CouponRedeemScreen;
