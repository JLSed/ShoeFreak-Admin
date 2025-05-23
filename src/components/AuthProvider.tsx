import { useEffect, createContext, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type AuthProviderProps = {
  children: React.ReactNode;
};

type AdminType = "ADMIN" | "SUPER ADMIN";

type AuthContextType = {
  adminType: AdminType | null;
  isSuperAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  adminType: null,
  isSuperAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

const protectedRoutes = [
  "/home",
  "/user-accounts",
  "/seller-accounts",
  "/admin-manage",
  "/product-moderation",
  "/chat",
  "/middleman",
  "/post-moderation",
  "/post-detail",
  "/audit-logs",
  "/service-fees",
];

export default function AuthProvider({ children }: AuthProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminType, setAdminType] = useState<AdminType | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If not logged in and trying to access protected route, redirect to login
      const isProtected = protectedRoutes.some((route) =>
        location.pathname.startsWith(route)
      );
      if (!user && isProtected) {
        navigate("/", { replace: true });
        return;
      }

      // If logged in, check if user is an admin type
      if (user) {
        const { data, error } = await supabase
          .from("Users")
          .select("type")
          .eq("user_id", user.id)
          .single();

        if (error || !data || !data.type.includes("ADMIN")) {
          await supabase.auth.signOut();
          navigate("/", { replace: true });
          return;
        }

        // Set the admin type
        setAdminType(data.type as AdminType);

        // Special case: If trying to access Admin Manage but not SUPER ADMIN
        if (
          location.pathname.startsWith("/admin-manage") &&
          data.type !== "SUPER ADMIN"
        ) {
          navigate("/home", { replace: true });
          return;
        }
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isSuperAdmin = adminType === "SUPER ADMIN";

  return (
    <AuthContext.Provider value={{ adminType, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
