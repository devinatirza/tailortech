import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Modal, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../contexts/user-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { HomeStackParamList } from './HomeStack';
import BackButton from '../components/back-button';

type Navigation = NavigationProp<HomeStackParamList, 'HomeServiceSent'>;

interface Assistant {
  ID: number;
  Name: string;
}

const HomeService: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation<Navigation>();
  const [date, setDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fee = 'IDR 35K';

  useEffect(() => {
    const fetchAssistants = async (selectedDate: Date, selectedTime: Date) => {
      try {
        const response = await axios.get(`http://localhost:8000/assistants/available?date=${selectedDate.toISOString().split('T')[0]}&time=${selectedTime.toTimeString().split(' ')[0]}`);
        setAssistants(response.data);
      } catch (error) {
        console.error('Error fetching assistants:', error);
      }
    };

    fetchAssistants(date, time);
  }, [date, time]);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    const now = new Date();
    const beforeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 3, now.getMinutes());

    if (currentDate < now) {
      setErrorMessage('You cannot book a date in the past.');
      setShowDatePicker(false);
      return;
    }

    if (currentDate < beforeTime) {
      setErrorMessage('Booking must be at least 3 hours from now.');
      setShowDatePicker(false);
      return;
    }

    setShowDatePicker(false);
    setDate(currentDate);
    setErrorMessage('');
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || time;
    const now = new Date();
    const beforeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 3, now.getMinutes());

    if (currentTime < now) {
      setErrorMessage('You cannot book a time in the past.');
      setShowTimePicker(false);
      return;
    }

    if (currentTime < beforeTime) {
      setErrorMessage('Booking must be at least 3 hours from now.');
      setShowTimePicker(false);
      return;
    }

    setShowTimePicker(false);
    setTime(currentTime);
    setErrorMessage('');
  };

  const handleConfirm = async () => {
    if (!selectedAssistant) {
      setErrorMessage('Please select an assistant.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/assistants/booking', {
        UserID: user.ID,
        Date: date.toISOString().split('T')[0],
        Time: time.toTimeString().split(' ')[0],
        AssistantID: selectedAssistant.ID,
        Address: user.Address,
      });

      if (response.status === 200) {
        navigation.navigate('HomeServiceSent');
      } else {
        setErrorMessage(response.data.error || 'Failed to confirm home service');
      }
    } catch (error) {
      console.error('Error confirming home service:', error);
      setErrorMessage('Error confirming home service');
    }
  };

  const renderAssistantItem = ({ item }: { item: Assistant }) => (
    <TouchableOpacity
      style={styles.assistantItem}
      onPress={() => {
        setSelectedAssistant(item);
        setModalVisible(false);
      }}
    >
      <Text style={styles.assistantName}>{item.Name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BackButton/>
      <Text style={styles.title}>Home Service</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date</Text>
        <View style={styles.dateTimeInputContainer}>
          <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.iconContainer}>
            <Icon name="calendar" size={24} color="#401201" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Time</Text>
        <View style={styles.dateTimeInputContainer}>
          <Text style={styles.inputText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.iconContainer}>
            <Icon name="clock-o" size={24} color="#401201" />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Assistant</Text>
        <TouchableOpacity
          style={styles.assistantButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.inputText}>
            {selectedAssistant ? selectedAssistant.Name : "Select Assistant"}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={assistants}
                renderItem={renderAssistantItem}
                keyExtractor={(item) => item.ID.toString()}
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
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          multiline
          value={user.Address}
          editable={false}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fee</Text>
        <Text style={styles.input}>{fee}</Text>
      </View>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: height * 0.089,
    paddingHorizontal: width * 0.1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#401201',
    marginBottom: 30,
    marginLeft: 45,
  },
  formGroup: {
    marginVertical: 10,
  },
  label: {
    fontSize: width * 0.05,
    color: '#401201',
    marginBottom: 5,
  },
  input: {
    fontSize: width * 0.045,
    color: '#401201',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#F3EADE',
  },
  dateTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#F3EADE',
  },
  inputText: {
    fontSize: width * 0.045,
    color: '#401201',
  },
  assistantButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#F3EADE',
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
    alignItems: 'center',
  },
  assistantItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  assistantName: {
    fontSize: width * 0.045,
    color: '#401201',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#D9C3A9',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#401201',
    fontSize: 16,
  },
  confirmButton: {
    marginTop: 40,
    backgroundColor: '#D9C3A9',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.2,
    paddingVertical: 15,
  },
  confirmButtonText: {
    fontSize: width * 0.045,
    color: '#401201',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  iconContainer: {
    marginLeft: 10,
  },
});

export default HomeService;
