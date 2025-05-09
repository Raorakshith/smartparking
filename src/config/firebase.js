// src/config/firebase.js
import React from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import app from '@react-native-firebase/app';

// Your Firebase configuration
// Replace with your actual Firebase project configuration when implementing
const firebaseConfig = {
  apiKey: "AIzaSyCld-yUDgkz1OD_qRkmWNNdODYiY3M6zr4",
  authDomain: "ambaarijewels-8f525.firebaseapp.com",
  projectId: "ambaarijewels-8f525",
  storageBucket: "ambaarijewels-8f525.firebasestorage.app",
  messagingSenderId: "710285686087",
  appId: "1:710285686087:web:7e0996887ff47118760862",
  measurementId: "G-P8L6FLRXCZ"
};

// Initialize Firebase if it hasn't been initialized
if (!app().apps.length) {
  app().initializeApp(firebaseConfig);
}

// Export the services
export const firebaseAuth = auth();
export const firebaseFirestore = firestore();
export const firebaseStorage = storage();
export const firebaseFunctions = functions();
export const firebaseMessaging = messaging();

// Helper functions for authentication
export const signIn = async (email, password) => {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signUp = async (email, password, userData) => {
  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    
    // Store additional user data in Firestore
    await firebaseFirestore.collection('users').doc(userCredential.user.uid).set({
      ...userData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      role: 'user' // Default role
    });
    
    // Send email verification
    await userCredential.user.sendEmailVerification();
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseAuth.signOut();
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Helper function for checking current user
export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};

// Helper function for notification permissions
export const requestNotificationPermission = async () => {
  const authStatus = await firebaseMessaging.requestPermission();
  const enabled = 
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
  if (enabled) {
    console.log('Notification permissions granted');
    const token = await firebaseMessaging.getToken();
    return token;
  } else {
    console.log('Notification permissions denied');
    return null;
  }
};