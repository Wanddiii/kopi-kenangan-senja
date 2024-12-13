document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Robusta Brazil", img: "1.jpg", price: 20000 },
      { id: 2, name: "Arabica Blend", img: "1.jpg", price: 25000 },
      { id: 3, name: "Primo Passo", img: "1.jpg", price: 30000 },
      { id: 4, name: "Aceh Gayo", img: "1.jpg", price: 35000 },
      { id: 5, name: "Sumatra Mandheling", img: "1.jpg", price: 40000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // cek apakah ada barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika belum ada / cart masi kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika barangnya sudah ada , cek apakah barang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          // jika barang beda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },

    remove(id) {
      // Cek apakah `items` tersedia dan bukan array kosong
      if (!this.items || this.items.length === 0) {
        return; // Jika tidak ada item, hentikan fungsi
      }

      // Cari item berdasarkan ID
      const cartItem = this.items.find((item) => item.id === id);

      if (cartItem) {
        if (cartItem.quantity > 1) {
          // Jika quantity > 1, kurangi quantity dan total harga
          this.items = this.items.map((item) => {
            if (item.id === id) {
              const updatedItem = { ...item };
              updatedItem.quantity--;
              updatedItem.total = updatedItem.price * updatedItem.quantity;
              this.quantity--;
              this.total -= updatedItem.price;
              return updatedItem;
            }
            return item;
          });
        } else {
          // Jika quantity = 1, hapus item dari array
          this.items = this.items.filter((item) => item.id !== id);
          this.quantity--;
          this.total -= cartItem.price;
        }
      }
    },
  });
});

// form validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutform");

// Dengarkan event "input" (untuk semua perubahan input, termasuk "keyup")
form.addEventListener("input", function () {
  let allFilled = true;

  // Loop melalui semua elemen dalam form
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.trim() === "") {
      allFilled = false; // Jika ada elemen kosong, set false
      break; // Tidak perlu melanjutkan pengecekan
    }
  }

  // Update tombol berdasarkan hasil pengecekan
  checkoutButton.disabled = !allFilled;
  if (allFilled) {
    checkoutButton.classList.remove("disabled");
  } else {
    checkoutButton.classList.add("disabled");
  }
});

// kirim data ketika tombol checkout di klik
checkoutButton.addEventListener("click", function (e) {
  e.preventDefault();

  // Ambil data dari form
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);

  // Format pesan WhatsApp
  const message = formatMessage(objData);

  // Kirim pesan ke WhatsApp dengan URL encode
  const waUrl =
    "https://wa.me/6281524185203?text=" + encodeURIComponent(message);
  window.open(waUrl);
});

// format pesan WhatsApp
const formatMessage = (obj) => {
  // Pastikan data items adalah JSON yang valid dan bisa diparse
  let itemsMessage = "";
  try {
    const items = JSON.parse(obj.items); // Asumsi obj.items adalah string JSON
    itemsMessage = items
      .map((item) => {
        // Format setiap item dengan nama, kuantitas, dan harga
        return `${item.name} (${item.quantity} x ${rupiah(item.total)})`;
      })
      .join("\n");
  } catch (error) {
    itemsMessage = "Data pesanan tidak valid";
  }

  // Format pesan akhir
  return `*Data Customer:*
Nama: ${obj.name}
Email: ${obj.email}
No HP: ${obj.phone}

*Data Pesanan:*
${itemsMessage}

*TOTAL: ${rupiah(obj.total)}
Terima Kasih!`;
};
// konversi ke rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
