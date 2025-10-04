// LIA Collections - simple static app with cart and pre-order handling (localStorage)
const PRODUCTS = [
  { id: 'p1', title: 'LIA Classic Tee', price: 199.00, img: 'images/tee.jpg', category: 'collections', preOrder: false },
  { id: 'p2', title: 'LIA Red Cap', price: 89.00, img: 'images/cap.jpg', category: 'accessories', preOrder: true },
  { id: 'p3', title: 'LIA Legends Hoodie', price: 499.00, img: 'images/hoodie.jpg', category: 'legends', preOrder: false },
  { id: 'p4', title: 'LIA Sunglasses', price: 149.00, img: 'images/sunnies.jpg', category: 'accessories', preOrder: true },
  { id: 'p5', title: 'LIA Slim Watch', price: 799.00, img: 'images/watch.jpg', category: 'collections', preOrder: false }
];

// DOM refs
const productsEl = document.getElementById('products');
const cartEl = document.getElementById('cart');
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const preorderOnlyEl = document.getElementById('preorder-only');
const navBtns = document.querySelectorAll('.nav-btn');

let CART = JSON.parse(localStorage.getItem('lia_cart') || '[]');

function renderProducts(filter='all') {
  productsEl.innerHTML = '';
  const showPreOnly = preorderOnlyEl.checked;
  const filtered = PRODUCTS.filter(p => {
    if(showPreOnly && !p.preOrder) return false;
    if(filter === 'all') return true;
    return p.category === filter;
  });
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      ${p.preOrder ? '<div class="preorder-badge">Pre-Order</div>' : ''}
      <img src="${p.img}" alt="${p.title}" />
      <h4>${p.title}</h4>
      <p class="price">R ${p.price.toFixed(2)}</p>
      <p>${p.preOrder ? 'This item is a pre-order. Delivery timeframe applies.' : 'In stock'}</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input type="number" min="1" value="1" class="qty-input" data-id="${p.id}" style="width:64px;padding:6px;border-radius:6px;border:1px solid #ddd"/>
        <button class="add-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    productsEl.appendChild(card);
  });
}

function saveCart(){ localStorage.setItem('lia_cart', JSON.stringify(CART)); updateCartUI(); }
function updateCartUI(){
  cartCountEl.textContent = CART.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  let total = 0;
  CART.forEach(item=>{
    const p = PRODUCTS.find(x=>x.id===item.id);
    total += p.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${p.img}" />
      <div style="flex:1">
        <strong>${p.title}</strong>
        <div>R ${p.price.toFixed(2)} x ${item.qty}</div>
        ${p.preOrder ? '<div style="color:var(--red);font-weight:700;margin-top:4px">Pre-Order</div>' : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
        <button class="qty-btn" data-id="${item.id}" data-op="+" style="padding:6px 8px">+</button>
        <button class="qty-btn" data-id="${item.id}" data-op="-" style="padding:6px 8px">-</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
  cartTotalEl.textContent = total.toFixed(2);
}

function addToCart(id, qty=1){
  const existing = CART.find(i=>i.id===id);
  if(existing){ existing.qty += qty; }
  else CART.push({ id, qty });
  saveCart();
}

document.addEventListener('click', e=>{
  if(e.target.matches('.add-btn')){
    const id = e.target.getAttribute('data-id');
    const input = e.target.parentElement.querySelector('.qty-input');
    const qty = parseInt(input.value) || 1;
    addToCart(id, qty);
    alert('Added to cart');
  }
  if(e.target.matches('#open-cart')){ cartEl.classList.add('open'); updateCartUI(); }
  if(e.target.matches('#close-cart')){ cartEl.classList.remove('open'); }
  if(e.target.matches('.qty-btn')){
    const id = e.target.getAttribute('data-id');
    const op = e.target.getAttribute('data-op');
    const item = CART.find(i=>i.id===id);
    if(!item) return;
    if(op==='+') item.qty += 1;
    else item.qty -= 1;
    if(item.qty <= 0) CART = CART.filter(i=>i.id!==id);
    saveCart();
  }
});

preorderOnlyEl.addEventListener('change', ()=> renderProducts(currentFilter));
let currentFilter = 'all';
navBtns.forEach(btn=>btn.addEventListener('click', e=>{
  currentFilter = e.target.getAttribute('data-filter');
  renderProducts(currentFilter);
}));

checkoutBtn.addEventListener('click', ()=>{
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  if(!name || !email){ alert('Please enter name and email before checkout'); return; }
  // Simulated sandbox checkout: we'll clear cart and redirect to success page
  localStorage.removeItem('lia_cart');
  CART = [];
  updateCartUI();
  // create a simple success query string to show order summary
  const params = new URLSearchParams({ name, email });
  window.location.href = 'success.html?' + params.toString();
});

// initial render
renderProducts();
updateCartUI();
