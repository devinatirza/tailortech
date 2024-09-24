import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TextStyle } from 'react-native';

interface Props extends TextInputProps {
  nameProp: string;
  placeholder: string;
  setNameProp: (value: string) => void;
}

interface Styles{
    inputLine: TextStyle;
    input: TextStyle;
}

const inputStyles = StyleSheet.create<Styles>({
  inputLine: {
    borderBottomColor: '#401201',
    borderBottomWidth: 1,
    width: '100%',
    marginBottom: 10,
  },
  input: {
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});

const StyledText: React.FC<Props> = ({ nameProp, placeholder, setNameProp, ...inputProps }) => {
  return (
    <View style={inputStyles.inputLine}>
      <TextInput
        style={inputStyles.input}
        placeholder={placeholder}
        value={nameProp}
        onChangeText={setNameProp}
        {...inputProps}
      />
    </View>
  );
};


export default StyledText;
