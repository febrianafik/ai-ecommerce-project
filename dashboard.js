// dashboard.js

// Import library Supabase dari CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Ganti dengan Project URL dan Anon Key milik Anda
const SUPABASE_URL = "https://vjqaamtdrvdynpnkpqpw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWFhbXRkcnZkeW5wbmtwcXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDc1NjYsImV4cCI6MjA3NDAyMzU2Nn0.zFj4Kn0vNwZPe-JFsXrhiTJdUyDew7aohM2mP4biDiY";

// Inisialisasi Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi utama
async function main() {
  console.log("Dasbor dimuat. Mengambil data...");
  await fetchAndRenderDrafts();
}

// Ambil data dari Supabase dan render ke halaman
async function fetchAndRenderDrafts() {
  const draftsContainer = document.getElementById("drafts-container");
  const loadingIndicator = document.getElementById("loading-indicator");
  const cardTemplate = document.getElementById("draft-card-template");

  // Tampilkan indikator loading
  loadingIndicator.style.display = "block";

  // Ambil data dari tabel 'product_drafts'
  const { data: drafts, error } = await supabase
    .from("product_drafts")
    .select("*")
    .order("created_at", { ascending: false });

  // Sembunyikan indikator loading
  loadingIndicator.style.display = "none";

  if (error) {
    console.error("Error fetching drafts:", error);
    draftsContainer.innerHTML = `<p class="text-red-500">Gagal memuat data.</p>`;
    return;
  }

  if (!drafts || drafts.length === 0) {
    draftsContainer.innerHTML = `<p class="text-gray-500">Belum ada draf yang dibuat.</p>`;
    return;
  }

  // Kosongkan container
  draftsContainer.innerHTML = "";

  // Loop setiap draft
  for (const draft of drafts) {
    const cardClone = cardTemplate.content.cloneNode(true);

    // Isi data ke elemen
    cardClone.querySelector(".draft-title").textContent = draft.title || "Tanpa Judul";
    cardClone.querySelector(".draft-description").textContent = draft.description || "Tidak ada deskripsi.";

    const tagsContainer = cardClone.querySelector(".draft-tags");
    tagsContainer.innerHTML = "";

    if (draft.tags && Array.isArray(draft.tags)) {
      draft.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.className = "bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full";
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    }

    cardClone.querySelector(".upload-button").dataset.draftId = draft.id;

    draftsContainer.appendChild(cardClone);
  }
}
// Tambahkan ini di bawah function fetchAndRenderDrafts, sebelum main()

function setupUploadButtons() {
  document.querySelectorAll(".upload-button").forEach(button => {
    button.addEventListener("click", async (e) => {
      const draftId = e.target.dataset.draftId;

      if (!draftId) {
        alert("Draft ID tidak ditemukan!");
        return;
      }

      // Tampilkan loading state di tombol
      e.target.disabled = true;
      e.target.textContent = "Mengupload...";

      try {
        const response = await fetch("/api/upload-shopee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftId }),
        });

        const result = await response.json();

        if (result.success) {
          alert(`✅ ${result.message}`);
        } else {
          alert(`❌ Gagal upload: ${result.error}`);
        }
      } catch (err) {
        console.error("Error saat upload:", err);
        alert("Terjadi kesalahan saat menghubungi server.");
      } finally {
        e.target.disabled = false;
        e.target.textContent = "Upload";
      }
    });
  });
}

// Panggil setelah draft selesai dirender
async function fetchAndRenderDrafts() {
  // ... kode yang sudah ada (render kartu)
  draftsContainer.appendChild(cardClone);
  }

  // Setelah semua card ditambahkan
  setupUploadButtons();
}

// Jalankan main
main();
