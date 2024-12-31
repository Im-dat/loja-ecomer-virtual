// Dados de exemplo para produtos
const produtos = {
    moveis: [
        {
            id: 1,
            nome: 'Sofá 3 Lugares',
            preco: 1299.99,
            imagem: 'https://placehold.co/600x400/png?text=Sofa',
            descricao: 'Sofá confortável com acabamento em tecido premium'
        },
        {
            id: 2,
            nome: 'Mesa de Jantar',
            preco: 899.99,
            imagem: 'https://placehold.co/600x400/png?text=Mesa',
            descricao: 'Mesa de jantar 6 lugares em madeira maciça'
        },
        {
            id: 3,
            nome: 'Guarda-Roupa',
            preco: 1499.99,
            imagem: 'https://placehold.co/600x400/png?text=Guarda-Roupa',
            descricao: 'Guarda-roupa 6 portas com espelho'
        }
    ],
    eletro: [
        {
            id: 4,
            nome: 'Smart TV 55"',
            preco: 2799.99,
            imagem: 'https://placehold.co/600x400/png?text=Smart+TV',
            descricao: 'Smart TV LED 55" 4K com Wi-Fi'
        },
        {
            id: 5,
            nome: 'Geladeira Frost Free',
            preco: 3499.99,
            imagem: 'https://placehold.co/600x400/png?text=Geladeira',
            descricao: 'Geladeira Frost Free 400L'
        },
        {
            id: 6,
            nome: 'Máquina de Lavar',
            preco: 1899.99,
            imagem: 'https://placehold.co/600x400/png?text=Lavadora',
            descricao: 'Máquina de Lavar 11kg com 12 programas'
        }
    ]
};

// Função para criar card de produto
function criarCardProduto(produto) {
    return `
        <div class="col-md-4 mb-4">
            <div class="product-card">
                <img src="${produto.imagem}" alt="${produto.nome}" class="img-fluid">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="product-price">R$ ${produto.preco.toFixed(2)}</span>
                    <button class="btn btn-primary" onclick="adicionarAoCarrinho(${produto.id})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Função para renderizar produtos
function renderizarProdutos() {
    const moveisContainer = document.getElementById('moveis-container');
    const eletroContainer = document.getElementById('eletro-container');

    if (moveisContainer) {
        moveisContainer.innerHTML = produtos.moveis.map(criarCardProduto).join('');
    }
    if (eletroContainer) {
        eletroContainer.innerHTML = produtos.eletro.map(criarCardProduto).join('');
    }
}

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(produtoId) {
    const produto = [...produtos.moveis, ...produtos.eletro].find(p => p.id === produtoId);
    if (produto) {
        if (typeof cart !== 'undefined') {
            cart.addItem(produto);
        } else {
            alert('Produto adicionado ao carrinho!');
        }
    } else {
        alert('Produto não encontrado.');
    }
}

// Inicializar a página
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos();
});
