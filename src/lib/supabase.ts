import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const loginWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const fetchUsersByType = async (type: string) => {
  const { data, error } = await supabase
    .from("Users")
    .select("*")
    .eq("type", type);

  if (error) {
    throw error;
  }

  return data;
};

export const fetchCurrentUser = async () => {
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unable to fetch current user");
  }

  const { data, error: userError } = await supabase
    .from("Users")
    .select("user_id, first_name, last_name, photo_url")
    .eq("user_id", user.user.id)
    .single();

  if (userError) {
    throw userError;
  }

  return data;
};

// Ban Account API
export const banUserAccount = async (userId: string) => {
  const { error } = await supabase
    .from("Users")
    .update({ status: "BANNED" })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Send Password Recovery API
export const sendPasswordRecovery = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Create new admin account
export const createAdminAccount = async (userData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  photo_url: string;
  address: string;
  brith_date: string;
  contact_number: string;
}) => {
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error("Failed to create auth user");
  }

  // Then create user profile
  const { error: profileError } = await supabase.from("Users").insert([
    {
      user_id: authData.user.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      photo_url: userData.photo_url,
      address: userData.address,
      brith_date: userData.brith_date,
      contact_number: userData.contact_number,
      type: "ADMIN",
      status: "ACTIVE",
    },
  ]);

  if (profileError) {
    throw profileError;
  }

  return { success: true };
};

/**
 * Uploads an image to Supabase Storage in the userProfile folder
 * @param file - The file to upload
 * @param fileName - Optional custom file name
 * @returns URL of the uploaded image
 */
export const uploadProfileImage = async (
  file: File,
  fileName?: string
): Promise<string> => {
  // Generate a unique file name if not provided
  const uniqueFileName =
    fileName || `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

  // Upload the file to the 'userProfile' folder in the 'images' bucket
  const { data, error } = await supabase.storage
    .from("images")
    .upload(`userProfile/${uniqueFileName}`, file, {
      cacheControl: "3600",
      upsert: false, // Set to true if you want to replace existing files
    });

  if (error) {
    throw error;
  }

  if (!data || !data.path) {
    throw new Error("Failed to upload image");
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(`userProfile/${uniqueFileName}`);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Failed to get public URL for the uploaded image");
  }

  return publicUrlData.publicUrl;
};

// Fetch all shoes with user information
export const fetchAllShoes = async () => {
  const { data, error } = await supabase
    .from("Shoes")
    .select(
      `
      shoe_id,
      created_at,
      shoe_name,
      price,
      color,
      size,
      image_url,
      status,
      published_by,
      Users (
        first_name,
        last_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Update shoe status to REMOVED
export const removeShoe = async (shoeId: string) => {
  const { error } = await supabase
    .from("Shoes")
    .update({ status: "REMOVED" })
    .eq("shoe_id", shoeId);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Fetch messages between admin and seller
export const fetchAdminSellerMessages = async (
  sellerId: string,
  adminId: string
) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(seller_id.eq.${sellerId},customer_id.eq.${adminId}),and(seller_id.eq.${adminId},customer_id.eq.${sellerId})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// Send message from admin to seller
export const sendAdminMessage = async (
  adminId: string,
  sellerId: string,
  message: string
) => {
  // When admin sends message to seller:
  // - Admin is treated as "SELLER" in the sender column
  // - Admin ID goes to seller_id (from_id)
  // - Seller ID goes to customer_id (to_id)
  const { data, error } = await supabase.from("messages").insert([
    {
      seller_id: adminId, // Admin is the sender
      customer_id: sellerId, // Seller is the recipient
      message,
      sender: "SELLER", // Admin is treated as "SELLER" in sender field
      read: false,
    },
  ]);

  if (error) {
    throw error;
  }

  return data;
};

// Fetch seller details
export const fetchSellerDetails = async (sellerId: string) => {
  const { data, error } = await supabase
    .from("Users")
    .select("first_name, last_name, email, photo_url")
    .eq("user_id", sellerId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Logs out the current user
 * @returns A promise that resolves when the user is logged out
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return { success: true };
};

type Checkout = {
  checkout_id: string;
  created_at: string;
  shoe_id: string;
  buyer_id: string;
  payment_method: string;
  Shoes: {
    shoe_name: string;
    price: number;
    image_url: string;
    published_by: string;
  };
  Users: {
    first_name: string;
    last_name: string;
    email: string;
  };
  Seller: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

// Fetch all middle man checkouts
export const fetchMiddleManCheckouts = async (): Promise<Checkout[]> => {
  const { data, error } = await supabase
    .from("checkouts")
    .select(
      `
      checkout_id,
      created_at,
      shoe_id,
      buyer_id,
      payment_method,
      Shoes (
        shoe_name,
        price,
        image_url,
        published_by
      ),
      Users:buyer_id (
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("payment_method", "Middle Man")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  // Get seller information for each checkout
  const checkoutsWithSeller = await Promise.all(
    data.map(async (checkout) => {
      try {
        const { data: sellerData } = await supabase
          .from("Users")
          .select("first_name, last_name, email")
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .eq("user_id", checkout.Shoes.published_by)
          .single();

        return {
          ...checkout,
          Seller: sellerData,
        };
      } catch (error) {
        console.error("Error fetching seller data:", error);
        return {
          ...checkout,
          Seller: null,
        };
      }
    })
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return checkoutsWithSeller;
};
