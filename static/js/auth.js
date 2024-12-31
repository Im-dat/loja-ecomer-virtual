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
            const userDoc = await getDoc(doc(window.db, 'users', user.uid));
            const userData = userDoc.data();

            loggedInElements.forEach(elem => elem.style.display = 'block');
            loggedOutElements.forEach(elem => elem.style.display = 'none');

            userEmailElement.textContent = userData && userData.firstName ? userData.firstName : user.email;
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
                const formData = getFormData(['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone', 'terms']);
                
                if (!validateRegistrationForm(formData)) return;

                const userCredential = await createUserWithEmailAndPassword(window.auth, formData.email, formData.password);
                const user = userCredential.user;

                await setDoc(doc(window.db, 'users', user.uid), {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    createdAt: new Date().toISOString()
                });

                window.location.href = 'index.html';
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = getFormData(['email', 'password']);
                
                if (!validateLoginForm(formData)) return;

                await signInWithEmailAndPassword(window.auth, formData.email, formData.password);
                
                window.location.href = 'index.html';
            } catch (error) {
                handleAuthError(error);
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

                await setDoc(doc(window.db, 'users', user.uid), {
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: user.email,
                    phone: user.phoneNumber || '',
                    lastLogin: new Date().toISOString()
                }, { merge: true });

                window.location.href = 'index.html';
            } catch (error) {
                showError('Erro ao entrar com Google. Por favor, tente novamente.');
            }
        });
    }
});

function getFormData(fields) {
    const formData = {};
    fields.forEach(field => {
        const element = document.getElementById(field);
        formData[field] = element.type === 'checkbox' ? element.checked : element.value.trim();
    });
    return formData;
}

function validateRegistrationForm(formData) {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
        showError('Por favor, preencha todos os campos.');
        return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
        showError('As senhas não coincidem.');
        return false;
    }
    
    if (formData.password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres.');
        return false;
    }

    if (!formData.terms) {
        showError('Você deve aceitar os termos de uso.');
        return false;
    }

    return true;
}

function validateLoginForm(formData) {
    if (!formData.email || !formData.password) {
        showError('Por favor, preencha todos os campos.');
        return false;
    }
    return true;
}

function handleAuthError(error) {
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
            showError('Erro ao criar conta. Por favor, tente novamente.');
    }
}

export async function signOut() {
    try {
        await window.auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        showError('Erro ao sair. Por favor, tente novamente.');
    }
}
