// dashboard.js

// 1. Import Supabase client dari CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 2. Masukkan URL & anon key dari Supabase kamu
const SUPABASE_URL = "https://vjqaamtdrvdynpnkpqpw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWFhbXRkcnZkeW5wbmtwcXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDc1NjYsImV4cCI6MjA3NDAyMzU2Nn0.zFj4Kn0vNwZPe-JFsXrhiTJdUyDew7aohM2mP4biDiY';

// 3. Buat koneksi Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 4. Fungsi ambil & render draft + tombol upload
async function fetchAndRenderDrafts() {
    const draftsContainer = document.getElementById('drafts-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const cardTemplate = document.getElementById('draft-card-template');

    loadingIndicator.style.display = 'block';

    const { data: drafts, error } = await supabase
        .from('product_drafts')
        .select('*')
        .order('created_at', { ascending: false });

    loadingIndicator.style.display = 'none';

    if (error) {
        console.error('Error fetching drafts:', error);
        draftsContainer.innerHTML = `<p class="text-red-500">Gagal memuat data.</p>`;
        return;
    }

    if (!drafts || drafts.length === 0) {
        draftsContainer.innerHTML = `<p class="text-gray-500">Belum ada draf yang dibuat.</p>`;
        return;
    }

    draftsContainer.innerHTML = '';

    for (const draft of drafts) {
        const cardClone = cardTemplate.content.cloneNode(true);

        cardClone.querySelector('.draft-title').textContent = draft.title;
        cardClone.querySelector('.draft-description').textContent = draft.description;

        const tagsContainer = cardClone.querySelector('.draft-tags');
        tagsContainer.innerHTML = '';
        if (draft.tags && Array.isArray(draft.tags)) {
            draft.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }

        // Tombol upload
        const uploadButton = cardClone.querySelector('.upload-button');
        uploadButton.dataset.draftId = draft.id;
        uploadButton.addEventListener('click', async () => {
            const draftId = uploadButton.dataset.draftId;

            uploadButton.textContent = 'Mengunggah...';
            uploadButton.disabled = true;

            try {
                const response = await fetch('/api/upload-shopee', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ draftId }),
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Gagal mengunggah.');
                }

                uploadButton.textContent = 'Berhasil Diunggah';
                uploadButton.className = 'bg-green-600 text-white font-semibold px-4 py-2 rounded-md';
            } catch (error) {
                console.error('Frontend upload error:', error);
                alert(`Error: ${error.message}`);
                uploadButton.textContent = 'Upload ke Shopee';
                uploadButton.disabled = false;
            }
        });

        draftsContainer.appendChild(cardClone);
    }
}

// 5. Jalankan saat halaman dimuat
async function main() {
    console.log('Dasbor dimuat. Mengambil data...');
    await fetchAndRenderDrafts();
}
main();
