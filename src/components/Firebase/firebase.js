import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
        this.db = app.database();
    }

    // *** Auth API ***

    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);

    // *** User API ***
    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref('users');

    // *** Bookings API ***
    booking = bookingid => this.db.ref(`bookings/${bookingid}`);
    bookings = () => this.db.ref('bookings');

    // *** Routes API ***
    route = uid => this.db.ref(`routes/${uid}`);
    routes = () => this.db.ref('routes');

    // *** Route seats API ***
    seat = seatid => this.db.ref(`seats/${seatid}`);
    seats = () => this.db.ref('seats');

    // *** User preferences API ***
    preference = email_id => this.db.ref(`preferences/${email_id}`);
    preferences = () => this.db.ref('preferences');

}

export default Firebase;
