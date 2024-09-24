import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

const RequestSent = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'TailorTech' }],
        })
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/TailorTech_ThankYou.png')} style={styles.logo} />
      <Text style={styles.message}>Our tailor will confirm your order shortyly</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D9C3A9',
  },
  logo: {
    width: 230,
    height: 212,
    marginBottom: 3,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#401201',
    paddingHorizontal: 20,
  },
});

export default RequestSent;
