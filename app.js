// ----------------------------
// Simple shop data (edit this)
// ----------------------------
const STORE = {
  brandName: "CycleFlex",
  supportWhatsApp: "+91 9629928542", // ✅ change to your WhatsApp number (country code + number, no +)
  currencySymbol: "₹",
  products: [
    // WOMEN
    { id:"W01", title:"Women Pro Cycle Shorts", category:"Women", price:799, tag:"Anti-chafe", desc:"High-waist compression fit. Breathable, squat-proof fabric.", sizes:["S","M","L","XL"] },
    { id:"W02", title:"Women Seamless Bike Shorts", category:"Women", price:699, tag:"Seamless", desc:"Ultra-soft stretch. Everyday training and long rides.", sizes:["S","M","L","XL"] },
    { id:"W03", title:"Women Pocket Cycle Shorts", category:"Women", price:899, tag:"2 Pockets", desc:"Side pockets for phone/keys. Cool-dry performance.", sizes:["S","M","L","XL"] },

    // MEN
    { id:"M01", title:"Men Endurance Cycle Shorts", category:"Men", price:849, tag:"Endurance", desc:"Supportive compression. Designed for longer rides.", sizes:["M","L","XL","XXL"] },
    { id:"M02", title:"Men Pro Fit Bike Shorts", category:"Men", price:749, tag:"Pro Fit", desc:"Comfort fit with strong stitching and smooth waistband.", sizes:["M","L","XL","XXL"] },
    { id:"M03", title:"Men Pocket Cycle Shorts", category:"Men", price:949, tag:"Pocket", desc:"Pocket for essentials. Durable fabric for daily rides.", sizes:["M","L","XL","XXL"] }
  ]
};

// ----------------------------
// Cart helpers
// ----------------------------
const CART_KEY = "cycleflex_cart_v1";

function money(n){
  return `${STORE.currencySymbol}${Number(n||0).toLocaleString("en-IN")}`;
}

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}
function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}
function addToCart(productId, size){
  const cart = getCart();
  const key = `${productId}_${size || "NA"}`;
  const found = cart.find(x => x.key === key);
  if(found) found.qty += 1;
  else cart.push({ key, productId, size: size || "NA", qty: 1 });
  saveCart(cart);
  toast("Added to cart ✅");
}
function removeFromCart(key){
  const cart = getCart().filter(x => x.key !== key);
  saveCart(cart);
}
function changeQty(key, delta){
  const cart = getCart();
  const item = cart.find(x => x.key === key);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) return removeFromCart(key);
  saveCart(cart);
}
function cartCount(){
  return getCart().reduce((s,i)=>s+i.qty,0);
}
function updateCartBadge(){
  const el = document.querySelector("[data-cart-badge]");
  if(el) el.textContent = cartCount();
}

function findProduct(id){
  return STORE.products.find(p => p.id === id);
}

function cartTotal(){
  const cart = getCart();
  let total = 0;
  for(const item of cart){
    const p = findProduct(item.productId);
    if(p) total += p.price * item.qty;
  }
  return total;
}

// ----------------------------
// UI: toast
// ----------------------------
let toastTimer;
function toast(msg){
  let el = document.getElementById("toast");
  if(!el){
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.bottom = "18px";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "14px";
    el.style.background = "rgba(0,0,0,.55)";
    el.style.border = "1px solid rgba(255,255,255,.12)";
    el.style.backdropFilter = "blur(10px)";
    el.style.color = "white";
    el.style.fontWeight = "800";
    el.style.zIndex = "9999";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.style.opacity = "0"; }, 1400);
}

// ----------------------------
// Render featured cards on home
// ----------------------------
function renderFeatured(){
  const grid = document.getElementById("featuredGrid");
  if(!grid) return;

  const featured = STORE.products.slice(0,4);
  grid.innerHTML = featured.map(p => productCardHTML(p)).join("");
  bindCardButtons(grid);
}

// ----------------------------
// Products page rendering
// ----------------------------
function productCardHTML(p){
  return `
  <div class="card">
    <div class="thumb">${p.category.toUpperCase()} • ${p.tag}</div>
    <div class="card-body">
      <div class="row">
        <span class="tag">${p.category}</span>
        <span class="price">${money(p.price)}</span>
      </div>
      <h3>${p.title}</h3>
      <div class="muted">${p.desc}</div>
      <div class="card-actions">
        <button class="btn" data-view="${p.id}">View</button>
        <button class="btn primary" data-add="${p.id}">Add</button>
      </div>
    </div>
  </div>`;
}

function renderProducts(){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const cat = document.getElementById("categorySelect")?.value || "All";
  const sort = document.getElementById("sortSelect")?.value || "featured";

  let items = STORE.products.slice();

  if(cat !== "All") items = items.filter(p => p.category === cat);
  if(q) items = items.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q) ||
    p.tag.toLowerCase().includes(q)
  );

  if(sort === "price_low") items.sort((a,b)=>a.price-b.price);
  if(sort === "price_high") items.sort((a,b)=>b.price-a.price);

  grid.innerHTML = items.map(p => productCardHTML(p)).join("");
  bindCardButtons(grid);

  const countEl = document.getElementById("resultCount");
  if(countEl) countEl.textContent = `${items.length} products`;
}

function bindCardButtons(root){
  root.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-add");
      const p = findProduct(id);
      const defaultSize = p?.sizes?.[0] || "NA";
      addToCart(id, defaultSize);
    });
  });
  root.querySelectorAll("[data-view]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-view");
      openProductModal(id);
    });
  });
}

