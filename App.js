import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  BackHandler,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  NativeBaseProvider,
  Box,
  Input,
  Radio,
  Select,
  Button,
} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {colors} from './color';
import {zipcodes} from './zipcodes';

function App() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [date, setDate] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [selectedColor, setSelectedColor] = useState('black');
  const [gender, setGender] = useState('');
  const [formData, setFormData] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
    watch,
  } = useForm();

  const watchedName = watch('name');
  const watchedEmail = watch('email');

  useEffect(() => {
    watchedName &&
    watchedEmail &&
    mobileNumber &&
    pincode &&
    city &&
    state &&
    gender &&
    date
      ? setCanSubmit(false)
      : setCanSubmit(true);
  }, [
    watchedName,
    watchedEmail,
    mobileNumber,
    pincode,
    city,
    state,
    gender,
    date,
  ]);

  const formatMobileNumber = text => {
    // Remove any non-digit characters from the input
    const formattedText = text.replace(/\D/g, '');

    // Apply the XXXXX-XXXXX format
    const part1 = formattedText.slice(0, 5);
    const part2 = formattedText.slice(5, 10);

    return `${part1}-${part2}`;
  };

  const handleInputChange = text => {
    const formattedNumber = formatMobileNumber(text);
    setValue('mobileNumber', formattedNumber);
    setMobileNumber(formattedNumber);
  };

  const formatDateString = text => {
    // Remove any non-digit characters from the input
    const formattedText = text.replace(/\D/g, '');

    // Apply the DD-MM-YYYY format
    const day = formattedText.slice(0, 2);
    const month = formattedText.slice(2, 4);
    const year = formattedText.slice(4, 8);

    return `${day}-${month}-${year}`;
  };

  const handleDateChange = text => {
    const formattedDate = formatDateString(text);
    setValue('dob', formattedDate);
    setDate(formattedDate);
  };

  const validateDate = text => {
    // Remove any non-digit characters from the input
    const formattedText = text.replace(/\D/g, '');

    // Validate the date format (DD-MM-YYYY)
    const day = formattedText.slice(0, 2);
    const month = formattedText.slice(2, 4);
    const year = formattedText.slice(4, 8);

    const isValid =
      formattedText.length === 8 &&
      parseInt(day) <= 31 &&
      parseInt(month) <= 12 &&
      parseInt(year) <= new Date().getFullYear();

    return isValid;
  };

  const validateName = text => {
    const pattern = /^[a-zA-Z\s']+$/;
    const isValid = pattern.test(text);
    return isValid;
  };

  const validateEmail = text => {
    const pattern =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = pattern.test(text);
    return isValid;
  };

  const handlePincodeChange = text => {
    setPincode(text);
    if (text.length === 3) {
      const matchingPincode = zipcodes.find(data =>
        data.zipcode.includes(text),
      );
      if (matchingPincode) {
        setPincode(matchingPincode.zipcode);
        setCity(matchingPincode.city);
        setState(matchingPincode.state);
      }
    } else {
      setCity('');
      setState('');
    }
  };

  const onSubmit = async data => {
    let savedData = {
      name: data.name,
      email: data.email,
      gender,
      pincode,
      city,
      state,
      date,
    };
    try {
      await AsyncStorage.setItem('myData', JSON.stringify(savedData));
      console.log('Data saved successfully');
    } catch (error) {
      console.log('Error Saving Data >>> ', error);
    }
  };

  const handleColorchange = color => {
    setSelectedColor(color);
  };

  const handleShowData = async () => {
    try {
      let formdata = await AsyncStorage.getItem('myData');
      formdata = JSON.parse(formdata);
      setFormData(formdata);
      console.log('DATA SAVED IS >> ', formdata);
    } catch (err) {
      console.log('Facing error ', err);
    }
  };

  const handleReset = async () => {
    setValue('name', '');
    setValue('email', '');
    setPincode('');
    setMobileNumber('');
    setCity('');
    setState('');
    setDate('');
    setGender('');
    setFormData(null);
    await AsyncStorage.removeItem('myData');
  };
  return (
    <NativeBaseProvider>
      <SafeAreaView style={{flexGrow: 1}}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.formContainer}>
            <Text style={styles.titleStyle}>Name</Text>
            <Controller
              control={control}
              name="name"
              render={({field: {onChange, value}}) => (
                <Input
                  isInvalid={false}
                  invalidOutlineColor={'warning.500'}
                  variant="outline"
                  value={value}
                  onChangeText={value => onChange(value)}
                  style={{
                    color: selectedColor,
                    borderBottomWidth: 1,
                    borderBottomColor: validateName(value) ? 'green' : 'red',
                  }}
                />
              )}
              rules={{
                required: 'Name is required',
                pattern: {
                  value: /^[a-zA-Z\s']+$/,
                  message: 'Invalid name',
                },
              }}
            />

            <Text style={styles.titleStyle}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({field: {onChange, value}}) => (
                <Input
                  style={{
                    color: selectedColor,
                    borderBottomWidth: 1,
                    borderBottomColor: validateEmail(value) ? 'green' : 'red',
                  }}
                  isInvalid={false}
                  invalidOutlineColor={'warning.500'}
                  variant="outline"
                  value={value}
                  onChangeText={value => onChange(value)}
                />
              )}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
            />
            <Text style={styles.titleStyle}>Mobile Number</Text>
            <Controller
              control={control}
              name="mobileNumber"
              render={({field: {onChange, value}}) => (
                <Input
                  style={{color: selectedColor}}
                  variant="outline"
                  keyboardType="numeric"
                  value={mobileNumber}
                  placeholder="XXXXX-XXXXX"
                  onChangeText={handleInputChange}
                  maxLength={11}
                />
              )}
            />

            <Text style={styles.titleStyle}>DOB</Text>
            <Controller
              control={control}
              name="dob"
              render={({field: {onChange, value}}) => (
                <Input
                  type="text"
                  isInvalid={false}
                  invalidOutlineColor={'warning.500'}
                  variant="outline"
                  value={date}
                  keyboardType="numeric"
                  onChangeText={handleDateChange}
                  placeholder="DD-MM-YYYY"
                  style={{
                    // color: selectedColor,
                    borderBottomWidth: 1,
                    borderBottomColor: validateDate(date) ? 'green' : 'red',
                  }}
                  maxLength={10}
                />
              )}
            />

            <Text style={styles.titleStyle}>Gender</Text>
            <Controller
              control={control}
              name="gender"
              render={({field: {onChange, value}}) => (
                <Radio.Group
                  onChange={value => setGender(value)}
                  style={styles.field}>
                  <Radio value="male" style={styles.radio_styles}>
                    Male
                  </Radio>
                  <Radio value="female" style={styles.radio_styles}>
                    Female
                  </Radio>
                </Radio.Group>
              )}
            />

            <Text style={styles.titleStyle}>zipcode</Text>
            <Controller
              control={control}
              name="zipcode"
              render={({field: {onChange, value}}) => (
                <Input
                  isInvalid={false}
                  invalidOutlineColor={'warning.500'}
                  variant="outline"
                  value={pincode}
                  onChangeText={handlePincodeChange}
                  style={{color: selectedColor}}
                />
              )}
            />

            <Text style={styles.titleStyle}>City</Text>
            <Controller
              control={control}
              name="city"
              render={({field: {onChange, value}}) => (
                <Input
                  isInvalid={false}
                  invalidOutlineColor={'warning.500'}
                  variant="outline"
                  value={city}
                  isDisabled={true}
                  style={{color: selectedColor}}
                />
              )}
            />

            <Text style={styles.titleStyle}>State</Text>
            <Controller
              control={control}
              name="state"
              render={({field: {onChange, value}}) => (
                <Input
                  isInvalid={false}
                  invalidOutlineColor={'warning.500'}
                  variant="outline"
                  value={state}
                  isDisabled={true}
                  style={{color: selectedColor}}
                />
              )}
            />

            <Text style={styles.titleStyle}>Choose Color</Text>
            <Select
              placeholder="Colour"
              onValueChange={handleColorchange}
              selectedValue={selectedColor}>
              {colors.map(i => (
                <Select.Item label={i.name} value={i.key} />
              ))}
            </Select>

            <View style={styles.button_styles}>
              <Button
                size="lg"
                colorScheme={'primary'}
                marginTop={5}
                style={styles.button_styles}
                isDisabled={canSubmit}
                onPress={handleSubmit(onSubmit)}>
                Submit
              </Button>
              <Button
                size="lg"
                colorScheme={'primary'}
                marginTop={5}
                onPress={handleShowData}
                isDisabled={formData ? true : false}
                style={styles.button_styles}>
                Show Data
              </Button>
              <Button
                size="lg"
                colorScheme={'primary'}
                marginTop={5}
                isDisabled={formData ? false : true}
                style={styles.button_styles}
                onPress={handleReset}>
                Reset
              </Button>
            </View>

            {formData && (
              <View style={{backgroundColor: 'grey', marginTop: 20}}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  <Text>Name</Text>
                  <Text>{formData?.name}</Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  <Text>Email</Text>
                  <Text>{formData?.email}</Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  <Text>DOB</Text>
                  <Text>{formData?.date}</Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  <Text>Mobile Number</Text>
                  <Text>{formData?.mobileNumber}</Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  <Text>Pincode</Text>
                  <Text>{formData?.pincode}</Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  <Text>City</Text>
                  <Text>{formData?.city}</Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 10,
                  }}>
                  <Text>State</Text>
                  <Text>{formData?.state}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flex: 1,
  },
  formContainer: {
    display: 'flex',
    flex: 3,
    backgroundColor: 'white',
    // borderTopEndRadius: 30,
    // borderTopStartRadius: 30,
    // marginTop: 10,
    padding: 20,
  },
  titleStyle: {
    fontFamily: 'georgia',
    color: '#000',
    marginTop: 10,
    padding: 5,
  },
  input_icon: {
    fontSize: 25,
    marginRight: 10,
    color: '#C4C4C4',
    zIndex: 10,
  },
  button_styles: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radio_styles: {
    margin: 5,
    padding: 10,
  },
});

export default App;
