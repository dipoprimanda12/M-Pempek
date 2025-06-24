// Jam realtime
function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");
  clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Modal handling
const productModal = document.getElementById("productModal");
const cartModal = document.getElementById("cartModal");
const closeModals = document.querySelectorAll(".close-modal");

closeModals.forEach((btn) => {
  btn.addEventListener("click", () => {
    productModal.style.display = "none";
    cartModal.style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  if (e.target === productModal) productModal.style.display = "none";
  if (e.target === cartModal) cartModal.style.display = "none";
});

// Detail Produk
const detailButtons = document.querySelectorAll(".detail-btn");
const modalTitle = document.getElementById("modal-title");
const modalImg = document.getElementById("modal-img");
const modalDescription = document.getElementById("modal-description");
const modalPrice = document.getElementById("modal-price");

detailButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const product = e.target.closest(".product-item");
    modalTitle.textContent = product.dataset.nama;
    modalImg.src = product.querySelector("img").src;
    modalImg.alt = product.dataset.nama;
    modalDescription.textContent = product.dataset.deskripsi;
    modalPrice.textContent = `Harga: Rp ${Number(
      product.dataset.harga
    ).toLocaleString()}`;
    productModal.style.display = "flex";
  });
});

// Keranjang
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const openCartBtn = document.getElementById("openCart");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;
}

function updateCartDisplay() {
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Keranjang kosong.</p>";
    cartTotalEl.textContent = "0";
    return;
  }

  let total = 0;
  cart.forEach((item) => {
    total += item.qty * item.harga;
    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.nama}</h4>
        <p>Rp ${item.harga.toLocaleString()}</p>
      </div>
      <div class="cart-qty">
        <button class="qty-minus" data-id="${item.id}">−</button>
        <span>${item.qty}</span>
        <button class="qty-plus" data-id="${item.id}">+</button>
      </div>
      <button class="cart-remove" data-id="${item.id}">&times;</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartTotalEl.textContent = total.toLocaleString();

  // Attach event listeners to qty and remove buttons
  document.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.id, -1));
  });
  document.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.id, +1));
  });
  document.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
}

function changeQty(id, delta) {
  const index = cart.findIndex((i) => i.id == id);
  if (index !== -1) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart[index].qty = 1;
    saveCart();
    updateCartCount();
    updateCartDisplay();
  }
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id != id);
  saveCart();
  updateCartCount();
  updateCartDisplay();
}

// Tambah ke keranjang
const addToCartButtons = document.querySelectorAll(".add-to-cart");
addToCartButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const product = e.target.closest(".product-item");
    const id = product.dataset.id;
    const nama = product.dataset.nama;
    const harga = parseInt(product.dataset.harga);

    const existing = cart.find((i) => i.id == id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, nama, harga, qty: 1 });
    }
    saveCart();
    updateCartCount();
    alert(`"${nama}" berhasil ditambahkan ke keranjang.`);
  });
});

// Buka tutup modal keranjang
openCartBtn.addEventListener("click", () => {
  cartModal.style.display = "flex";
  updateCartDisplay();
});

// Checkout form
const checkoutForm = document.getElementById("checkout-form");
checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  const formData = new FormData(checkoutForm);
  const nama = formData.get("nama");
  const hp = formData.get("hp");
  const alamat = formData.get("alamat");
  const antar = formData.get("antar");
  const catatan = formData.get("catatan");

  // Buat pesan WA
  let pesan = `*Pesanan Pempek Mak Rina*\n\nNama: ${nama}\nNo HP: ${hp}\nAlamat: ${alamat}\nWaktu Pengantaran: ${antar}\nCatatan: ${
    catatan || "-"
  }\n\n*Detail Pesanan:*\n`;

  cart.forEach((item) => {
    pesan += `- ${item.nama} x${item.qty} = Rp ${(
      item.harga * item.qty
    ).toLocaleString()}\n`;
  });

  const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
  pesan += `\nTotal: Rp ${total.toLocaleString()}`;

  // Encode pesan untuk URL
  const encodedPesan = encodeURIComponent(pesan);

  // Link WA
  const waLink = `https://wa.me/6289602799141?text=${encodedPesan}`;

  // Buka WA di tab baru
  window.open(waLink, "_blank");

  // Reset keranjang dan form
  cart = [];
  saveCart();
  updateCartCount();
  updateCartDisplay();
  checkoutForm.reset();
  cartModal.style.display = "none";
});
// Fitur pencarian produk (nama, harga, jenis)
const searchInput = document.getElementById("searchInput");
const products = document.querySelectorAll(".product-item");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  products.forEach((product) => {
    const nama = product.dataset.nama.toLowerCase();
    const harga = product.dataset.harga.toLowerCase();
    const jenis = (product.dataset.jenis || "").toLowerCase();

    // Cek apakah query ada di nama, harga, atau jenis
    if (
      nama.includes(query) ||
      harga.includes(query) ||
      jenis.includes(query)
    ) {
      product.style.display = "";
    } else {
      product.style.display = "none";
    }
  });
});
// Ganti gambar hero secara otomatis dengan fade
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".hero-bg img");
  let currentIndex = 0;
  const intervalTime = 7000; // 7 detik
  const fadeDuration = 1500; // sesuai css transition (ms)

  function showNextImage() {
    images[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add("active");
  }

  setInterval(showNextImage, intervalTime);
});
// Animasi scroll produk satu per satu
const productItems = document.querySelectorAll(".product-item");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
      } else {
        entry.target.classList.remove("animate");
      }
    });
  },
  {
    threshold: 0.1, // hanya saat sedikit masuk viewport
  }
);

productItems.forEach((item) => {
  observer.observe(item);
});
