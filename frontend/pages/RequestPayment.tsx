import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Dimensions, FlatList, Modal, ScrollView } from 'react-native';
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { HomeStackParamList } from './HomeStack';
import { useUser } from '../contexts/user-context';
import BackButton from '../components/back-button';

type RequestPaymentRouteProp = RouteProp<HomeStackParamList, 'RequestPayment'>;
type Navigation = NavigationProp<HomeStackParamList, 'RequestSent'>;

interface Coupon {
  code: string;
  discount: number;
  quantity: number;
}

const RequestPaymentScreen: React.FC = () => {
  const route = useRoute<RequestPaymentRouteProp>();
  const { measurements, selectedType, basePrice, tailorId, description } = route.params;
  const navigation = useNavigation<Navigation>();
  const { user } = useUser();
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const shippingFee = 10;

  useEffect(() => {
    const fetchUserCoupons = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/coupons/code?userId=${user.ID}`);
        if (response.status === 200) {
          setUserCoupons(response.data.coupons);
        } else {
          setErrorMessage('Failed to fetch coupons');
        }
      } catch (error) {
        setErrorMessage('Failed to fetch coupons');
      }
    };

    fetchUserCoupons();
  }, []);

  useEffect(() => {
    if (couponCode) {
      const selectedCoupon = userCoupons.find(coupon => coupon.code === couponCode);
      if (selectedCoupon) {
        setDiscount(selectedCoupon.discount);
        setErrorMessage(null);
      } else {
        setErrorMessage('Invalid coupon code');
      }
    }
  }, [couponCode, userCoupons]);

  const handlePayment = async () => {
    const totalAmount = Math.max(basePrice - discount + shippingFee, 0);

    if (user.Money < totalAmount) {
      Alert.alert('Error', 'Insufficient balance to complete the payment.');
      return;
    }

    try {
      const paymentEndpoint = 'http://localhost:8000/payment';
      const paymentData = {
        UserId: user.ID,
        TotalAmount: totalAmount,
        PromoCode: couponCode,
        PaymentMethod: 'TailorPay',
      };

      const paymentResponse = await axios.post(paymentEndpoint, paymentData);

      if (paymentResponse.status === 200) {

        const requestEndpoint = 'http://localhost:8000/requests/create';
        const requestData = {
          UserID: user.ID,
          Name: user.Name,
          Desc: description,
          Price: basePrice,
          RequestType: selectedType,
          TailorID: tailorId,
          Status: 'Pending',
          TotalPrice: totalAmount,
        };
        const requestResponse = await axios.post(requestEndpoint, requestData);

        if (requestResponse.status === 201) {
          const requestId = requestResponse.data.ID;
          let endpoint;
          if (selectedType === 'TOTE BAGS') {
            endpoint = `http://localhost:8000/measurements/totebags`;
          } else {
            endpoint = `http://localhost:8000/measurements/${selectedType.toLowerCase()}`;
          }
          const response = await axios.post(endpoint, {
            ...measurements,
            RequestID: requestId,
          });
          if (response.status === 201) {
            navigation.navigate('RequestSent');
          } else {
            console.error(`Unexpected response status: ${response.status}`);
            setErrorMessage('Failed to save measurements');
          }
        } else {
          console.error(`Unexpected response status: ${requestResponse.status}`);
          setErrorMessage('Failed to create request');
        }
      } else {
        setErrorMessage('Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage('Failed to process payment');
    }
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => (
    <TouchableOpacity
      style={styles.couponItem}
      onPress={() => {
        setCouponCode(item.code);
        setModalVisible(false);
      }}
    >
      <Text style={styles.couponCode}>{item.code}</Text>
      <Text style={styles.couponDiscount}>{`${item.discount}K`}</Text>
      <Text style={styles.couponQuantity}>{`Quantity: ${item.quantity}`}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Payment</Text>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressText}>{user.Address}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Options</Text>
          <TouchableOpacity style={styles.shippingOption}>
            <Text style={styles.shippingOptionText}>Standard</Text>
            <Text style={styles.shippingPrice}>10K</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Coupon Code</Text>
          <TouchableOpacity
            style={styles.couponButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.couponButtonText}>{couponCode ? couponCode : "Select Your Coupon"}</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={userCoupons}
                renderItem={renderCouponItem}
                keyExtractor={(item) => item.code}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Options</Text>
          <View style={styles.paymentOption}>
            <Text style={styles.paymentOptionText}>TailorPay</Text>
            <Text style={styles.paymentPrice}>{`IDR ${user.Money}K`}</Text>
          </View>
        </View>
        <View style={styles.priceCalculation}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price</Text>
            <Text style={styles.priceValue}>{basePrice}K</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={styles.priceValue}>-{discount}K</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping Fee</Text>
            <Text style={styles.priceValue}>{shippingFee}K</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalPrice}>{Math.max(basePrice - discount + shippingFee, 0)}K</Text>
      </View>
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Pay</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: width * 0.188,
    paddingBottom: width * 0.08,
    paddingHorizontal: width * 0.02,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: width * 0.085,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#260101',
    marginBottom: 15,
    marginLeft: 85,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#260101',
    marginBottom: 10,
  },
  addressText: {
    fontSize: width * 0.05,
    color: '#333',
  },
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  shippingOptionText: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  shippingPrice: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  couponButton: {
    backgroundColor: '#F3EADE',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  couponButtonText: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  couponItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  couponCode: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  couponDiscount: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  couponQuantity: {
    fontSize: width * 0.035,
    color: '#999',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#D9C3A9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  paymentOptionText: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  paymentPrice: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  priceCalculation: {
    marginVertical: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  priceValue: {
    fontSize: width * 0.045,
    color: '#260101',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  totalText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#260101',
  },
  totalPrice: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#260101',
  },
  payButton: {
    backgroundColor: '#D9C3A9',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: width * 0.2,
  },
  payButtonText: {
    fontSize: width * 0.05,
    color: '#260101',
    fontWeight: 'bold',
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 5,
    borderColor: '#f5c6cb',
    borderWidth: 1,
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#721c24',
    textAlign: 'center',
  },
});

export default RequestPaymentScreen;

