// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const checkoutButton = document.getElementById('checkoutButton');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => this.checkout());
        }

        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('show.bs.modal', () => this.updateCartModal());
        }
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateCartCount();
        this.showAddedToCartMessage();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.updateCartModal();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCount = document.querySelector('.badge');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    updateCartModal() {
        const cartItems = document.getElementById('cartItems');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !emptyCartMessage || !cartTotal) return;

        if (this.items.length === 0) {
            cartItems.style.display = 'none';
            emptyCartMessage.style.display = 'block';
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.style.display = 'block';
        emptyCartMessage.style.display = 'none';

        let total = 0;
        cartItems.innerHTML = this.items.map(item => {
            total += item.preco * item.quantity;
            return `
                <div class="cart-item mb-3">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <img src="${item.imagem}" alt="${item.nome}" class="img-fluid rounded">
                        </div>
                        <div class="col-5">
                            <h5 class="mb-1">${item.nome}</h5>
                            <p class="mb-0 text-muted">R$ ${item.preco.toFixed(2)}</p>
                        </div>
                        <div class="col-2">
                            <div class="input-group">
                                <button class="btn btn-outline-secondary btn-sm" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <input type="number" class="form-control form-control-sm text-center" value="${item.quantity}" 
                                    onchange="cart.updateQuantity(${item.id}, this.value)">
                                <button class="btn btn-outline-secondary btn-sm" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <div class="col-2 text-end">
                            <button class="btn btn-danger btn-sm" onclick="cart.removeItem(${item.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        cartTotal.textContent = total.toFixed(2);
    }

    showAddedToCartMessage() {
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="bi bi-check-circle-fill text-success"></i>
                Produto adicionado ao carrinho!
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 2000);
        }, 100);
    }

    checkout() {
        if (this.items.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        
        alert('Redirecionando para o checkout...');
    }
}

// Initialize cart
const cart = new Cart();
