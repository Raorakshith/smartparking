// src/services/BookingService.js
import { firebaseFirestore } from '../config/firebase';

class BookingService {
  // Collection references
  parkingLotsRef = firebaseFirestore.collection('parkingLots');
  bookingsRef = firebaseFirestore.collection('bookings');
  usersRef = firebaseFirestore.collection('users');
  
  // Get all parking lots
  getAllParkingLots = async () => {
    try {
      const snapshot = await this.parkingLotsRef.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting parking lots:', error);
      throw error;
    }
  };
  
  // Get a specific parking lot by ID
  getParkingLotById = async (lotId) => {
    try {
      const doc = await this.parkingLotsRef.doc(lotId).get();
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        throw new Error('Parking lot not found');
      }
    } catch (error) {
      console.error('Error getting parking lot:', error);
      throw error;
    }
  };
  
  // Get available parking spots in a lot for a specific date and time
  getAvailableSpots = async (lotId, date, startTime, endTime) => {
    try {
      // Get the parking lot to get all spots
      const parkingLot = await this.getParkingLotById(lotId);
      const allSpots = parkingLot.spots || [];
      
      // Convert date and times to timestamps for comparison
      const bookingDate = new Date(date);
      const startDateTime = new Date(date);
      const endDateTime = new Date(date);
      
      // Parse times (assuming format like "09:00" or "14:30")
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // Find bookings for this date and lot that overlap with the requested time
      const bookingsSnapshot = await this.bookingsRef
        .where('lotId', '==', lotId)
        .where('date', '==', firebaseFirestore.Timestamp.fromDate(bookingDate))
        .get();
      
      const existingBookings = bookingsSnapshot.docs.map(doc => doc.data());
      
      // Filter out booked spots
      const bookedSpotIds = existingBookings
        .filter(booking => {
          const bookingStart = booking.startTime.toDate();
          const bookingEnd = booking.endTime.toDate();
          
          // Check if there is an overlap
          return (
            (startDateTime <= bookingEnd && endDateTime >= bookingStart) ||
            (bookingStart <= endDateTime && bookingEnd >= startDateTime)
          );
        })
        .map(booking => booking.spotId);
      
      // Return available spots (not in bookedSpotIds)
      return allSpots.filter(spot => !bookedSpotIds.includes(spot.id));
    } catch (error) {
      console.error('Error getting available spots:', error);
      throw error;
    }
  };
  
  // Temporarily reserve a spot (5-minute hold)
  temporaryReservation = async (userId, lotId, spotId, date, startTime, endTime) => {
    try {
      // Parse date and times
      const bookingDate = new Date(date);
      const startDateTime = new Date(date);
      const endDateTime = new Date(date);
      
      // Parse times (assuming format like "09:00" or "14:30")
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // Create a temporary reservation that expires in 5 minutes
      const reservationDoc = await this.bookingsRef.add({
        userId,
        lotId,
        spotId,
        date: firebaseFirestore.Timestamp.fromDate(bookingDate),
        startTime: firebaseFirestore.Timestamp.fromDate(startDateTime),
        endTime: firebaseFirestore.Timestamp.fromDate(endDateTime),
        status: 'temporary',
        createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
        expiresAt: firebaseFirestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes from now
      });
      
      return reservationDoc.id;
    } catch (error) {
      console.error('Error creating temporary reservation:', error);
      throw error;
    }
  };
  
  // Confirm a booking after payment
  confirmBooking = async (bookingId, paymentDetails) => {
    try {
      // Get the booking
      const bookingDoc = await this.bookingsRef.doc(bookingId).get();
      
      if (!bookingDoc.exists) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingDoc.data();
      
      // Check if the temporary reservation has expired
      const now = new Date();
      const expiresAt = booking.expiresAt.toDate();
      
      if (now > expiresAt) {
        throw new Error('Reservation has expired. Please try again.');
      }
      
      // Update the booking status to confirmed
      await this.bookingsRef.doc(bookingId).update({
        status: 'confirmed',
        paymentDetails,
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
        expiresAt: null // Remove expiration
      });
      
      // Add this booking to the user's bookings array
      await this.usersRef.doc(booking.userId).update({
        bookings: firebaseFirestore.FieldValue.arrayUnion(bookingId)
      });
      
      return bookingId;
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  };
  
  // Get booking by ID
  getBookingById = async (bookingId) => {
    try {
      const doc = await this.bookingsRef.doc(bookingId).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        throw new Error('Booking not found');
      }
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  };
  
  // Get user's booking history
  getUserBookings = async (userId, status = 'all') => {
    try {
      let query = this.bookingsRef.where('userId', '==', userId);
      
      if (status !== 'all') {
        query = query.where('status', '==', status);
      }
      
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  };
  
  // Cancel a booking
  cancelBooking = async (bookingId, userId) => {
    try {
      const bookingDoc = await this.bookingsRef.doc(bookingId).get();
      
      if (!bookingDoc.exists) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingDoc.data();
      
      // Check if this booking belongs to the user
      if (booking.userId !== userId) {
        throw new Error('Unauthorized');
      }
      
      // Can only cancel if booking status is confirmed and not yet started
      if (booking.status !== 'confirmed') {
        throw new Error('Cannot cancel this booking');
      }
      
      const now = new Date();
      const startTime = booking.startTime.toDate();
      
      if (now > startTime) {
        throw new Error('Cannot cancel a booking that has already started');
      }
      
      // Update booking status
      await this.bookingsRef.doc(bookingId).update({
        status: 'cancelled',
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
      });
      
      return bookingId;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };
  
  // Generate QR code data for a booking
  generateQRCodeData = (bookingId, userId) => {
    // Create a JSON object with the booking data
    // This will be converted to a QR code in the UI
    return JSON.stringify({
      bookingId,
      userId,
      timestamp: new Date().toISOString()
    });
  };
}

export default new BookingService();