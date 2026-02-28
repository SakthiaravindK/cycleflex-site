// ============================
// CONFIG
// ============================
const WHATSAPP_NUMBER = "9629928542";

// ✅ Backend URL (local). After deploy, set to your live server URL.
const API_BASE = "http://localhost:5050";

// Products
const PRODUCTS = [
  { id:"w_pro",  name:"Women Pro Cycle Shorts",     category:"Women", price:799, tag:"High-waist",
    desc:"High-waist compression fit. Breathable, squat-proof fabric.", img:"images/slide1.png" },
  { id:"w_seam", name:"Women Seamless Bike Shorts", category:"Women", price:699, tag:"Seamless",
    desc:"Ultra-soft stretch. Everyday training and long rides.", img:"images/slide2.png" },
  { id:"w_pock", name:"Women Pocket Cycle Shorts",  category:"Women", price:899, tag:"Pocket",
    desc:"Side pockets for phone/keys. Cool-dry performance.", img:"images/slide3.png" },
  { id:"m_end",  name:"Men Endurance Cycle Shorts", category:"Men",   price:849, tag:"Endurance",
    desc:"Supportive compression. Designed for longer rides.", img:"images/slide4.png" },
  { id:"m_pro",  name:"Men Pro Fit Bike Shorts",    category:"Men",   price:749, tag:"Pro Fit",
    desc:"Comfort fit with strong stitching and smooth waistband.", img:"images/slide5.png" },
  { id:"m_pock", name:"Men Pocket Cycle Shorts",    category:"Men",   price:949, tag:"Pocket",
    desc:"Pocket for essentials. Durable fabric for daily rides.", img:"images/slide1.png" },
];

const STORAGE_KEY = "cycleflex_cart_v1";

// ============================
// HELPERS
// ============================
function money(n){
  return `₹${Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;
}
function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch{ return {}; }
}
function saveCart(cart){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateBadges();
}
function cartCount(cart){
  return Object.values(cart).reduce((a,b)=>a + (b||0), 0);
}
function cartTotal(cart){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return sum + (p ? p.price * qty : 0);
  },0);
}
function updateBadges(){
  const cart = loadCart();
  const count = cartCount(cart);
  $all("[data-cart-badge]").forEach(b=>b.textContent = String(count));
}

// ============================
// CART ACTIONS
// ============================
function addToCart(id, qty=1){
  const cart = loadCart();
  cart[id] = (cart[id]||0) + qty;
  if(cart[id] <= 0) delete cart[id];
  saveCart(cart);
}
function setQty(id, qty){
  const cart = loadCart();
  if(qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart(cart);
}
function clearCart(){
  localStorage.removeItem(STORAGE_KEY);
  updateBadges();
}

// ============================
// MODAL
// ============================
function openModal(productId){
  const modal = $("#modal");
  const body = $("#modalBody");
  if(!modal || !body) return;

  const p = PRODUCTS.find(x=>x.id===productId);
  if(!p) return;

  body.innerHTML = `
    <div class="row" style="align-items:flex-start">
      <div>
        <h3 style="margin:0">${p.name}</h3>
        <div class="muted">${p.category} • ${p.tag}</div>
      </div>
      <div class="price">${money(p.price)}</div>
    </div>
    <div class="line"></div>
    <div class="muted" style="font-size:14px">${p.desc}</div>
    <div class="line"></div>
    <div class="row" style="gap:10px">
      <button class="btn" type="button" id="closeModalBtn">Close</button>
      <button class="btn primary" type="button" id="addModalBtn">Add to Cart</button>
    </div>
  `;

  modal.classList.add("show");

  $("#closeModalBtn").onclick = ()=>modal.classList.remove("show");
  $("#addModalBtn").onclick = ()=>{
    addToCart(p.id, 1);
    modal.classList.remove("show");
  };

  modal.addEventListener("click", (e)=>{
    if(e.target === modal) modal.classList.remove("show");
  }, { once:true });
}

// ============================
// RENDER: FEATURED (Home)
// ============================
function renderFeatured(){
  const grid = $("#featuredGrid");
  if(!grid) return;

  const featured = PRODUCTS.slice(0, 4);
  grid.innerHTML = featured.map(p => `
    <div class="card">
      <div class="thumb">
        <img src="${p.img}" alt="${p.name}">
        <div class="pbadge">${p.tag}</div>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="tag">${p.category}</div>
          <div class="price">${money(p.price)}</div>
        </div>
        <h3 style="margin:10px 0 6px">${p.name}</h3>
        <div class="muted">${p.desc}</div>
        <div class="card-actions">
          <button class="btn" type="button" data-view="${p.id}">View</button>
          <button class="btn primary" type="button" data-add="${p.id}">Add</button>
        </div>
      </div>
    </div>
  `).join("");

  grid.addEventListener("click", (e)=>{
    const add = e.target.closest("[data-add]");
    const view = e.target.closest("[data-view]");
    if(add) addToCart(add.getAttribute("data-add"), 1);
    if(view) openModal(view.getAttribute("data-view"));
  });
}

// ============================
// RENDER: PRODUCTS PAGE
// ============================
function renderProductsPage(){
  const grid = $("#productsGrid");
  if(!grid) return;

  const searchInput = $("#searchInput");
  const categorySelect = $("#categorySelect");
  const sortSelect = $("#sortSelect");
  const resultCount = $("#resultCount");

  function apply(){
    const q = (searchInput?.value || "").trim().toLowerCase();
    const cat = categorySelect?.value || "All";
    const sort = sortSelect?.value || "featured";

    let list = PRODUCTS.slice();

    if(cat !== "All") list = list.filter(p => p.category === cat);
    if(q){
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      );
    }
    if(sort === "price_low") list.sort((a,b)=>a.price-b.price);
    if(sort === "price_high") list.sort((a,b)=>b.price-a.price);

    if(resultCount) resultCount.textContent = `${list.length} products`;

    grid.innerHTML = list.map(p => `
      <div class="card">
        <div class="thumb">
          <img src="${p.img}" alt="${p.name}">
          <div class="pbadge">${p.tag}</div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="tag">${p.category}</div>
            <div class="price">${money(p.price)}</div>
          </div>
          <h3 style="margin:10px 0 6px">${p.name}</h3>
          <div class="muted">${p.desc}</div>
          <div class="card-actions">
            <button class="btn" type="button" data-view="${p.id}">View</button>
            <button class="btn primary" type="button" data-add="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  grid.addEventListener("click", (e)=>{
    const add = e.target.closest("[data-add]");
    const view = e.target.closest("[data-view]");
    if(add) addToCart(add.getAttribute("data-add"), 1);
    if(view) openModal(view.getAttribute("data-view"));
  });

  [searchInput, categorySelect, sortSelect].forEach(el=>{
    el && el.addEventListener("input", apply);
    el && el.addEventListener("change", apply);
  });

  apply();
}

