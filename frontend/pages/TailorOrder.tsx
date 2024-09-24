import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useUser } from '../contexts/user-context';
import { ITransaction } from '../interfaces/transaction-interfaces';
import MeasurementDetails from '../components/measurement-detail'

const TailorOrderScreen: React.FC = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [requests, setRequests] = useState<ITransaction[]>([]);
  const [users, setUsers] = useState<{ [key: number]: { Name: string } }>({});
  const [view, setView] = useState<'tailorRequests' | 'productOrders'>('productOrders');
  const [loading, setLoading] = useState(false);
  const [measurementVisibility, setMeasurementVisibility] = useState<{ [key: number]: boolean }>({});

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/orders/get-tailor-order/${user.ID}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/requests/get-tailor-request/${user.ID}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/get-all');
      const userData = response.data.users.reduce((acc: any, user: any) => {
        acc[user.ID] = { Name: user.Name };
        return acc;
      }, {});
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStatusUpdate = async (transactionId: number, newStatus: string, type: 'order' | 'request') => {
    try {
      const endpoint = type === 'order' ? `http://localhost:8000/orders/update-status` : `http://localhost:8000/requests/update-status`;
      await axios.post(endpoint, { transactionId, newStatus });
      fetchOrders();
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  

  useEffect(() => {
    fetchOrders();
    fetchRequests();
    fetchUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchRequests();
      fetchUsers();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleMeasurementVisibility = (requestId: number) => {
    setMeasurementVisibility(prevState => ({
      ...prevState,
      [requestId]: !prevState[requestId]
    }));
  };

  const requestTypeMapping: { [key: number]: string } = {
    1: 'Top',
    2: 'Bottom',
    3: 'Dress',
    4: 'Suit',
    5: 'Tote Bag',
  };

  const renderProductOrderItem = ({ item }: { item: ITransaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionDate}>{new Date(item.TransactionDate).toLocaleDateString()}</Text>
      {item.Products.map(product => (
        <View key={product.ID} style={styles.productContainer}>
          <Image source={{ uri: product.ImgUrl }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.Name}</Text>
            <Text style={styles.productUserName}>Client: {users[item.UserID]?.Name}</Text>
            <Text style={styles.productSize}>Size: {product.Size}</Text>
            <Text style={styles.productPrice}>IDR {product.Price}K</Text>
          </View>
        </View>
      ))}
      <Text style={styles.status}>Status: {item.Status}</Text>
      {item.Status === 'Pending' && (
        <TouchableOpacity 
          style={styles.statusButton} 
          onPress={() => fetchStatusUpdate(item.ID, 'Confirmed', 'order')}
        >
          <Text style={styles.statusButtonText}>Confirm</Text>
        </TouchableOpacity>
      )}
      {item.Status === 'Confirmed' && (
        <TouchableOpacity 
          style={styles.statusButton} 
          onPress={() => fetchStatusUpdate(item.ID, 'Shipping', 'order')}
        >
          <Text style={styles.statusButtonText}>Shipping</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTailorRequestItem = ({ item }: { item: ITransaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionDate}>{new Date(item.TransactionDate).toLocaleDateString()}</Text>
      <View style={styles.tailorContainer}>
        <View style={styles.productDetails}>
          <Text style={styles.userName}>{users[item.UserID]?.Name}</Text>
          {item.Requests.map(request => (
            <View key={request.ID} style={styles.requestDetails}>
              <Text style={styles.selectedType}>Clothing Type: {requestTypeMapping[request.RequestType]}</Text>
              <Text style={styles.productDesc}>Description: {request.Desc}</Text>
              <Text style={styles.requestPrice}>IDR {request.Price}K</Text>
              <TouchableOpacity onPress={() => toggleMeasurementVisibility(request.ID)} style={styles.measurementButton}>
                <Text style={styles.measurementButtonText}>Measurement Details</Text>
                <Image source={require('../assets/downIcon.png')} style={styles.arrowIcon} />
              </TouchableOpacity>
              {measurementVisibility[request.ID] && (
                <MeasurementDetails request={request} />
              )}
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.status}>Status: {item.Status}</Text>
      {item.Status === 'Pending' && (
        <TouchableOpacity 
          style={styles.statusButton} 
          onPress={() => fetchStatusUpdate(item.ID, 'Confirmed', 'request')}
        >
          <Text style={styles.statusButtonText}>Confirm</Text>
        </TouchableOpacity>
      )}
      {item.Status === 'Confirmed' && (
        <TouchableOpacity 
          style={styles.statusButton} 
          onPress={() => fetchStatusUpdate(item.ID, 'In Progress', 'request')}
        >
          <Text style={styles.statusButtonText}>In Progress</Text>
        </TouchableOpacity>
      )}
      {item.Status === 'In Progress' && (
        <TouchableOpacity 
          style={styles.statusButton} 
          onPress={() => fetchStatusUpdate(item.ID, 'Shipping', 'request')}
        >
          <Text style={styles.statusButtonText}>Shipping</Text>
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
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: width * 0.18,
    paddingHorizontal: 30,
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
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: width * 0.05,
    borderRadius: 15,
    backgroundColor: '#E4DCD5',
  },
  activeButton: {
    backgroundColor: '#593825',
  },
  toggleButtonText: {
    color: '#260101',
    fontSize: width * 0.042,
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
  userName: {
    fontSize: width * 0.065,
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
  productUserName: {
    fontSize: width * 0.045,
    fontWeight: '500',
    color: '#260101',
    marginTop: 2,
  },
  productDesc: {
    fontSize: width * 0.05,
    color: '#593825',
    marginTop: 3,
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
  status: {
    fontSize: width * 0.045,
    color: '#593825',
    textAlign: 'right',
  },
  requestPrice: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#260101',
    position: 'absolute',
    top: -65,
    right: 0,
  },
  productsContainer: {
    paddingBottom: 20,
  },
  statusButton: {
    backgroundColor: '#593825',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  measurementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  measurementButtonText: {
    color: '#260101',
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: width * 0.043,
    marginTop: 10,
  },
  measurementDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F3EADE',
    borderRadius: 10,
  },
  arrowIcon: {
    width: 22,
    height: 22,
    tintColor: '#260101',
    marginTop: 10,
  },
});

export default TailorOrderScreen;
