// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQJ0BtDVdb9wZ0h0Inbhc7LQsjYniDPQc",
    authDomain: "blog-de-noticia.firebaseapp.com",
    projectId: "blog-de-noticia",
    storageBucket: "blog-de-noticia.appspot.com",
    messagingSenderId: "1042727924607",
    appId: "1:1042727924607:web:bd78aa6cee74d8722a604a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db for use in other files
export { auth, db };

// Google Sign In Function
export async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: user.phoneNumber || '',
            lastLogin: new Date().toISOString()
        }, { merge: true });

        return user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
}

// Sign Out Function
export async function signOutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
    const loggedInElements = document.querySelectorAll('.logged-in');
    const loggedOutElements = document.querySelectorAll('.logged-out');
    const userNameDisplay = document.getElementById('userName');
    const userEmailDisplay = document.getElementById('userEmail');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const logoutButton = document.getElementById('logoutButton');

    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);

        // Get user data from Firestore
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userNameDisplay) {
                    userNameDisplay.textContent = `${userData.firstName} ${userData.lastName}`;
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }

        // Update UI elements
        if (userEmailDisplay) {
            userEmailDisplay.textContent = user.email;
        }
        
        // Show/hide elements based on auth state
        loggedInElements.forEach(elem => elem.style.display = 'block');
        loggedOutElements.forEach(elem => elem.style.display = 'none');
        
        if (loginButton) loginButton.style.display = 'none';
        if (registerButton) registerButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        
    } else {
        // User is signed out
        console.log('User is signed out');
        
        // Update UI elements
        if (userNameDisplay) userNameDisplay.textContent = '';
        if (userEmailDisplay) userEmailDisplay.textContent = '';
        
        // Show/hide elements based on auth state
        loggedInElements.forEach(elem => elem.style.display = 'none');
        loggedOutElements.forEach(elem => elem.style.display = 'block');
        
        if (loginButton) loginButton.style.display = 'block';
        if (registerButton) registerButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
    }
});