// ============================
// CHECKOUT PAGE (WhatsApp + Razorpay Payment)
// ============================
function renderCheckout(){
  const list = $("#cartList");
  const totalEl = $("#cartTotal");
  const clearBtn = $("#clearCartBtn");
  const waCheckoutBtn = $("#checkoutWA");
  const payOnlineBtn = $("#payOnlineBtn");
  const payStatus = $("#payStatus");
  if(!list || !totalEl) return;

  function draw(){
    const cart = loadCart();
    const items = Object.entries(cart).map(([id,qty])=>{
      const p = PRODUCTS.find(x=>x.id===id);
      return p ? { ...p, qty } : null;
    }).filter(Boolean);

    if(items.length === 0){
      list.innerHTML = `<div class="muted">Your cart is empty. Go to <a href="products.html" style="text-decoration:underline">Shop</a>.</div>`;
      totalEl.textContent = money(0);
      return;
    }

    list.innerHTML = items.map(it=>`
      <div class="cart-item">
        <div>
          <div style="font-weight:900">${it.name}</div>
          <div class="muted">${it.category} • ${it.tag}</div>
          <div class="muted">${money(it.price)} each</div>
        </div>
        <div style="text-align:right">
          <div class="qty">
            <button class="btn" type="button" data-dec="${it.id}">-</button>
            <div style="min-width:22px;text-align:center;font-weight:900">${it.qty}</div>
            <button class="btn" type="button" data-inc="${it.id}">+</button>
          </div>
          <div class="muted" style="margin-top:6px">Subtotal: <b>${money(it.price * it.qty)}</b></div>
          <button class="btn" type="button" data-remove="${it.id}" style="margin-top:8px;width:100%;justify-content:center">Remove</button>
        </div>
      </div>
    `).join("");

    totalEl.textContent = money(cartTotal(cart));
  }

  list.addEventListener("click", (e)=>{
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rem = e.target.closest("[data-remove]");
    const cart = loadCart();

    if(inc){ addToCart(inc.getAttribute("data-inc"), 1); draw(); }
    if(dec){
      const id = dec.getAttribute("data-dec");
      setQty(id, (cart[id]||0) - 1);
      draw();
    }
    if(rem){ setQty(rem.getAttribute("data-remove"), 0); draw(); }
  });

  clearBtn && (clearBtn.onclick = ()=>{ clearCart(); draw(); });

  // WhatsApp checkout
  waCheckoutBtn && (waCheckoutBtn.onclick = ()=>{
    const cart = loadCart();
    const items = Object.entries(cart).map(([id,qty])=>{
      const p = PRODUCTS.find(x=>x.id===id);
      return p ? `• ${p.name} (Qty: ${qty}) — ${money(p.price*qty)}` : null;
    }).filter(Boolean);

    if(items.length === 0){ alert("Your cart is empty."); return; }

    const name = ($("#c_name")?.value || "").trim();
    const phone = ($("#c_phone")?.value || "").trim();
    const address = ($("#c_address")?.value || "").trim();
    const note = ($("#c_note")?.value || "").trim();
    const total = money(cartTotal(cart));

    const msg =
`Hello CycleFlex 👋
I want to place an order (WhatsApp).

🛒 Order Items:
${items.join("\n")}

💰 Total: ${total}

👤 Customer:
Name: ${name || "-"}
Phone: ${phone || "-"}

📍 Delivery Address:
${address || "-"}

📝 Note:
${note || "-"}

(Website order)`;

    window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  });

  // Online payment (Razorpay)
  payOnlineBtn && (payOnlineBtn.onclick = async ()=>{
    const cart = loadCart();
    const total = cartTotal(cart);
    if(total <= 0){ alert("Your cart is empty."); return; }

    const customer = {
      name: ($("#c_name")?.value || "").trim(),
      phone: ($("#c_phone")?.value || "").trim(),
      address: ($("#c_address")?.value || "").trim(),
      note: ($("#c_note")?.value || "").trim(),
    };

    try{
      payStatus && (payStatus.textContent = "Creating payment…");

      const res = await fetch(`${API_BASE}/create-order`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cart, customer })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data?.error || "Order create failed");

      await loadRazorpayScript();

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "CycleFlex",
        description: "Cycling Shorts Order",
        order_id: data.order_id,
        prefill: { name: customer.name || "", contact: customer.phone || "" },
        handler: async function (response){
          payStatus && (payStatus.textContent = "Verifying payment…");
          const vr = await fetch(`${API_BASE}/verify-payment`, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const vdata = await vr.json();
          if(!vr.ok) throw new Error(vdata?.error || "Verification failed");

          payStatus && (payStatus.textContent = "✅ Payment successful! Order confirmed.");
          clearCart();
          draw();

          // optional WhatsApp confirmation
          const msg =
`Hello CycleFlex 👋
I have paid online (Razorpay).

✅ Payment ID: ${response.razorpay_payment_id}
✅ Order ID: ${response.razorpay_order_id}

Customer:
Name: ${customer.name || "-"}
Phone: ${customer.phone || "-"}

Address:
${customer.address || "-"}`;

          window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
        }
      };

      payStatus && (payStatus.textContent = "Opening payment…");
      const rzp = new window.Razorpay(options);
      rzp.open();

    }catch(err){
      console.error(err);
      payStatus && (payStatus.textContent = "❌ Payment failed: " + err.message);
      alert("Payment failed: " + err.message);
    }
  });

  draw();
}

