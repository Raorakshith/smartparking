// src/screens/auth/VerificationScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { firebaseAuth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const VerificationScreen = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Email from route params or current user
  const email = route.params?.email || currentUser?.email || '';

  // Start countdown for resend button
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle email verification check
  const checkEmailVerification = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user found. Please log in again.');
      navigation.navigate('Login');
      return;
    }
    
    setLoading(true);
    
    try {
      // Reload user data from server
      await currentUser.reload();
      const updatedUser = firebaseAuth.currentUser;
      
      if (updatedUser.emailVerified) {
        Alert.alert(
          'Success',
          'Your email has been verified!',
          [
            {
              text: 'Proceed to Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
Alert.alert('Not Verified', 'Your email is not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      Alert.alert('Error', 'Failed to check verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification email
  const resendVerificationEmail = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user found. Please log in again.');
      navigation.navigate('Login');
      return;
    }
    
    setLoading(true);
    
    try {
      await currentUser.sendEmailVerification();
      Alert.alert('Success', 'Verification email sent again. Please check your inbox.');
      
      // Reset countdown
      setCanResend(false);
      setCountdown(60);
      
      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error resending verification email:', error);
      Alert.alert('Error', 'Failed to resend verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>
        </View>
        
        <Text style={styles.title}>Verify Your Email</Text>
        
        <Text style={styles.description}>
          We've sent a verification link to:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <Text style={styles.instructions}>
          Please check your email inbox and click on the verification link to activate your account.
        </Text>
        
        <Button
          mode="contained"
          onPress={checkEmailVerification}
          style={styles.button}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            'I\'ve Verified My Email'
          )}
        </Button>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the email?</Text>
          
          {canResend ? (
            <TouchableOpacity onPress={resendVerificationEmail} disabled={loading}>
              <Text style={styles.resendLink}>Resend Verification Email</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>
              Resend in {countdown}s
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backContainer}
        >
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 40,
    color: '#34A853',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4285F4',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#4285F4',
    marginBottom: 16,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 14,
    color: '#999',
  },
  backContainer: {
    marginTop: 24,
  },
  backText: {
    fontSize: 16,
    color: '#4285F4',
  },
});

export default VerificationScreen;