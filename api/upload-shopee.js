// api/upload-shopee.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Hanya dipakai di backend!
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { draftId } = req.body;

    if (!draftId) {
      return res.status(400).json({ error: "draftId is required" });
    }

    // Ambil draft dari Supabase
    const { data: draft, error: fetchError } = await supabase
      .from("product_drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (fetchError || !draft) {
      throw new Error("Draft not found or could not be fetched.");
    }

    console.log(`Preparing to upload draft ID ${draft.id}: ${draft.title}`);

    // === LOGIKA API SHOPEE (placeholder) ===
    console.log("Simulating upload to Shopee...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi delay
    const shopeeResponse = { success: true, itemId: "SHP" + Date.now() };
    console.log("Simulated success:", shopeeResponse);

    // Update status di Supabase
    await supabase
      .from("product_drafts")
      .update({ status: "published" })
      .eq("id", draftId);

    return res.status(200).json({
      success: true,
      message: `Product '${draft.title}' uploaded successfully.`,
      shopeeResponse,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
