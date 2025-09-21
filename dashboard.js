// dashboard.js

// Import Supabase client dari CDN (pakai ESM supaya jalan di browser modern)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// === GANTI sesuai project Supabase kamu ===
const SUPABASE_URL = 'https://vjqaamtdrvdynpnkpqpw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWFhbXRkcnZkeW5wbmtwcXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDc1NjYsImV4cCI6MjA3NDAyMzU2Nn0.zFj4Kn0vNwZPe-JFsXrhiTJdUyDew7aohM2mP4biDiY'

// Inisialisasi Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Fungsi untuk ambil & render data dari tabel product_drafts
async function fetchAndRenderDrafts() {
  const draftsContainer = document.getElementById('drafts-container')
  const loadingIndicator = document.getElementById('loading-indicator')
  const cardTemplate = document.getElementById('draft-card-template')

  // Tampilkan indikator loading
  loadingIndicator.style.display = 'block'

  // Query ke tabel Supabase
  const { data: drafts, error } = await supabase
    .from('product_drafts')
    .select('*')
    .order('created_at', { ascending: false })

  // Sembunyikan loading
  loadingIndicator.style.display = 'none'

  // Error handling
  if (error) {
    console.error('Error fetching drafts:', error)
    draftsContainer.innerHTML = `<p class="text-red-500">Gagal memuat data.</p>`
    return
  }

  // Kalau kosong
  if (!drafts || drafts.length === 0) {
    draftsContainer.innerHTML = `<p class="text-gray-500">Belum ada draf yang dibuat.</p>`
    return
  }

  // Bersihkan kontainer
  draftsContainer.innerHTML = ''

  // Loop tiap draft
  drafts.forEach(draft => {
    const cardClone = cardTemplate.content.cloneNode(true)

    // Isi judul & deskripsi
    cardClone.querySelector('.draft-title').textContent = draft.title
    cardClone.querySelector('.draft-description').textContent = draft.description

    // Render tags (kalau ada)
    const tagsContainer = cardClone.querySelector('.draft-tags')
    tagsContainer.innerHTML = ''
    if (draft.tags) {
      const tags = Array.isArray(draft.tags) ? draft.tags : draft.tags.split(',')
      tags.forEach(tag => {
        const tagEl = document.createElement('span')
        tagEl.className = 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full'
        tagEl.textContent = tag.trim()
        tagsContainer.appendChild(tagEl)
      })
    }

    // Tambah ID ke tombol upload (buat referensi aksi nanti)
    cardClone.querySelector('.upload-button').dataset.draftId = draft.id

    // Tambahkan ke halaman
    draftsContainer.appendChild(cardClone)
  })
}

// Fungsi utama
async function main() {
  console.log('Dasbor dimuat. Mengambil data...')
  await fetchAndRenderDrafts()
}

// Jalankan
main()
