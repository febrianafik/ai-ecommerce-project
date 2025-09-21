// api/upload-shopee.js
import { createClient } from '@supabase/supabase-js';

// Gunakan Service Key di backend!
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { draftId } = req.body;
    if (!draftId) {
      return res.status(400).json({ error: 'draftId is required' });
    }

    // 1. Ambil data draf dari Supabase
    const { data: draft, error: fetchError } = await supabase
      .from('product_drafts')
      .select('*')
      .eq('id', draftId)
      .single(); // .single() untuk mendapatkan satu objek, bukan array

    if (fetchError || !draft) {
      throw new Error('Draft not found or could not be fetched.');
    }

    console.log(`Preparing to upload draft ID ${draft.id}: ${draft.title}`);

    // 2. LOGIKA API SHOPEE AKAN DITAMBAHKAN DI SINI
    // Ini adalah bagian yang paling kompleks dan spesifik untuk Shopee
    // Untuk sekarang, kita akan simulasikan keberhasilan
    console.log('Simulating upload to Shopee...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi jeda jaringan 2 detik
    const shopeeResponse = { success: true, itemId: 'SHP' + Date.now() };
    console.log('Simulated success from Shopee:', shopeeResponse);

    // 3. (Opsional tapi direkomendasikan) Update status di database kita
    await supabase
      .from('product_drafts')
      .update({ status: 'published' })
      .eq('id', draftId);

    res.status(200).json({ success: true, message: `Product '${draft.title}' uploaded successfully.` });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
