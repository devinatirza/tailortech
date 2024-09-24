import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Image source={require('../assets/back_icon.png')} style={styles.backIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: height * 0.094, 
    left: width * 0.075, 
    zIndex: 1,
  },
  backIcon: {
    width: width * 0.09, 
    height: width * 0.07,
    tintColor: '#260101',
  },
});

export default BackButton;
