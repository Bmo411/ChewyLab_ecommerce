"use strict";

const API_URL = 'http://localhost:3000/api';
const path = window.location.pathname;

// Variables Globales
let globalProducts = [];
let currentFilter = 'all';      // 'all', 'new', 'sale'
let currentSort = 'featured';   // 'featured', 'price-low', 'price-high', 'newest'

// Control de Sesión
const currentUser = localStorage.getItem('currentUser');       // Email
const currentUserName = localStorage.getItem('currentUserName'); // Nombre

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    updateCartBadge();

    // Router básico
    if (path.includes('shoppingcart.html')) {
        loadShoppingCart();
    } else if (path.includes('colections.html') || path.includes('mainpage.html')) {
        // Solo cargar si existe el contenedor de productos o galería
        if (document.querySelector('.products-grid') || document.querySelector('.mini-gallery')) {
            loadCollection();
        }
    }
});

/* =========================================
   1. GESTIÓN DE SESIÓN Y NAVBAR
   ========================================= */
function checkLoginState() {
    const userDropdown = document.getElementById('navbarDropdown');
    
    // Obtenemos los datos guardados
    const currentUser = localStorage.getItem('currentUser');
    const currentUserName = localStorage.getItem('currentUserName');
    const currentUserRole = localStorage.getItem('currentUserRole'); // <--- NUEVO
    
    if (currentUser && userDropdown) {
        // 1. Cambiar texto por nombre de usuario
        userDropdown.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUserName}`;
        
        // 2. Modificar el menú desplegable
        const menu = userDropdown.nextElementSibling; // Es el <div> con clase .dropdown-menu
        
        if(menu) {
            let menuContent = '';

            // Si es ADMIN, agregamos el botón del panel
            if (currentUserRole === 'admin') {
                menuContent += `
                    <a class="dropdown-item" href="admin.html" style="color: #3EB8A8; font-weight: bold;">
                        <i class="fas fa-tools"></i> Panel Admin
                    </a>
                    <div class="dropdown-divider"></div>
                `;
            }

            // Agregamos el botón de Cerrar Sesión (siempre va)
            menuContent += `
                <a class="dropdown-item" href="#" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                </a>
            `;

            menu.innerHTML = menuContent;
        }
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('rottenCart'); // Opcional: limpiar carrito local al salir
    window.location.reload();
}

/* =========================================
   2. COLECCIONES: CARGA, FILTROS Y ORDENAMIENTO
   ========================================= */
async function loadCollection() {
    try {
        const response = await fetch(`${API_URL}/products`);
        globalProducts = await response.json();

        // Si estamos en collections.html, configuramos los filtros
        if (document.querySelector('.filter-bar')) {
            setupFiltersAndSort();
            applyFilters(); // Renderiza con filtros aplicados
        } else {
            // Si estamos en home, renderizamos tal cual (o lógica personalizada)
            renderGrid(globalProducts);
        }

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

function setupFiltersAndSort() {
    // A. Botones de Filtro
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Quitar active de todos y poner al actual
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Actualizar estado y aplicar
            currentFilter = e.target.getAttribute('data-filter');
            applyFilters();
        });
    });

    // B. Dropdown de Ordenamiento
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }
}

function applyFilters() {
    // 1. Crear copia para no mutar el original
    let filteredProducts = [...globalProducts];

    // 2. Filtrar
    if (currentFilter === 'new') {
        filteredProducts = filteredProducts.filter(p => p.isNew === true);
    } else if (currentFilter === 'sale') {
        filteredProducts = filteredProducts.filter(p => p.oldPrice != null);
    }

    // 3. Ordenar
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            // Pone los isNew primero
            filteredProducts.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
            break;
        default: // 'featured'
            // No hacemos sort específico, mantiene orden del JSON
            break;
    }

    // 4. Renderizar
    renderGrid(filteredProducts);
}

function renderGrid(productsList) {
    const container = document.querySelector('.products-grid');
    const countLabel = document.querySelector('.product-count');

    if (!container) return;

    // Actualizar contador
    if (countLabel) countLabel.textContent = `${productsList.length} Productos`;

    container.innerHTML = ''; // Limpiar

    if (productsList.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><h3 class="text-white">No se encontraron productos.</h3></div>';
        return;
    }

    productsList.forEach(product => {
        container.innerHTML += createProductCard(product);
    });
}

function createProductCard(product) {
    let badge = '';
    if (product.oldPrice) badge = '<div class="product-badge sale">OFERTA</div>';
    else if (product.isNew) badge = '<div class="product-badge new">NUEVO</div>';

    let priceHtml = `<span class="price">$${product.price}</span>`;
    if (product.oldPrice) {
        priceHtml += `<span class="price-old ml-2">$${product.oldPrice}</span>`;
    }

    return `
    <div class="product-card">
        ${badge}
        <div class="product-image-wrapper">
            <img src="${product.image}" alt="${product.title}" class="product-img">
            <div class="product-quick-view">
                <button class="btn-quick-view" 
                        data-toggle="modal" 
                        data-target="#quickViewModal"
                        onclick="openQuickView('${product.uuid}')">
                    Vista Rápida
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-category">${product.category}</p>
            <div class="product-price">${priceHtml}</div>
        </div>
    </div>`;
}

// --- MODAL VISTA RÁPIDA ---
function openQuickView(productId) {
    const product = globalProducts.find(p => p.uuid === productId);
    if (!product) return;

    const modalImg = document.getElementById("product-img-modal");
    const modalTitle = document.querySelector(".details-modal h1");
    const modalPrice = document.querySelector(".details-modal h2");
    const modalDesc = document.querySelector(".details-modal p");
    const btnAddToCart = document.querySelector(".details-modal .btn-add-to-cart-modal");

    // Llenar datos
    if(modalImg) modalImg.src = product.image;
    if(modalTitle) modalTitle.textContent = product.title;
    if(modalDesc) modalDesc.textContent = product.description;
    
    if (modalPrice) {
        if (product.oldPrice) {
            modalPrice.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">$${product.oldPrice}</span> $${product.price}`;
        } else {
            modalPrice.textContent = `$${product.price}`;
        }
    }

    // CLONAR BOTÓN para eliminar eventos anteriores (bug fix importante)
    if(btnAddToCart) {
        const newBtn = btnAddToCart.cloneNode(true);
        btnAddToCart.parentNode.replaceChild(newBtn, btnAddToCart);
        
        newBtn.onclick = (e) => {
            e.preventDefault();
            // Obtener talla y cantidad
            const sizeInput = document.querySelector('input[name="size-modal"]:checked');
            const size = sizeInput ? sizeInput.value : 'M';
            const qtyInput = document.querySelector('.quantity-select-modal input');
            const qty = qtyInput ? qtyInput.value : 1;
    
            addToCart(product.uuid, qty, size);
            
            // Cerrar modal usando jQuery (Bootstrap 4)
            $('#quickViewModal').modal('hide');
        };
    }
}

