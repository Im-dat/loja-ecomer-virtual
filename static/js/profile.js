import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

// Helper function to show messages
function showMessage(elementId, message) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
        setTimeout(() => {
            messageElement.classList.add('d-none');
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    showMessage('successMessage', message);
}

// Show error message
function showError(message) {
    showMessage('errorMessage', message);
}

// Load user profile data
async function loadUserProfile(user) {
    try {
        const userDoc = await getDoc(doc(window.db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData) {
            // Update profile form
            document.getElementById('firstName').value = userData.firstName || '';
            document.getElementById('lastName').value = userData.lastName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = userData.phone || '';

            // Update profile header
            document.getElementById('userFullName').textContent = 
                `${userData.firstName} ${userData.lastName}`.trim() || 'Usuário';
            document.getElementById('userEmailProfile').textContent = user.email;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Erro ao carregar perfil. Por favor, tente novamente.');
    }
}

// Handle profile form submission
async function updateProfile(user, formData) {
    try {
        await updateDoc(doc(window.db, 'users', user.uid), {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            updatedAt: new Date().toISOString()
        });

        showSuccess('Perfil atualizado com sucesso!');
        
        // Reload user profile to update the header
        loadUserProfile(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Erro ao atualizar perfil. Por favor, tente novamente.');
    }
}

// Authentication state observer
onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        // Load user profile when authenticated
        await loadUserProfile(user);
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
});

// Setup form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                phone: document.getElementById('phone').value.trim()
            };

            // Validate form
            if (!formData.firstName || !formData.lastName || !formData.phone) {
                showError('Por favor, preencha todos os campos.');
                return;
            }

            const user = window.auth.currentUser;
            if (user) {
                await updateProfile(user, formData);
            } else {
                showError('Usuário não autenticado.');
            }
        });
    }
});
