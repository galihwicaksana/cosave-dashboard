/**
 * CoSave - Supabase Client & API Service
 */

const SUPABASE_URL = "https://omgxzpyxoapwlhzmcokl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZ3h6cHl4b2Fwd2xoem1jb2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTcxNzMsImV4cCI6MjEwMTQ3MzE3M30.dUviPwgz-g6RCMQJPLky8sPUjLEyW_P0855A8haQACg";

// Initialize Supabase Client dynamically
function getSupabaseClient() {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return null;
}

var supabase = getSupabaseClient();
var BUCKET_NAME = "transfer-proofs";

var SupabaseService = {
  // Fetch All Transactions from Supabase
  async getTransactions() {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.warn("Supabase fetch error transactions:", error.message);
      return null;
    }

    return data.map(tx => ({
      id: tx.id,
      type: tx.type,
      userId: tx.user_id,
      userName: tx.user_name,
      amount: Number(tx.amount),
      goalId: tx.goal_id,
      category: tx.category,
      date: tx.date,
      note: tx.note,
      proof: tx.proof_url
    }));
  },

  // Fetch Goals from Supabase
  async getGoals() {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn("Supabase fetch error goals:", error.message);
      return null;
    }

    return data.map(g => ({
      id: g.id,
      title: g.title,
      targetAmount: Number(g.target_amount),
      icon: g.icon,
      color: g.color
    }));
  },

  // Compress Image Client-Side before Uploading (Max 800px width/height, 0.7 JPEG Quality)
  compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  },

  // Upload Screenshot File to Supabase Storage Bucket
  async uploadProof(file) {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase || !file) return null;
    
    try {
      const compressedFile = await this.compressImage(file);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
      const filePath = `proofs/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error("Supabase Storage Upload Error Detail:", error);
        alert(`Gagal Upload Gambar ke Storage Bucket Supabase!\nPenyebab Error: ${error.message}`);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return publicUrlData ? publicUrlData.publicUrl : null;
    } catch (err) {
      console.error("Compress / Upload exception:", err);
      return null;
    }
  },

  // Insert New Transaction
  async addTransaction(tx, fileObj = null) {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) {
      alert("Supabase SDK belum terhubung di browser!");
      return null;
    }

    let proofUrl = null;
    if (fileObj) {
      proofUrl = await this.uploadProof(fileObj);
    }

    const dbPayload = {
      type: tx.type,
      user_id: tx.userId,
      user_name: tx.userName,
      amount: tx.amount,
      goal_id: tx.goalId || null,
      category: tx.category,
      date: tx.date,
      note: tx.note || null,
      proof_url: proofUrl
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([dbPayload])
      .select();

    if (error) {
      console.error("Supabase Insert Error Detail:", error);
      alert(`Gagal menyimpan ke Supabase Database!\nPenyebab Error: ${error.message}`);
      return null;
    }

    return data ? data[0] : null;
  },

  // Update Existing Transaction
  async updateTransaction(id, tx, fileObj = null) {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) return null;

    let proofUrl = tx.proof;
    if (fileObj) {
      proofUrl = await this.uploadProof(fileObj);
    }

    const dbPayload = {
      type: tx.type,
      user_id: tx.userId,
      user_name: tx.userName,
      amount: tx.amount,
      goal_id: tx.goalId || null,
      category: tx.category,
      date: tx.date,
      note: tx.note || null,
      proof_url: proofUrl
    };

    const { data, error } = await supabase
      .from('transactions')
      .update(dbPayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase Update Error:", error.message);
      return null;
    }
    return data ? data[0] : null;
  },

  // Delete Transaction (including auto-delete proof file from Storage)
  async deleteTransaction(id, proofUrl = null) {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) return false;

    // 1. If proofUrl exists, extract file path and delete from Supabase Storage
    if (proofUrl && proofUrl.includes(BUCKET_NAME)) {
      try {
        // Extract relative file path from Public URL
        // Example URL: .../storage/v1/object/public/transfer-proofs/proofs/123456.jpg
        const urlParts = proofUrl.split(`${BUCKET_NAME}/`);
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

          if (storageError) {
            console.warn("Storage Proof File Delete Warning:", storageError.message);
          }
        }
      } catch (err) {
        console.warn("Proof image delete exception:", err);
      }
    }

    // 2. Delete Transaction Record from Database
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase Delete Transaction Error:", error.message);
      return false;
    }
    return true;
  },

  // Insert New Goal
  async addGoal(goal) {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) return null;

    const dbPayload = {
      id: goal.id,
      title: goal.title,
      target_amount: goal.targetAmount,
      icon: goal.icon,
      color: goal.color
    };

    const { data, error } = await supabase
      .from('goals')
      .insert([dbPayload])
      .select();

    if (error) {
      console.error("Supabase Insert Goal Error:", error.message);
      return null;
    }

    return data ? data[0] : null;
  },

  // Update Goal
  async updateGoal(id, goal) {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) return null;

    const dbPayload = {
      title: goal.title,
      target_amount: goal.targetAmount,
      icon: goal.icon
    };

    const { data, error } = await supabase
      .from('goals')
      .update(dbPayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase Update Goal Error:", error.message);
      return null;
    }
    return data ? data[0] : null;
  },

  // Delete Goal
  async deleteGoal(id) {
    if (!supabase) supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase Delete Goal Error:", error.message);
      return false;
    }
    return true;
  }
};

// Explicitly bind to window object
window.SupabaseService = SupabaseService;