/* =========================================
   3. LÓGICA DE CARRITO (HÍBRIDA)
   ========================================= */

async function addToCart(productId, quantity, size) {
    if (currentUser) {
        // --- MODO USUARIO (API) ---
        try {
            const res = await fetch(`${API_URL}/cart/${currentUser}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productUuid: productId, quantity, size })
            });
            if(res.ok) {
                alert("Producto añadido a tu cuenta.");
                updateCartBadge();
            } else {
                alert("Error al guardar en el servidor.");
            }
        } catch (e) { console.error(e); }

    } else {
        // --- MODO INVITADO (LocalStorage) ---
        let cart = JSON.parse(localStorage.getItem('rottenCart')) || [];
        const existingItem = cart.find(item => item.id === productId && item.size === size);

        if (existingItem) {
            existingItem.quantity = parseInt(existingItem.quantity) + parseInt(quantity);
        } else {
            cart.push({ id: productId, quantity: parseInt(quantity), size: size });
        }
        localStorage.setItem('rottenCart', JSON.stringify(cart));
        alert("Añadido al carrito (Invitado)");
        updateCartBadge();
    }
}

async function updateCartBadge() {
    let totalItems = 0;

    if (currentUser) {
        try {
            const res = await fetch(`${API_URL}/cart/${currentUser}`);
            const cart = await res.json();
            totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
        } catch(e) { console.error(e); }
    } else {
        const cart = JSON.parse(localStorage.getItem('rottenCart')) || [];
        totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    }

    // Actualizar badges en el DOM
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => b.textContent = totalItems);
    
    // Crear badge si no existe en el ícono
    const iconContainer = document.querySelector('.fa-shopping-cart');
    if (iconContainer && badges.length === 0 && totalItems > 0) {
        const span = document.createElement('span');
        span.className = 'cart-badge';
        span.style.cssText = 'position: absolute; top: -8px; right: -10px; background: #5B3A7B; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;';
        span.textContent = totalItems;
        iconContainer.parentElement.style.position = 'relative';
        iconContainer.parentElement.appendChild(span);
    }
}

async function removeFromCart(productId, size) {
    if (currentUser) {
        await fetch(`${API_URL}/cart/${currentUser}/${productId}/${size}`, { method: 'DELETE' });
    } else {
        let cart = JSON.parse(localStorage.getItem('rottenCart')) || [];
        cart = cart.filter(item => !(item.id === productId && item.size === size));
        localStorage.setItem('rottenCart', JSON.stringify(cart));
    }
    
    if (path.includes('shoppingcart.html')) loadShoppingCart();
    updateCartBadge();
}

async function updateQuantity(productId, size, newQty) {
    if (newQty < 1) return;

    if (currentUser) {
        await fetch(`${API_URL}/cart/${currentUser}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ productUuid: productId, size, quantity: newQty })
        });
    } else {
        let cart = JSON.parse(localStorage.getItem('rottenCart')) || [];
        const item = cart.find(item => item.id === productId && item.size === size);
        if (item) {
            item.quantity = parseInt(newQty);
            localStorage.setItem('rottenCart', JSON.stringify(cart));
        }
    }
    
    // Recargar vista para actualizar subtotales
    loadShoppingCart(); 
    updateCartBadge();
}

