# Campus Parking Management App

A React Native mobile application for managing campus parking reservations. This application allows users to view available parking spots, make reservations, and administrators to manage the parking inventory.

## Features

### User Features
- User registration and authentication
- View available parking lots on campus
- Check real-time parking spot availability
- Book parking spots for specific dates and times
- Make secure payments
- Receive booking confirmations with QR codes
- View booking history
- Cancel bookings
- Profile management

### Admin Features
- Dashboard with occupancy statistics
- Parking inventory management (add/remove/modify lots and spots)
- View reservation logs and user data
- Generate usage reports
- Handle user support requests
- Configure system parameters (pricing, operating hours)

## Technologies Used

- **React Native**: Cross-platform mobile application development
- **Firebase Authentication**: User registration and login
- **Firebase Firestore**: Database for storing parking lots, spots, and bookings
- **Firebase Cloud Messaging**: Push notifications
- **React Navigation**: Navigation between screens
- **React Native Paper**: UI components library
- **React Native Maps**: For campus map visualization
- **React Native QRCode**: For generating QR codes for parking passes

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- React Native development environment
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/campus-parking-app.git
   cd campus-parking-app
   ```

2. Install the dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Firebase Setup:
   - Create a new Firebase project in the Firebase console
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Set up Cloud Messaging
   - Add an Android/iOS app in the Firebase project settings
   - Download the configuration file (google-services.json for Android, GoogleService-Info.plist for iOS)
   - Place the configuration file in the appropriate directory

4. Update Firebase Configuration:
   - Open `src/config/firebase.js`
   - Replace the placeholders with your Firebase project configuration

5. Running the app:
   ```
   # For Android
   npm run android
   # or
   yarn android

   # For iOS
   npm run ios
   # or
   yarn ios
   ```

## Project Structure

```
campus-parking-app/
├── assets/
│   ├── icons/
│   ├── images/
│   └── fonts/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── admin/
│   │   └── notifications/
│   ├── screens/
│   │   ├── auth/
│   │   ├── user/
│   │   └── admin/
│   ├── navigation/
│   ├── services/
│   ├── utils/
│   ├── context/
│   └── config/
├── App.js
└── package.json
```

## Initial Setup for Administrators

To set up the first admin user:

1. Register a regular user through the app
2. In the Firebase console, navigate to Firestore
3. Find the user document in the "users" collection
4. Update the user's "role" field to "admin"
5. The user will now have access to the admin dashboard on next login

## Database Collections Structure

### users
- id: string (Auto-generated)
- name: string
- email: string
- vehicleType: string
- vehicleNumber: string
- role: string ("user" or "admin")
- bookings: array (booking IDs)
- createdAt: timestamp

### parkingLots
- id: string (Auto-generated)
- name: string
- location: string
- latitude: number
- longitude: number
- totalSpots: number
- hourlyRate: number
- spots: array (spot objects)
- isActive: boolean
- createdAt: timestamp

### bookings
- id: string (Auto-generated)
- userId: string
- lotId: string
- spotId: string
- date: timestamp
- startTime: timestamp
- endTime: timestamp
- status: string ("temporary", "confirmed", "cancelled")
- paymentDetails: object
- createdAt: timestamp
- expiresAt: timestamp (for temporary reservations)

## License

This project is licensed under the MIT License.

## Acknowledgements

This project was created as a BCA final year project.