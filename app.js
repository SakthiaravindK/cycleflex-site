// ------------------------------
// DATA
// ------------------------------
const products = [
  {
    id: "vx-001",
    name: "Endurance Gel Shorts",
    price: 1299,
    rating: 4.7,
    tag: "gel",
    stock: "In stock • Ships in 24 hrs",
    img: "assets/shorts-1.jpg",
    desc: "High-density gel chamois built for endurance rides. Flatlock seams reduce chafing and irritation.",
    sizes: ["S","M","L","XL","XXL"]
  },
  {
    id: "vx-002",
    name: "Bib Shorts Pro",
    price: 1899,
    rating: 4.8,
    tag: "bib",
    stock: "In stock • Limited pieces",
    img: "assets/shorts-2.jpg",
    desc: "Bib strap support keeps everything stable. Breathable panels with strong compression fit.",
    sizes: ["S","M","L","XL"]
  },
  {
    id: "vx-003",
    name: "Compression Ride Shorts",
    price: 1499,
    rating: 4.6,
    tag: "compression",
    stock: "In stock",
    img: "assets/shorts-3.jpg",
    desc: "Firm compression support, sweat-wicking fabric, and anti-roll leg grippers for steady rides.",
    sizes: ["S","M","L","XL","XXL"]
  },
  {
    id: "vx-004",
    name: "Lightweight Summer Shorts",
    price: 999,
    rating: 4.4,
    tag: "lightweight",
    stock: "In stock • Best for hot weather",
    img: "assets/shorts-4.jpg",
    desc: "Ultra breathable feel for warm climates. Great for daily commuting and short rides.",
    sizes: ["S","M","L","XL"]
  }
];

const INR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// ------------------------------
// STATE
// ------------------------------
let state = {
  filterTag: "all",
  sort: "featured",
  search: "",
  cart: loadCart(),
  coupon: null, // { code, percent }
  theme: loadTheme()
};

let modalState = {
  product: null,
  size: null,
  qty: 1
};

// ------------------------------
// ELEMENTS
// ------------------------------
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const tagSelect = document.getElementById("tagSelect");

const productModal = document.getElementById("productModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalRating = document.getElementById("modalRating");
const modalTag = document.getElementById("modalTag");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalStock = document.getElementById("modalStock");
const sizeButtons = document.getElementById("sizeButtons");
const qtyInput = document.getElementById("qtyInput");
const qtyMinus = document.getElementById("qtyMinus");
const qtyPlus = document.getElementById("qtyPlus");
const addToCartBtn = document.getElementById("addToCartBtn");

const cartDrawer = document.getElementById("cartDrawer");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");
const subtotalText = document.getElementById("subtotalText");
const discountText = document.getElementById("discountText");
const totalText = document.getElementById("totalText");
const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutBackdrop = document.getElementById("checkoutBackdrop");
const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
const checkoutForm = document.getElementById("checkoutForm");
const payTotal = document.getElementById("payTotal");
const orderMsg = document.getElementById("orderMsg");

const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterMsg = document.getElementById("newsletterMsg");

const year = document.getElementById("year");
const themeBtn = document.getElementById("themeBtn");
const burgerBtn = document.getElementById("burgerBtn");
const nav = document.getElementById("nav");

// ------------------------------
// INIT
// ------------------------------
year.textContent = new Date().getFullYear();
applyTheme(state.theme);
renderProducts();
renderCart();

// ------------------------------
// RENDER PRODUCTS
// ------------------------------
function getFilteredProducts(){
  let list = [...products];

  // filter tag
  if(state.filterTag !== "all"){
    list = list.filter(p => p.tag === state.filterTag);
  }

  // search
  if(state.search.trim()){
    const q = state.search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    );
  }

  // sort
  if(state.sort === "priceLow") list.sort((a,b) => a.price - b.price);
  if(state.sort === "priceHigh") list.sort((a,b) => b.price - a.price);
  if(state.sort === "ratingHigh") list.sort((a,b) => b.rating - a.rating);

  return list;
}

function renderProducts(){
  const list = getFilteredProducts();

  if(!list.length){
    productGrid.innerHTML = `<div class="muted">No products found. Try another search.</div>`;
    return;
  }

  productGrid.innerHTML = list.map(p => `
    <article class="card">
      <div class="img">
        <img src="${p.img}" alt="${escapeHtml(p.name)}"/>
      </div>
      <div class="body">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="meta">
          <div class="stars">${stars(p.rating)}</div>
          <div class="tag">${escapeHtml(p.tag.toUpperCase())}</div>
        </div>
        <div style="height:10px"></div>
        <div class="meta">
          <div class="price">${INR(p.price)}</div>
          <div class="muted small">${p.stock}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-view="${p.id}">View</button>
        <button class="btn primary" data-quick="${p.id}">Quick Add</button>
      </div>
    </article>
  `).join("");

  // bind buttons
  productGrid.querySelectorAll("[data-view]").forEach(btn=>{
    btn.addEventListener("click", () => openProduct(btn.dataset.view));
  });
  productGrid.querySelectorAll("[data-quick]").forEach(btn=>{
    btn.addEventListener("click", () => quickAdd(btn.dataset.quick));
  });
}