/* =========================================
   4. PÁGINA DEL CARRITO (SHOPPINGCART.HTML)
   ========================================= */
async function loadShoppingCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-secondary" role="status"></div></div>';

    let cartItems = [];
    
    try {
        if (currentUser) {
            // USUARIO: Pedimos carrito directo a la API
            const res = await fetch(`${API_URL}/cart/${currentUser}`);
            cartItems = await res.json(); 
        } else {
            // INVITADO: Cruzamos LocalStorage con la lista de Productos
            const localCart = JSON.parse(localStorage.getItem('rottenCart')) || [];
            
            if (localCart.length > 0) {
                const resProducts = await fetch(`${API_URL}/products`);
                const allProducts = await resProducts.json();
                
                cartItems = localCart.map(item => {
                    const p = allProducts.find(prod => prod.uuid === item.id);
                    if(!p) return null;
                    return {
                        productUuid: item.id,
                        title: p.title,
                        price: p.price,
                        image: p.image,
                        quantity: item.quantity,
                        size: item.size
                    };
                }).filter(i => i !== null);
            }
        }

        renderCartItems(cartItems, container);

    } catch (error) {
        console.error("Error cargando carrito:", error);
        container.innerHTML = '<div class="alert alert-danger">Error cargando el carrito.</div>';
    }
}

function renderCartItems(cartItems, container) {
    if (cartItems.length === 0) {
        container.innerHTML = '<div class="alert alert-info text-center">Tu carrito está vacío. <br><a href="colections.html" class="btn btn-checkout mt-3">Ir a Colecciones</a></div>';
        updateTotals(0);
        return;
    }

    container.innerHTML = '';
    let grandTotal = 0;

    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        container.innerHTML += `
        <div class="d-flex product-item mb-4 pb-3 border-bottom">
            <img src="${item.image}" alt="${item.title}" class="product-image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
            <div class="flex-grow-1 ml-3">
                <h5 class="mb-1" style="color: #000;">${item.title}</h5>
                <small class="text-muted" style="color: #333 !important;">Talla: <strong>${item.size}</strong></small>
                <div class="d-flex align-items-center mt-2">
                    <small class="mr-2" style="color: #333 !important;">Cant:</small>
                    <input type="number" class="form-control form-control-sm" 
                           value="${item.quantity}" min="1" style="width: 60px"
                           onchange="updateQuantity('${item.productUuid}', '${item.size}', this.value)">
                </div>
            </div>
            <div class="text-right ml-3 product-price">
                <span class="sale-price" style="color: #5B3A7B; font-weight: bold; font-size: 1.1rem;">$${itemTotal.toFixed(2)}</span>
            </div>
            <button class="btn btn-remove ml-3" style="color: #dc3545;" onclick="removeFromCart('${item.productUuid}', '${item.size}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        `;
    });

    updateTotals(grandTotal);
}

function updateTotals(subtotal) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    
    if(subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if(totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}