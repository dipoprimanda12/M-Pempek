// ================== Jam Realtime ==================
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// ================== Modal Handling ==================
const productModal = document.getElementById("productModal");
const cartModal = document.getElementById("cartModal");
document.querySelectorAll(".close-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    productModal.style.display = "none";
    cartModal.style.display = "none";
  });
});
window.addEventListener("click", (e) => {
  if (e.target === productModal) productModal.style.display = "none";
  if (e.target === cartModal) cartModal.style.display = "none";
});

const modalTitle = document.getElementById("modal-title");
const modalImg = document.getElementById("modal-img");
const modalDescription = document.getElementById("modal-description");
const modalPrice = document.getElementById("modal-price");
const modaljumlah = document.getElementById("modal-jumlah");
const modalIsi = document.getElementById("modal-isi"); // <== Tambahan

document.querySelectorAll(".detail-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const product = e.target.closest(".product-item");

    const nama = product.dataset.nama;
    const harga = parseInt(product.dataset.harga);
    const deskripsi = product.dataset.deskripsi;
    const jumlah = product.dataset.jumlah;
    const isi = product.dataset.isi;

    modalTitle.textContent = nama;
    modalImg.src = product.querySelector("img").src;
    modalImg.alt = nama;
    modalDescription.textContent = deskripsi;
    modalPrice.textContent = `Harga: Rp ${harga.toLocaleString("id-ID")}`;
    modaljumlah.textContent = `Jumlah Isi: ${jumlah}`;
    modalIsi.textContent = `Isi Paket: ${isi}`;

    productModal.style.display = "flex";
  });
});

// ================== Keranjang ==================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const openCartBtn = document.getElementById("openCart");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
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
        <p>Rp ${item.harga.toLocaleString("id-ID")}</p>
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

  cartTotalEl.textContent = total.toLocaleString("id-ID");

  // Tambahkan event listener setelah elemen dibuat
  cartItemsContainer.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.id, -1));
  });
  cartItemsContainer.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.id, 1));
  });
  cartItemsContainer.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
}

function changeQty(id, delta) {
  const index = cart.findIndex((i) => i.id === id);
  if (index !== -1) {
    cart[index].qty = Math.max(1, cart[index].qty + delta);
    saveCart();
    updateCartCount();
    updateCartDisplay();
  }
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  updateCartCount();
  updateCartDisplay();
}

document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const product = e.target.closest(".product-item");
    const id = product.dataset.id;
    const nama = product.dataset.nama;
    const harga = parseInt(product.dataset.harga);

    const existing = cart.find((i) => i.id === id);
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

openCartBtn.addEventListener("click", () => {
  cartModal.style.display = "flex";
  updateCartDisplay();
});
// Checkout
const checkoutForm = document.getElementById("checkout-form");

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validasi isi keranjang
  const cartItems = document.querySelectorAll("#cart-items .cart-item");
  const total = parseInt(
    document.getElementById("cart-total").textContent.replace(/\D/g, ""),
    10
  );

  // Cek minimal pembelian
  if (cartItems.length < 3 && total < 150000) {
    alert(
      "Minimal pembelian 3 produk ATAU minimal total belanja Rp 150.000 untuk melanjutkan checkout."
    );

    // Redirect ke halaman produk setelah klik OK
    window.location.href = "/#home";
    return;
  }

  // Jika keranjang kosong (dari array `cart`)
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    window.location.href = "/#produk"; // redirect juga kalau keranjang kosong
    return;
  }

  // Ambil data form
  const formData = new FormData(checkoutForm);
  const nama = formData.get("nama");
  const hp = formData.get("hp");
  const alamat = formData.get("alamat");
  const antar = formData.get("antar");
  const catatan = formData.get("catatan") || "-";
  const metodeKirim = formData.get("metodeKirim");
  const pembayaran = formData.get("pembayaran");

  // Buat pesan WhatsApp
  let pesan = `*Pesanan Produk Lici Licious*\n\nNama: ${nama}\nNo HP: ${hp}\nAlamat: ${alamat}\nMetode Pengiriman: ${metodeKirim}\nWaktu: ${antar}\nPembayaran: ${pembayaran}\nCatatan: ${catatan}\n\n*Detail Pesanan:*\n`;

  cart.forEach((item) => {
    pesan += `- ${item.nama} x${item.qty} = Rp ${(
      item.qty * item.harga
    ).toLocaleString("id-ID")}\n`;
  });

  const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
  pesan += `\nTotal: Rp ${totalHarga.toLocaleString("id-ID")}`;

  // Kirim ke WhatsApp
  const waLink = `https://wa.me/6285719496510?text=${encodeURIComponent(
    pesan
  )}`;
  window.open(waLink, "_blank");

  // Reset keranjang dan tampilan
  cart = [];
  saveCart();
  updateCartCount();
  updateCartDisplay();
  checkoutForm.reset();
  cartModal.style.display = "none";

  // Pesan sukses
  alert("Pemesanan berhasil dikirim!");
});

// ================== Pencarian Produk ==================
const searchInput = document.getElementById("searchInput");
const products = document.querySelectorAll(".product-item");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  products.forEach((product) => {
    const nama = product.dataset.nama.toLowerCase();
    const harga = product.dataset.harga.toLowerCase();
    const jenis = (product.dataset.jenis || "").toLowerCase();

    product.style.display =
      nama.includes(query) || harga.includes(query) || jenis.includes(query)
        ? ""
        : "none";
  });
});

// ================== Ganti Gambar Hero ==================
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".hero-bg img");
  let currentIndex = 0;
  const intervalTime = 7000;

  setInterval(() => {
    images[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add("active");
  }, intervalTime);
});

// ================== Animasi Scroll Produk ==================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("animate", entry.isIntersecting);
    });
  },
  { threshold: 0.1 }
);

document
  .querySelectorAll(".product-item")
  .forEach((item) => observer.observe(item));
document.addEventListener("DOMContentLoaded", () => {
  const fadeEls = document.querySelectorAll(".fade-in-up");
  fadeEls.forEach((el, i) => {
    setTimeout(() => el.classList.add("show"), 200 + i * 100);
  });
});
// === Simpan Komentar ke localStorage ===
document
  .getElementById("form-komentar")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const nama = document.getElementById("nama").value.trim();
    const pesan = document.getElementById("pesan").value.trim();
    const rating = parseInt(document.getElementById("rating").value);

    if (nama && pesan && rating > 0) {
      const komentarBaru = { nama, pesan, rating };
      const komentarList =
        JSON.parse(localStorage.getItem("komentarList")) || [];
      komentarList.push(komentarBaru);
      localStorage.setItem("komentarList", JSON.stringify(komentarList));

      this.reset();
      ratingInput.value = 0;
      stars.forEach((s) => s.classList.remove("active"));
      loadKomentar();
    } else {
      alert("Silakan isi nama, komentar, dan rating.");
    }
  });

// === Tampilkan Komentar ===
function loadKomentar() {
  const komentarList = JSON.parse(localStorage.getItem("komentarList")) || [];
  const list = document.getElementById("list-komentar");
  list.innerHTML = "";

  const last5 = komentarList.slice(-5).reverse();
  last5.forEach((k) => {
    const div = document.createElement("div");
    div.innerHTML = `<p><strong>${k.nama}</strong> (${k.rating}⭐): ${k.pesan}</p>`;
    list.appendChild(div);
  });
}
