// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  firebaseAuth, 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  firebaseFirestore 
} from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // Fetch user details from Firestore
        try {
          const userDoc = await firebaseFirestore.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            setUserDetails(userDoc.data());
          } else {
            console.log('No user details found in Firestore');
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      } else {
        setUserDetails(null);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // User registration
  const register = async (email, password, userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await signUp(email, password, userData);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Registration successful
        setCurrentUser(result.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // User login
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error);
      } else {
        // Login successful
        setCurrentUser(result.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // User logout
  const logout = async () => {
    setError(null);
    
    try {
      const result = await signOut();
      
      if (result.error) {
        setError(result.error);
      } else {
        // Logout successful
        setCurrentUser(null);
        setUserDetails(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    setError(null);
    setLoading(true);
    
    if (!currentUser) {
      setError('No authenticated user');
      setLoading(false);
      return;
    }
    
    try {
      // Update Firestore
      await firebaseFirestore.collection('users').doc(currentUser.uid).update({
        ...data,
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
      });
      
      // Update local state
      setUserDetails(prevDetails => ({
        ...prevDetails,
        ...data
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return userDetails?.role === 'admin';
  };

  const value = {
    currentUser,
    userDetails,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;