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
    .select("*")
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
export const removeShoe = async (shoeId: string, adminId: string) => {
  // First, get the shoe data to store in audit log
  const { data: shoeData, error: fetchError } = await supabase
    .from("Shoes")
    .select(
      `
      shoe_id,
      shoe_name,
      price,
      color,
      size,
      image_url,
      status,
      published_by,
      created_at,
      Users:published_by (
        first_name,
        last_name,
        email
      )
      `
    )
    .eq("shoe_id", shoeId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Update the shoe status to REMOVED
  const { error } = await supabase
    .from("Shoes")
    .update({ status: "REMOVED" })
    .eq("shoe_id", shoeId);

  if (error) {
    throw error;
  }

  // Log the action in audit log
  const { error: auditError } = await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action_type: "DELETE_PRODUCT",
    target_type: "PRODUCT",
    target_id: shoeId,
    target_data: shoeData,
    notes: `Product "${shoeData.shoe_name}" removed by admin`,
  });

  if (auditError) {
    console.error("Error logging audit:", auditError);
    // Continue even if audit logging fails
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

// Fetch all posts with user information
export const fetchAllPosts = async (
  dateFilter?: string,
  emailFilter?: string
) => {
  let query = supabase
    .from("posts")
    .select(
      `
      id, 
      user_id, 
      content, 
      image_url, 
      created_at,
      updated_at,
      Users:user_id (
        first_name,
        last_name,
        email,
        photo_url
      ),
      post_likes!post_likes_post_id_fkey (
        id
      ),
      comments!comments_post_id_fkey (
        id
      )
    `
    )
    .order("created_at", { ascending: false });

  // Apply date filter if provided
  if (dateFilter && dateFilter !== "all") {
    const today = new Date();
    let startDate;

    switch (dateFilter) {
      case "today":
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        query = query.gte("created_at", startDate.toISOString());
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        query = query.gte("created_at", startDate.toISOString());
        break;
      case "month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        query = query.gte("created_at", startDate.toISOString());
        break;
      // "all" case doesn't need any filter
    }
  }

  // Apply email filter if provided
  if (emailFilter && emailFilter.trim() !== "") {
    // First, find users matching the email filter
    const { data: users, error: userError } = await supabase
      .from("Users")
      .select("user_id")
      .ilike("email", `%${emailFilter}%`);

    if (userError) {
      throw userError;
    }

    if (users && users.length > 0) {
      const userIds = users.map((user) => user.user_id);
      query = query.in("user_id", userIds);
    } else {
      // No matching users found, return empty array
      return [];
    }
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  // Calculate counts properly

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return data.map((post) => ({
    id: post.id,
    user_id: post.user_id,
    content: post.content,
    image_url: post.image_url,
    created_at: post.created_at,
    updated_at: post.updated_at,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Users: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      first_name: post.Users?.first_name || "",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      last_name: post.Users?.last_name || "",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      email: post.Users?.email || "",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      photo_url: post.Users?.photo_url || null,
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    likesCount: post.post_likes ? post.post_likes.length : 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    commentsCount: post.comments ? post.comments.length : 0,
  }));
};

// Fetch a single post with detailed information
export const fetchPostDetails = async (postId: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, 
      user_id, 
      content, 
      image_url, 
      created_at,
      updated_at,
      Users:user_id (
        first_name,
        last_name,
        email,
        photo_url
      )
    `
    )
    .eq("id", postId)
    .single();

  if (error) {
    throw error;
  }

  // Get likes count
  const { count: likesCount, error: likesError } = await supabase
    .from("post_likes")
    .select("id", { count: "exact" })
    .eq("post_id", postId);

  if (likesError) {
    throw likesError;
  }

  // Get comments with user information
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(
      `
      id,
      post_id,
      user_id,
      content,
      created_at,
      Users:user_id (
        first_name,
        last_name,
        photo_url
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw commentsError;
  }

  return {
    ...data,
    likesCount: likesCount ?? 0,
    comments: comments ?? [],
  };
};

// Delete a post
export const deletePost = async (postId: string, adminId: string) => {
  // First, get the post data to store in audit log
  const { data: postData, error: fetchError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Delete the post
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    throw error;
  }

  // Log the action in audit log
  const { error: auditError } = await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action_type: "DELETE_POST",
    target_type: "POST",
    target_id: postId,
    target_data: postData,
    notes: `Post deleted by admin`,
  });

  if (auditError) {
    console.error("Error logging audit:", auditError);
    // Continue even if audit logging fails
  }

  return { success: true };
};

// Fetch audit logs
export const fetchAuditLogs = async (
  actionType?: string,
  adminId?: string,
  startDate?: string,
  endDate?: string
) => {
  let query = supabase
    .from("admin_audit_logs")
    .select(
      `
      id,
      admin_id,
      action_type,
      target_type,
      target_id,
      target_data,
      action_timestamp,
      notes,
      Users:admin_id (
        first_name,
        last_name,
        email,
        photo_url
      )
    `
    )
    .order("action_timestamp", { ascending: false });

  // Apply filters
  if (actionType) {
    query = query.eq("action_type", actionType);
  }

  if (adminId) {
    query = query.eq("admin_id", adminId);
  }

  if (startDate) {
    query = query.gte("action_timestamp", startDate);
  }

  if (endDate) {
    // Add one day to include the entire end date
    const endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    query = query.lt("action_timestamp", endDateObj.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

// Fetch all admins for the filter dropdown
export const fetchAllAdmins = async () => {
  const { data, error } = await supabase
    .from("Users")
    .select("user_id, first_name, last_name, email")
    .eq("type", "ADMIN");

  if (error) {
    throw error;
  }

  return data;
};
