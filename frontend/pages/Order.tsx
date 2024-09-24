import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { useUser } from '../contexts/user-context';
import { ITransaction } from '../interfaces/transaction-interfaces';
import RatingScreen from './RatingScreen';

const OrderScreen: React.FC = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [requests, setRequests] = useState<ITransaction[]>([]);
  const [tailors, setTailors] = useState<{ [key: number]: { Name: string; ImgUrl: string } }>({});
  const [view, setView] = useState<'tailorRequests' | 'productOrders'>('productOrders');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/orders/get-user-order/${user.ID}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/requests/get-user-request/${user.ID}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchTailors = async () => {
    try {
      const response = await axios.get('http://localhost:8000/tailors/get-all');
      const tailorData = response.data.reduce((acc: any, tailor: any) => {
        acc[tailor.ID] = { Name: tailor.Name, ImgUrl: tailor.ImgUrl };
        return acc;
      }, {});
      setTailors(tailorData);
    } catch (error) {
      console.error('Error fetching tailors:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRequests();
    fetchTailors();

    const interval = setInterval(() => {
      fetchOrders();
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const requestTypeMapping: { [key: number]: string } = {
    1: 'Top',
    2: 'Bottom',
    3: 'Dress',
    4: 'Suit',
    5: 'Tote Bag',
  };

  const handleOrderReceived = async (transactionId: number) => {
    try {
      await axios.post(`http://localhost:8000/orders/confirm-received`, { transactionId });
      fetchOrders();
      fetchRequests();
      setSelectedTransactionId(transactionId);
      setRatingModalVisible(true);
    } catch (error) {
      console.error('Error confirming received item:', error);
    }
  };

  const handleRequestReceived = async (transactionId: number) => {
    try {
      await axios.post(`http://localhost:8000/requests/confirm-received`, { transactionId });
      fetchOrders();
      fetchRequests();
      setSelectedTransactionId(transactionId);
      setRatingModalVisible(true);
    } catch (error) {
      console.error('Error confirming received item:', error);
    }
  };

  const renderProductOrderItem = ({ item }: { item: ITransaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionDate}>{new Date(item.TransactionDate).toLocaleDateString()}</Text>
      {item.Products.map(product => (
        <View key={product.ID} style={styles.productContainer}>
          <Image source={{ uri: product.ImgUrl }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.Name}</Text>
            <Text style={styles.productTailorName}>{tailors[item.TailorID]?.Name}</Text>
            <Text style={styles.productSize}>Size: {product.Size}</Text>
            <Text style={styles.productPrice}>IDR {item.TotalPrice}K</Text>
          </View>
        </View>
      ))}
      <Text style={styles.productStatus}>Status: {item.Status}</Text>
      {item.Status === 'Shipping' && (
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={() => handleOrderReceived(item.ID)}
        >
          <Text style={styles.confirmButtonText}>I have received the item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTailorRequestItem = ({ item }: { item: ITransaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionDate}>{new Date(item.TransactionDate).toLocaleDateString()}</Text>
      <View style={styles.tailorContainer}>
        <Image source={{ uri: tailors[item.TailorID]?.ImgUrl }} style={styles.tailorImage} />
        <View style={styles.productDetails}>
          <Text style={styles.tailorName}>{tailors[item.TailorID]?.Name}</Text>
          {item.Requests.map(request => (
            <View key={request.ID} style={styles.requestDetails}>
              <Text style={styles.selectedType}>Clothing Type: {requestTypeMapping[request.RequestType]}</Text>
              <Text style={styles.productDesc}>Description: {request.Desc}</Text>
              <Text style={styles.productPrice}>IDR {item.TotalPrice}K</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.productStatus}>Status: {item.Status}</Text>
      {item.Status === 'Shipping' && (
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={() => handleRequestReceived(item.ID)}
        >
          <Text style={styles.confirmButtonText}>I have received the item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const filteredTransactions = view === 'productOrders' ? transactions : requests;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.toggleButton, view === 'tailorRequests' && styles.activeButton]} onPress={() => setView('tailorRequests')}>
          <Text style={[styles.toggleButtonText, view === 'tailorRequests' && styles.activeButtonText]}>Tailor Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, view === 'productOrders' && styles.activeButton]} onPress={() => setView('productOrders')}>
          <Text style={[styles.toggleButtonText, view === 'productOrders' && styles.activeButtonText]}>Product Orders</Text>
        </TouchableOpacity>
      </View>
      {filteredTransactions.length === 0 ? (
        <Text style={styles.noItemsText}>
          {view === 'productOrders' ? 'No product orders found. Start exploring our products.' : 'No tailor requests found. Make a request and experience our craftsmanship.'}
        </Text>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={view === 'productOrders' ? renderProductOrderItem : renderTailorRequestItem}
          keyExtractor={(item) => item.ID.toString()}
          contentContainerStyle={styles.productsContainer}
        />
      )}
      {ratingModalVisible && selectedTransactionId !== null && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={ratingModalVisible}
          onRequestClose={() => {
            setRatingModalVisible(false);
            setSelectedTransactionId(null);
          }}
        >
          <RatingScreen
            transactionId={selectedTransactionId}
            onClose={() => {
              setRatingModalVisible(false);
              setSelectedTransactionId(null);
            }}
          />
        </Modal>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: width * 0.18,
    paddingBottom: width * 0.02,
    paddingHorizontal: width * 0.085,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
  },
  title: {
    fontSize: width * 0.1,
    fontWeight: 'bold',
    color: '#260101',
    marginLeft: 5,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: '#E4DCD5',
  },
  activeButton: {
    backgroundColor: '#593825',
  },
  toggleButtonText: {
    color: '#260101',
    fontSize: 16,
  },
  activeButtonText: {
    color: 'white',
  },
  noItemsText: {
    fontSize: 20,
    color: '#260101',
    textAlign: 'center',
    marginTop: 20,
  },
  transactionItem: {
    backgroundColor: '#F3EADE',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  transactionDate: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#260101',
    marginBottom: 12,
  },
  tailorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tailorName: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#260101',
    marginBottom: 5,
  },
  selectedType: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#593825',
    marginBottom: 5,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: width * 0.2,
    height: width * 0.23,
    borderRadius: 8,
    marginRight: 15,
  },
  tailorImage: {
    width: width * 0.23,
    height: width * 0.25,
    borderRadius: 8,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  requestDetails: {
    flex: 1,
  },
  productName: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#260101',
  },
  productTailorName: {
    fontSize: width * 0.045,
    fontWeight: '500',
    color: '#260101',
    marginTop: 2,
  },
  productDesc: {
    fontSize: width * 0.04,
    color: '#593825',
  },
  productSize: {
    fontSize: width * 0.043,
    color: '#260101',
    marginTop: 3,
  },
  productPrice: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#260101',
    marginTop: 5,
    marginBottom: 15,
  },
  productStatus: {
    fontSize: width * 0.04,
    color: '#593825',
    textAlign: 'right',
    marginTop: 8,
  },
  requestStatus: {
    fontSize: width * 0.04,
    color: '#593825',
    textAlign: 'right',
  },
  productsContainer: {
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#593825',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderScreen;