// ----------------------------
// Modal (simple)
// ----------------------------
function openProductModal(id){
  const p = findProduct(id);
  if(!p) return;

  const modal = document.getElementById("modal");
  const body = document.getElementById("modalBody");
  if(!modal || !body) return;

  body.innerHTML = `
    <div class="thumb" style="height:220px;border-radius:18px;">${p.category.toUpperCase()} • ${p.tag}</div>
    <div style="margin-top:12px" class="row">
      <div>
        <div class="small">${p.category}</div>
        <div style="font-size:20px;font-weight:900">${p.title}</div>
      </div>
      <div style="font-size:20px;font-weight:900">${money(p.price)}</div>
    </div>
    <div class="line"></div>
    <div class="muted">${p.desc}</div>

    <div style="margin-top:14px" class="row">
      <label class="small">Size</label>
      <select id="modalSize">
        ${p.sizes.map(s=>`<option value="${s}">${s}</option>`).join("")}
      </select>
    </div>

    <div style="margin-top:14px" class="card-actions">
      <button class="btn" id="modalCloseBtn">Close</button>
      <button class="btn primary" id="modalAddBtn">Add to cart</button>
    </div>
  `;

  modal.style.display = "block";

  document.getElementById("modalCloseBtn")?.addEventListener("click", closeModal);
  document.getElementById("modalAddBtn")?.addEventListener("click", ()=>{
    const size = document.getElementById("modalSize")?.value || p.sizes[0];
    addToCart(p.id, size);
    closeModal();
  });
}

function closeModal(){
  const modal = document.getElementById("modal");
  if(modal) modal.style.display = "none";
}

// ----------------------------
// Checkout page
// ----------------------------
function renderCheckout(){
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if(!list || !totalEl) return;

  const cart = getCart();
  if(cart.length === 0){
    list.innerHTML = `<div class="muted">Your cart is empty. <a href="products.html" class="badge">Shop now</a></div>`;
    totalEl.textContent = money(0);
    return;
  }

  list.innerHTML = cart.map(item=>{
    const p = findProduct(item.productId);
    if(!p) return "";
    const lineTotal = p.price * item.qty;
    return `
      <div class="cart-item">
        <div>
          <div style="font-weight:900">${p.title}</div>
          <div class="small">Size: ${item.size} • ${money(p.price)} each</div>
          <button class="btn" style="margin-top:8px" data-remove="${item.key}">Remove</button>
        </div>
        <div style="text-align:right">
          <div class="qty">
            <button class="btn" data-dec="${item.key}">−</button>
            <div style="min-width:28px;text-align:center;font-weight:900">${item.qty}</div>
            <button class="btn" data-inc="${item.key}">+</button>
          </div>
          <div style="margin-top:10px;font-weight:900">${money(lineTotal)}</div>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = money(cartTotal());

  list.querySelectorAll("[data-remove]").forEach(b=>{
    b.addEventListener("click", ()=>{
      removeFromCart(b.getAttribute("data-remove"));
      renderCheckout();
    });
  });
  list.querySelectorAll("[data-inc]").forEach(b=>{
    b.addEventListener("click", ()=>{
      changeQty(b.getAttribute("data-inc"), +1);
      renderCheckout();
    });
  });
  list.querySelectorAll("[data-dec]").forEach(b=>{
    b.addEventListener("click", ()=>{
      changeQty(b.getAttribute("data-dec"), -1);
      renderCheckout();
    });
  });
}

function whatsappCheckout(){
  const name = (document.getElementById("c_name")?.value || "").trim();
  const phone = (document.getElementById("c_phone")?.value || "").trim();
  const address = (document.getElementById("c_address")?.value || "").trim();
  const note = (document.getElementById("c_note")?.value || "").trim();

  const cart = getCart();
  if(cart.length === 0) return toast("Cart is empty");

  if(!name || !phone || !address){
    return toast("Please fill Name, Phone, Address");
  }

  let lines = [];
  lines.push(`Hi ${STORE.brandName}, I want to place an order ✅`);
  lines.push(``);
  lines.push(`Name: ${name}`);
  lines.push(`Phone: ${phone}`);
  lines.push(`Address: ${address}`);
  if(note) lines.push(`Note: ${note}`);
  lines.push(``);
  lines.push(`Order items:`);

  for(const item of cart){
    const p = findProduct(item.productId);
    if(!p) continue;
    lines.push(`- ${p.title} | Size: ${item.size} | Qty: ${item.qty} | ${money(p.price * item.qty)}`);
  }

  lines.push(``);
  lines.push(`Total: ${money(cartTotal())}`);
  lines.push(`Payment: Cash/UPI (confirm)`);

  const text = encodeURIComponent(lines.join("\n"));
  const wa = `https://wa.me/${STORE.supportWhatsApp}?text=${text}`;

  window.open(wa, "_blank");
}

// ----------------------------
// Init
// ----------------------------
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartBadge();

  // home
  renderFeatured();

  // products page
  if(document.getElementById("productsGrid")){
    renderProducts();
    document.getElementById("searchInput")?.addEventListener("input", renderProducts);
    document.getElementById("categorySelect")?.addEventListener("change", renderProducts);
    document.getElementById("sortSelect")?.addEventListener("change", renderProducts);
  }

  // checkout page
  if(document.getElementById("cartList")){
    renderCheckout();
    document.getElementById("checkoutBtn")?.addEventListener("click", whatsappCheckout);
    document.getElementById("clearCartBtn")?.addEventListener("click", ()=>{
      saveCart([]);
      renderCheckout();
      toast("Cart cleared");
    });
  }

  // modal close on background click
  const modal = document.getElementById("modal");
  modal?.addEventListener("click", (e)=>{
    if(e.target === modal) closeModal();
  });
});

