// src/services/AdminService.js
import { firebaseFirestore } from '../config/firebase';

class AdminService {
  // Collection references
  parkingLotsRef = firebaseFirestore.collection('parkingLots');
  bookingsRef = firebaseFirestore.collection('bookings');
  usersRef = firebaseFirestore.collection('users');
  
  // Get dashboard data
  getDashboardData = async () => {
    try {
      // Get all parking lots
      const parkingLotsSnapshot = await this.parkingLotsRef.get();
      const parkingLots = parkingLotsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get all bookings
      const bookingsSnapshot = await this.bookingsRef
        .orderBy('createdAt', 'desc')
        .limit(50) // Limit to recent bookings for performance
        .get();
      
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate total bookings
      const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
      const totalBookings = confirmedBookings.length;
      
      // Calculate total revenue
      const totalRevenue = calculateTotalRevenue(confirmedBookings);
      
      // Calculate occupancy rate
      const occupancyData = calculateOccupancyData(parkingLots, bookings);
      const overallOccupancyRate = occupancyData.overallOccupancyRate;
      
      // Get weekly booking trend
      const weeklyBookings = getWeeklyBookings(confirmedBookings);
      
      // Get occupancy by lot
      const occupancyByLot = occupancyData.occupancyByLot;
      
      // Get recent bookings with user info
      const recentBookings = await getRecentBookingsWithUserInfo(
        bookings.slice(0, 5)
      );
      
      // Enrich parking lots with occupancy data
      const enrichedParkingLots = parkingLots.map(lot => {
        const lotOccupancy = occupancyByLot.find(o => o.id === lot.id) || {
          occupancyRate: 0,
          occupiedSpots: 0
        };
        
        // Calculate today's revenue for this lot
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const todayBookings = confirmedBookings.filter(booking => {
          const bookingDate = booking.createdAt?.toDate() || new Date();
          return booking.lotId === lot.id && 
                 bookingDate >= todayStart && 
                 bookingDate <= todayEnd;
        });
        
        const lotRevenue = calculateTotalRevenue(todayBookings);
        
        return {
          ...lot,
          occupancyRate: lotOccupancy.occupancyRate,
          occupiedSpots: lotOccupancy.occupiedSpots,
          revenue: lotRevenue
        };
      });
      
      return {
        totalBookings,
        totalRevenue,
        occupancyRate: overallOccupancyRate,
        parkingLots: enrichedParkingLots,
        recentBookings,
        weeklyBookings,
        occupancyByLot
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  };
  
  // Get all users
  getAllUsers = async () => {
    try {
      const snapshot = await this.usersRef.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  };
  
  // Update user role
  updateUserRole = async (userId, role) => {
    try {
      await this.usersRef.doc(userId).update({
        role,
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };
  
  // Add new parking lot
  addParkingLot = async (lotData) => {
    try {
      const lotRef = await this.parkingLotsRef.add({
        ...lotData,
        createdAt: firebaseFirestore.FieldValue.serverTimestamp()
      });
      return lotRef.id;
    } catch (error) {
      console.error('Error adding parking lot:', error);
      throw error;
    }
  };
  
  // Update parking lot
  updateParkingLot = async (lotId, lotData) => {
    try {
      await this.parkingLotsRef.doc(lotId).update({
        ...lotData,
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating parking lot:', error);
      throw error;
    }
  };
  
  // Delete parking lot
  deleteParkingLot = async (lotId) => {
    try {
      // Check if there are any active bookings for this lot
      const bookingsSnapshot = await this.bookingsRef
        .where('lotId', '==', lotId)
        .where('status', '==', 'confirmed')
        .limit(1)
        .get();
      
      if (!bookingsSnapshot.empty) {
        throw new Error('Cannot delete lot with active bookings');
      }
      
      await this.parkingLotsRef.doc(lotId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting parking lot:', error);
      throw error;
    }
  };
  
  // Get all bookings with filtering options
  getBookings = async (filters = {}) => {
    try {
      let query = this.bookingsRef;
      
      // Apply filters if provided
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      
      if (filters.lotId) {
        query = query.where('lotId', '==', filters.lotId);
      }
      
      if (filters.startDate && filters.endDate) {
        const startDate = firebaseFirestore.Timestamp.fromDate(new Date(filters.startDate));
        const endDate = firebaseFirestore.Timestamp.fromDate(new Date(filters.endDate));
        query = query.where('date', '>=', startDate).where('date', '<=', endDate);
      }
      
      // Order by creation date (descending)
      query = query.orderBy('createdAt', 'desc');
      
      // Apply pagination if provided
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const snapshot = await query.get();
      
      // Get bookings
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If user details are requested, fetch them
      if (filters.includeUserDetails) {
        return await getBookingsWithUserInfo(bookings);
      }
      
      return bookings;
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  };
  
  // Generate reports
  generateReport = async (reportType, dateRange) => {
    try {
      switch (reportType) {
        case 'revenue':
          return await this.generateRevenueReport(dateRange);
        case 'occupancy':
          return await this.generateOccupancyReport(dateRange);
        case 'usage':
          return await this.generateUsageReport(dateRange);
        default:
          throw new Error('Invalid report type');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  };
  
  // Generate revenue report
  generateRevenueReport = async (dateRange) => {
    try {
      const { startDate, endDate } = dateRange;
      
      // Get all confirmed bookings in the date range
      const bookingsSnapshot = await this.bookingsRef
        .where('status', '==', 'confirmed')
        .where('date', '>=', firebaseFirestore.Timestamp.fromDate(new Date(startDate)))
        .where('date', '<=', firebaseFirestore.Timestamp.fromDate(new Date(endDate)))
        .get();
      
      const bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get all parking lots
      const lotsSnapshot = await this.parkingLotsRef.get();
      const lots = lotsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate revenue by lot
      const revenueByLot = lots.map(lot => {
        const lotBookings = bookings.filter(booking => booking.lotId === lot.id);
        const revenue = calculateTotalRevenue(lotBookings);
        
        return {
          lotId: lot.id,
          lotName: lot.name,
          revenue,
          bookingsCount: lotBookings.length
        };
      });
      
      // Calculate revenue by date
      const revenueByDate = {};
      
      bookings.forEach(booking => {
        const bookingDate = booking.date.toDate().toISOString().split('T')[0];
        const amount = booking.paymentDetails?.amount || 0;
        
        if (!revenueByDate[bookingDate]) {
          revenueByDate[bookingDate] = {
            date: bookingDate,
            revenue: 0,
            bookingsCount: 0
          };
        }
        
        revenueByDate[bookingDate].revenue += amount;
        revenueByDate[bookingDate].bookingsCount += 1;
      });
      
      // Convert to array and sort by date
      const revenueByDateArray = Object.values(revenueByDate).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      return {
        totalRevenue: calculateTotalRevenue(bookings),
        totalBookings: bookings.length,
        revenueByLot,
        revenueByDate: revenueByDateArray
      };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw error;
    }
  };
  
  // Generate occupancy report
  generateOccupancyReport = async (dateRange) => {
    // Implementation similar to revenue report but focusing on occupancy
    // ...
    
    // Placeholder implementation
    return {
      averageOccupancy: 65,
      occupancyByLot: [],
      occupancyByDate: []
    };
  };
  
  // Generate usage report
  generateUsageReport = async (dateRange) => {
    // Implementation focusing on user behavior and parking lot usage patterns
    // ...
    
    // Placeholder implementation
    return {
      topUsers: [],
      peakHours: [],
      averageDuration: 2.5
    };
  };
}

// Helper function to calculate total revenue from bookings
const calculateTotalRevenue = (bookings) => {
  return bookings.reduce((total, booking) => {
    return total + (booking.paymentDetails?.amount || 0);
  }, 0);
};

// Helper function to calculate occupancy data
const calculateOccupancyData = (parkingLots, bookings) => {
  // Get current date
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Filter bookings for today that are confirmed
  const todayBookings = bookings.filter(booking => {
    const bookingDate = booking.date?.toDate ? booking.date.toDate() : new Date(booking.date);
    const isToday = bookingDate >= startOfDay && bookingDate <= endOfDay;
    return isToday && booking.status === 'confirmed';
  });

  // Calculate occupancy by lot
  const occupancyByLot = parkingLots.map(lot => {
    const lotBookings = todayBookings.filter(booking => booking.lotId === lot.id);
    const occupiedSpots = new Set(lotBookings.map(booking => booking.spotId)).size;
    const totalSpots = lot.totalSpots || 0;
    const occupancyRate = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;
    
    return {
      id: lot.id,
      name: lot.name,
      occupiedSpots,
      totalSpots,
      occupancyRate
    };
  });
  
  // Calculate overall occupancy rate
  const totalOccupiedSpots = occupancyByLot.reduce((total, lot) => total + lot.occupiedSpots, 0);
  const totalSpots = occupancyByLot.reduce((total, lot) => total + lot.totalSpots, 0);
  const overallOccupancyRate = totalSpots > 0 ? Math.round((totalOccupiedSpots / totalSpots) * 100) : 0;
  
  return {
    occupancyByLot,
    overallOccupancyRate
  };
};

// Helper function to get weekly booking trends
const getWeeklyBookings = (bookings) => {
  // Get dates for the past week
  const today = new Date();
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    weekDays.push(day);
  }
  
  // Count bookings for each day
  const bookingCounts = weekDays.map(day => {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    
    const dayBookings = bookings.filter(booking => {
      const bookingDate = booking.createdAt?.toDate() || new Date();
      return bookingDate >= startOfDay && bookingDate <= endOfDay;
    });
    
    return dayBookings.length;
  });
  
  // Format day labels
  const dayLabels = weekDays.map(day => {
    return day.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  return {
    labels: dayLabels,
    datasets: [{
      data: bookingCounts
    }]
  };
};

// Helper function to get recent bookings with user info
const getRecentBookingsWithUserInfo = async (bookings) => {
  if (!bookings.length) return [];
  
  // Get unique user IDs
  const userIds = [...new Set(bookings.map(booking => booking.userId))];
  
  // Fetch user data for those IDs
  const usersSnapshot = await firebaseFirestore.collection('users')
    .where(firebaseFirestore.FieldPath.documentId(), 'in', userIds)
    .get();
  
  const users = {};
  usersSnapshot.docs.forEach(doc => {
    users[doc.id] = doc.data();
  });
  
  // Get unique lot IDs
  const lotIds = [...new Set(bookings.map(booking => booking.lotId))];
  
  // Fetch lot data for those IDs
  const lotsSnapshot = await firebaseFirestore.collection('parkingLots')
    .where(firebaseFirestore.FieldPath.documentId(), 'in', lotIds)
    .get();
  
  const lots = {};
  lotsSnapshot.docs.forEach(doc => {
    lots[doc.id] = doc.data();
  });
  
  // Combine booking data with user and lot info
  return bookings.map(booking => ({
    ...booking,
    userName: users[booking.userId]?.name || 'Unknown User',
    userEmail: users[booking.userId]?.email || 'Unknown Email',
    lotName: lots[booking.lotId]?.name || 'Unknown Lot',
    lotLocation: lots[booking.lotId]?.location || 'Unknown Location'
  }));
};

// Helper function to get all bookings with user info
const getBookingsWithUserInfo = async (bookings) => {
  // Implementation similar to getRecentBookingsWithUserInfo but for all bookings
  // ...
  
  return await getRecentBookingsWithUserInfo(bookings); // Reuse the same function for now
};

export default new AdminService();