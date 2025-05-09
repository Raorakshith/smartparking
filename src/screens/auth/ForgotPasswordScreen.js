// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { firebaseAuth } from '../../config/firebase';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    // Reset error state
    setError('');
    
    // Validate input
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
      setEmailSent(true);
    } catch (err) {
      console.error('Error sending reset email:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account exists with this email address');
      } else {
        setError('Error sending reset email. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Reset Password</Text>
        
        {emailSent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Password reset email sent!
            </Text>
            <Text style={styles.instructionText}>
              Please check your email inbox for instructions to reset your password.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
            >
              Return to Login
            </Button>
          </View>
        ) : (
          <>
            <Text style={styles.description}>
              Enter your email address below and we'll send you instructions to reset your password.
            </Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!error}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Button
              mode="contained"
              onPress={handlePasswordReset}
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                'Send Reset Link'
              )}
            </Button>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.backContainer}
            >
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#4285F4',
  },
  backContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#4285F4',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34A853',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ForgotPasswordScreen;