function stars(rating){
  const full = Math.floor(rating);
  const half = (rating - full) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "☆" : "") + "✩".repeat(empty);
}

// ------------------------------
// PRODUCT MODAL
// ------------------------------
function openProduct(id){
  const p = products.find(x => x.id === id);
  if(!p) return;

  modalState.product = p;
  modalState.size = p.sizes.includes("M") ? "M" : p.sizes[0];
  modalState.qty = 1;

  modalImg.src = p.img;
  modalTitle.textContent = p.name;
  modalRating.textContent = stars(p.rating);
  modalTag.textContent = `• ${p.tag.toUpperCase()}`;
  modalDesc.textContent = p.desc;
  modalPrice.textContent = INR(p.price);
  modalStock.textContent = p.stock;

  qtyInput.value = modalState.qty;

  sizeButtons.innerHTML = p.sizes.map(s => `
    <button class="size-btn ${s === modalState.size ? "active" : ""}" data-size="${s}">
      ${s}
    </button>
  `).join("");

  sizeButtons.querySelectorAll("[data-size]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      modalState.size = btn.dataset.size;
      sizeButtons.querySelectorAll(".size-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  showModal(productModal);
}

function closeProduct(){
  hideModal(productModal);
}

qtyMinus.addEventListener("click", ()=>{
  modalState.qty = Math.max(1, Number(qtyInput.value || 1) - 1);
  qtyInput.value = modalState.qty;
});
qtyPlus.addEventListener("click", ()=>{
  modalState.qty = Math.min(99, Number(qtyInput.value || 1) + 1);
  qtyInput.value = modalState.qty;
});
qtyInput.addEventListener("input", ()=>{
  let v = Number(qtyInput.value || 1);
  if(!Number.isFinite(v) || v < 1) v = 1;
  if(v > 99) v = 99;
  modalState.qty = v;
  qtyInput.value = v;
});

addToCartBtn.addEventListener("click", ()=>{
  const p = modalState.product;
  if(!p) return;
  addToCart(p.id, modalState.size, modalState.qty);
  closeProduct();
  openCart();
});

closeModalBtn.addEventListener("click", closeProduct);
modalBackdrop.addEventListener("click", closeProduct);

// ------------------------------
// CART
// ------------------------------
function cartKey(pid, size){ return `${pid}__${size}`; }

function addToCart(productId, size, qty){
  const p = products.find(x => x.id === productId);
  if(!p) return;

  const key = cartKey(productId, size);
  const existing = state.cart[key];

  state.cart[key] = {
    productId,
    size,
    qty: (existing?.qty || 0) + qty
  };

  saveCart();
  renderCart();
}

function quickAdd(productId){
  const p = products.find(x => x.id === productId);
  if(!p) return;
  const defaultSize = p.sizes.includes("M") ? "M" : p.sizes[0];
  addToCart(productId, defaultSize, 1);
  openCart();
}

function removeFromCart(key){
  delete state.cart[key];
  saveCart();
  renderCart();
}

function updateQty(key, delta){
  const item = state.cart[key];
  if(!item) return;

  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
}

function renderCart(){
  const keys = Object.keys(state.cart);
  cartCount.textContent = keys.reduce((acc,k)=>acc + state.cart[k].qty, 0);

  if(!keys.length){
    cartItems.innerHTML = `
      <div class="muted">Your cart is empty. Add a pair and start riding 🚴‍♂️</div>
    `;
    setTotals(0,0);
    return;
  }

  cartItems.innerHTML = keys.map(key=>{
    const item = state.cart[key];
    const p = products.find(x => x.id === item.productId);
    if(!p) return "";

    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${escapeHtml(p.name)}"/>
        <div>
          <div class="row">
            <h4>${escapeHtml(p.name)}</h4>
            <strong>${INR(p.price * item.qty)}</strong>
          </div>
          <div class="muted small">Size: ${item.size} • ${INR(p.price)} each</div>

          <div class="cart-actions">
            <button data-minus="${key}">−</button>
            <span class="muted">Qty: <strong>${item.qty}</strong></span>
            <button data-plus="${key}">+</button>
            <button data-remove="${key}" style="margin-left:auto;">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // bind actions
  cartItems.querySelectorAll("[data-minus]").forEach(b=>{
    b.addEventListener("click", ()=>updateQty(b.dataset.minus, -1));
  });
  cartItems.querySelectorAll("[data-plus]").forEach(b=>{
    b.addEventListener("click", ()=>updateQty(b.dataset.plus, +1));
  });
  cartItems.querySelectorAll("[data-remove]").forEach(b=>{
    b.addEventListener("click", ()=>removeFromCart(b.dataset.remove));
  });

  // totals
  const subtotal = keys.reduce((acc,key)=>{
    const item = state.cart[key];
    const p = products.find(x => x.id === item.productId);
    return acc + (p ? p.price * item.qty : 0);
  }, 0);

  const discount = computeDiscount(subtotal);
  setTotals(subtotal, discount);
}

function computeDiscount(subtotal){
  if(!state.coupon) return 0;
  return Math.round(subtotal * (state.coupon.percent / 100));
}

function setTotals(subtotal, discount){
  const total = Math.max(0, subtotal - discount);
  subtotalText.textContent = INR(subtotal);
  discountText.textContent = `- ${INR(discount)}`;
  totalText.textContent = INR(total);
  payTotal.textContent = INR(total);
}

applyCouponBtn.addEventListener("click", ()=>{
  const code = (couponInput.value || "").trim().toUpperCase();
  if(!code){
    state.coupon = null;
    renderCart();
    alert("Enter a coupon code (try RIDE10).");
    return;
  }

  // Demo coupons
  if(code === "RIDE10"){
    state.coupon = { code, percent: 10 };
    alert("Coupon applied: 10% off ✅");
  } else if(code === "VELOX15"){
    state.coupon = { code, percent: 15 };
    alert("Coupon applied: 15% off ✅");
  } else {
    state.coupon = null;
    alert("Invalid coupon ❌ Try RIDE10");
  }
  renderCart();
});

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);

// ------------------------------
// CHECKOUT
// ------------------------------
checkoutBtn.addEventListener("click", ()=>{
  const keys = Object.keys(state.cart);
  if(!keys.length){
    alert("Your cart is empty.");
    return;
  }
  showModal(checkoutModal);
});

closeCheckoutBtn.addEventListener("click", ()=>hideModal(checkoutModal));
checkoutBackdrop.addEventListener("click", ()=>hideModal(checkoutModal));

checkoutForm.addEventListener("submit", (e)=>{
  e.preventDefault();

  const phone = document.getElementById("phone").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if(!/^\d{10}$/.test(phone)){
    orderMsg.textContent = "Please enter a valid 10-digit phone number.";
    return;
  }
  if(!/^\d{6}$/.test(pincode)){
    orderMsg.textContent = "Please enter a valid 6-digit pincode.";
    return;
  }

  orderMsg.textContent = "Order placed ✅ (Demo). We will contact you soon.";
  // Clear cart in demo
  state.cart = {};
  state.coupon = null;
  saveCart();
  renderCart();

  setTimeout(()=>{
    hideModal(checkoutModal);
    closeCart();
    checkoutForm.reset();
    orderMsg.textContent = "";
  }, 1200);
});

// ------------------------------
// UI EVENTS (Search/Sort/Filter)
// ------------------------------
searchInput.addEventListener("input", ()=>{
  state.search = searchInput.value;
  renderProducts();
});

sortSelect.addEventListener("change", ()=>{
  state.sort = sortSelect.value;
  renderProducts();
});

tagSelect.addEventListener("change", ()=>{
  state.filterTag = tagSelect.value;
  renderProducts();
});

// ------------------------------
// NAV MOBILE
// ------------------------------
burgerBtn.addEventListener("click", ()=>{
  const isOpen = nav.style.display === "flex";
  nav.style.display = isOpen ? "none" : "flex";
  nav.style.flexDirection = "column";
  nav.style.gap = "10px";
  nav.style.background = "rgba(0,0,0,.25)";
  nav.style.padding = "12px";
  nav.style.border = "1px solid var(--line)";
  nav.style.borderRadius = "16px";
});

// ------------------------------
// THEME
// ------------------------------
themeBtn.addEventListener("click", ()=>{
  state.theme = (state.theme === "light") ? "dark" : "light";
  saveTheme(state.theme);
  applyTheme(state.theme);
});

function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "light" ? "🌞" : "🌙";
}

// ------------------------------
// NEWSLETTER (DEMO)
// ------------------------------
newsletterForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const email = newsletterEmail.value.trim();
  if(!email.includes("@")){
    newsletterMsg.textContent = "Please enter a valid email.";
    return;
  }
  newsletterMsg.textContent = "Subscribed ✅ (demo)";
  newsletterEmail.value = "";
  setTimeout(()=>newsletterMsg.textContent="", 1400);
});

// ------------------------------
// MODAL / DRAWER HELPERS
// ------------------------------
function showModal(el){
  el.classList.add("show");
  el.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function hideModal(el){
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openCart(){
  cartDrawer.classList.add("show");
  cartDrawer.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeCart(){
  cartDrawer.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

// ------------------------------
// STORAGE
// ------------------------------
function loadCart(){
  try{
    return JSON.parse(localStorage.getItem("velox_cart") || "{}");
  }catch{
    return {};
  }
}
function saveCart(){
  localStorage.setItem("velox_cart", JSON.stringify(state.cart));
}
function loadTheme(){
  return localStorage.getItem("velox_theme") || "dark";
}
function saveTheme(t){
  localStorage.setItem("velox_theme", t);
}

// ------------------------------
// UTILS
// ------------------------------
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
