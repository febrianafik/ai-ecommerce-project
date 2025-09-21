// Import library yang dibutuhkan
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi klien Supabase dan Google AI
// Kunci API akan diambil dari Environment Variables di Vercel
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // PENTING: Gunakan SERVICE KEY untuk operasi backend
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Ini adalah handler fungsi utama
export default async function handler(req, res) {
  // 1. Keamanan: Pastikan ini adalah request POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Opsi keamanan tambahan: Gunakan "secret" untuk verifikasi
  const secret = req.headers['x-secret-key'];
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 2. Ambil data tren dari body request yang dikirim GitHub Actions
    const trendsData = req.body;
    console.log('Received trends data:', trendsData);

    // 3. Merancang Prompt Engineering yang Efektif untuk Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Based on this trend data from social media: ${JSON.stringify(trendsData)}, create a product draft for an aesthetic furniture item. Provide the output strictly in JSON format with these exact keys: "title" (string), "description" (string, around 3 sentences), "tags" (an array of 5 relevant string tags).`;

    // 4. Memanggil API Gemini
    console.log('Generating content with Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Membersihkan output dari Gemini agar pasti berupa JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedContent = JSON.parse(text);
    console.log('Received content from AI:', generatedContent);

    // 5. Menyimpan Hasil ke Supabase
    const dataToInsert = {
      title: generatedContent.title,
      description: generatedContent.description,
      tags: generatedContent.tags,
      source_trends: trendsData, // Simpan data tren asli sebagai referensi
    };

    console.log('Inserting data into Supabase...');
    const { data, error } = await supabase
      .from('product_drafts')
      .insert([dataToInsert])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('Successfully inserted data:', data);
    // 6. Kirim respons sukses
    res.status(200).json({ success: true, message: 'Product draft created successfully', data: data });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}



