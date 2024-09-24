import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Dimensions, Alert, ScrollView } from 'react-native';
import { useUser } from '../contexts/user-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ProfileStackParamList } from './ProfileStack';
import BackButton from '../components/back-button';

type Navigation = NavigationProp<ProfileStackParamList, 'CouponCode'>;

interface CouponProps {
  code: string;
  discount: number;
  quantity: number;
}

const Coupon: React.FC<CouponProps> = ({ code, discount, quantity }) => (
  <View style={styles.couponWrapper}>
    {quantity > 1 && <View style={styles.quantityCircle}><Text style={styles.quantityText}>{quantity}</Text></View>}
    <View style={styles.couponContainer}>
      <Image source={require('../assets/couponIcon.png')} style={styles.couponBackground} />
      <Text style={styles.couponText}>{code}K</Text>
    </View>
  </View>
);

const CouponCodeScreen: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation<Navigation>();
  const [coupons, setCoupons] = useState<CouponProps[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://localhost:8000/coupons/code', {
        params: { userId: user.ID }
      });
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Failed to fetch user coupons', error);
    }
  };

  useEffect(() => {
    fetchCoupons()
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const hasCoupons = coupons.length > 0;
  const buttonText = hasCoupons ? "Get Another Coupon Code" : "Get Coupon Code";
  const emptyMessage = "You haven't earned any coupons yet. Start requesting our tailoring services to unlock your first coupon!";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Coupon Code</Text>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>Apply your coupon code on the payment page to unlock a special discount and enhance your shopping experience</Text>
      </View>
      <TouchableOpacity 
        style={styles.couponButton} 
        onPress={() => navigation.navigate('CouponRedeem')}
      >
        <Text style={styles.couponButtonText}>Your Coupon</Text>
      </TouchableOpacity>
      <View style={styles.couponsContainer}>
        {hasCoupons ? (
          coupons.map((coupon) => (
            <Coupon key={coupon.code} code={coupon.code} discount={coupon.discount} quantity={coupon.quantity} />
          ))
        ) : (
          <Text style={styles.emptyMessage}>{emptyMessage}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.anotherCouponButton} 
        onPress={() => navigation.navigate('CouponRedeem')}
      >
        <Text style={styles.anotherCouponButtonText}>{buttonText}</Text>
      </TouchableOpacity> 
    </ScrollView>
  );
};

const { width: deviceWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: deviceWidth * 0.1,
    paddingTop: deviceWidth * 0.19,
    width: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: deviceWidth * 0.08,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#260101',
    marginBottom: 10,
    marginLeft: 45,
  },
  headerTextContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: deviceWidth * 0.045,
    color: '#260101',
    textAlign: 'center',
  },
  couponWrapper: {
    width: deviceWidth * 0.8,
    marginVertical: 5,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityCircle: {
    position: 'absolute',
    top: 1,
    right: 4,
    backgroundColor: '#4B2618',
    borderRadius: 60,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  quantityText: {
    color: 'white',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  couponContainer: {
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  couponBackground: {
    width: '95%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'contain',
  },
  couponText: {
    color: '#260101',
    fontSize: 24,
  },
  emptyMessage: {
    fontSize: 18,
    color: '#260101',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 22,
  },
  couponButton: {
    backgroundColor: '#4B2618',
    width: 200,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 20,
    borderRadius: 8,
  },
  couponButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  couponsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  anotherCouponButton: {
    backgroundColor: '#D9C3A9',
    borderRadius: 50,
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginTop: 35,
    marginBottom: 30,
  },
  anotherCouponButtonText: {
    color: '#260101',
    fontSize: 20,
  },
});

export default CouponCodeScreen;
