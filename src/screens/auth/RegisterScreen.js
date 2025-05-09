// src/screens/auth/RegisterScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Get auth context
  const { register, loading, error } = useAuth();

  // Validate form on input change
  useEffect(() => {
    validateForm();
  }, [name, email, password, confirmPassword, vehicleType, vehicleNumber]);

  // Form validation
  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    // Validate name
    if (!name.trim()) {
      errors.name = 'Name is required';
      formIsValid = false;
    }

    // Validate email
    if (!email.trim()) {
      errors.email = 'Email is required';
      formIsValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Enter a valid email address';
        formIsValid = false;
      }
    }

    // Validate password
    if (!password) {
      errors.password = 'Password is required';
      formIsValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      formIsValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      formIsValid = false;
    }

    // Validate vehicle type
    if (!vehicleType.trim()) {
      errors.vehicleType = 'Vehicle type is required';
      formIsValid = false;
    }

    // Validate vehicle number
    if (!vehicleNumber.trim()) {
      errors.vehicleNumber = 'Vehicle number is required';
      formIsValid = false;
    }

    setErrors(errors);
    setIsFormValid(formIsValid);
  };

  // Handle registration
  const handleRegister = async () => {
    if (!isFormValid) {
      Alert.alert('Form Error', 'Please fix all errors before submitting');
      return;
    }

    const userData = {
      name,
      email,
      vehicleType,
      vehicleNumber,
      bookings: []
    };

    await register(email, password, userData);
    
    // If registration is successful, navigation will be handled by the auth state change
    if (error) {
      Alert.alert('Registration Failed', error);
    } else {
      // Show verification message
      Alert.alert(
        'Verification Email Sent',
        'Please check your email and verify your account before logging in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register to book parking spaces</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            error={!!errors.name}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <TextInput
            label="Vehicle Type (Car, Motorcycle, etc.)"
            value={vehicleType}
            onChangeText={setVehicleType}
            style={styles.input}
            error={!!errors.vehicleType}
          />
          {errors.vehicleType && <Text style={styles.errorText}>{errors.vehicleType}</Text>}

          <TextInput
            label="Vehicle Number / License Plate"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            style={styles.input}
            error={!!errors.vehicleNumber}
          />
          {errors.vehicleNumber && <Text style={styles.errorText}>{errors.vehicleNumber}</Text>}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              'Register'
            )}
          </Button>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: '#4285F4',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#4285F4',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default RegisterScreen;