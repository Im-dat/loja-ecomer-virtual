// Import Firebase functions
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

import { 
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

// Helper function to show error messages
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
        setTimeout(() => {
            errorMessage.classList.add('d-none');
        }, 5000);
    }
}

// Handle authentication state changes
onAuthStateChanged(window.auth, async (user) => {
    const loggedInElements = document.querySelectorAll('.logged-in');
    const loggedOutElements = document.querySelectorAll('.logged-out');
    const userEmailElement = document.getElementById('userEmail');

    if (user) {
        // User is signed in
        try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(window.db, 'users', user.uid));
            const userData = userDoc.data();

            // Show logged in elements and hide logged out elements
            loggedInElements.forEach(elem => elem.style.display = 'block');
            loggedOutElements.forEach(elem => elem.style.display = 'none');

            // Display user name if available, otherwise display email
            if (userData && userData.firstName) {
                userEmailElement.textContent = `${userData.firstName}`;
            } else {
                userEmailElement.textContent = user.email;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            userEmailElement.textContent = user.email;
        }
    } else {
        // User is signed out
        loggedInElements.forEach(elem => elem.style.display = 'none');
        loggedOutElements.forEach(elem => elem.style.display = 'block');
    }
});

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    // Registration Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get form fields
                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const phone = document.getElementById('phone').value.trim();
                const terms = document.getElementById('terms').checked;
                
                // Validate form
                if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
                    showError('Por favor, preencha todos os campos.');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showError('As senhas não coincidem.');
                    return;
                }
                
                if (password.length < 6) {
                    showError('A senha deve ter pelo menos 6 caracteres.');
                    return;
                }

                if (!terms) {
                    showError('Você deve aceitar os termos de uso.');
                    return;
                }

                // Create user account
                const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
                const user = userCredential.user;

                // Create user profile in Firestore
                await setDoc(doc(window.db, 'users', user.uid), {
                    firstName,
                    lastName,
                    email,
                    phone,
                    createdAt: new Date().toISOString()
                });

                // Redirect to home page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error:', error);
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        showError('Este email já está cadastrado.');
                        break;
                    case 'auth/invalid-email':
                        showError('Email inválido.');
                        break;
                    case 'auth/operation-not-allowed':
                        showError('Operação não permitida.');
                        break;
                    case 'auth/weak-password':
                        showError('Senha muito fraca.');
                        break;
                    default:
                        showError('Erro ao criar conta. Por favor, tente novamente.');
                }
            }
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                
                if (!email || !password) {
                    showError('Por favor, preencha todos os campos.');
                    return;
                }

                // Sign in user
                await signInWithEmailAndPassword(window.auth, email, password);
                
                // Redirect to home page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error:', error);
                switch (error.code) {
                    case 'auth/invalid-email':
                        showError('Email inválido.');
                        break;
                    case 'auth/user-disabled':
                        showError('Esta conta foi desativada.');
                        break;
                    case 'auth/user-not-found':
                        showError('Usuário não encontrado.');
                        break;
                    case 'auth/wrong-password':
                        showError('Senha incorreta.');
                        break;
                    default:
                        showError('Erro ao fazer login. Por favor, tente novamente.');
                }
            }
        });
    }

    // Google Sign In Handler
    const googleSignInBtn = document.getElementById('googleSignIn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(window.auth, provider);
                const user = result.user;

                // Create/update user profile in Firestore
                await setDoc(doc(window.db, 'users', user.uid), {
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: user.email,
                    phone: user.phoneNumber || '',
                    lastLogin: new Date().toISOString()
                }, { merge: true });

                // Redirect to home page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error:', error);
                showError('Erro ao entrar com Google. Por favor, tente novamente.');
            }
        });
    }
});

export async function signOut() {
    try {
        await window.auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        showError('Erro ao sair. Por favor, tente novamente.');
    }
}