function loadRazorpayScript(){
  return new Promise((resolve, reject)=>{
    if(window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

// ============================
// HERO SLIDER
// ============================
function setupHeroSlider(){
  const root = document.getElementById("heroSlider");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".slide"));
  const prevBtn = root.querySelector(".slider-btn.prev");
  const nextBtn = root.querySelector(".slider-btn.next");
  const dotsWrap = root.querySelector(".slider-dots");
  if (!slides.length || !dotsWrap) return;

  let idx = 0;
  let timer = null;
  const AUTOPLAY_MS = 6000;

  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll(".slider-dot"));

  function render() {
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }
  function goTo(i, userAction = false) {
    idx = (i + slides.length) % slides.length;
    render();
    if (userAction) restart();
  }
  function next() { goTo(idx + 1); }
  function prev() { goTo(idx - 1); }
  function start() { stop(); timer = setInterval(next, AUTOPLAY_MS); }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  function restart() { start(); }

  nextBtn?.addEventListener("click", () => goTo(idx + 1, true));
  prevBtn?.addEventListener("click", () => goTo(idx - 1, true));

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  let x0 = null;
  root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive:true });
  root.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const x1 = e.changedTouches[0].clientX;
    const dx = x1 - x0;
    if (Math.abs(dx) > 45) {
      if (dx < 0) goTo(idx + 1, true);
      else goTo(idx - 1, true);
    }
    x0 = null;
  }, { passive:true });

  render();
  start();
}

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  updateBadges();
  renderFeatured();
  renderProductsPage();
  renderCheckout();
  setupHeroSlider();
});
