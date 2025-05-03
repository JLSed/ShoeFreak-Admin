import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type AuthProviderProps = {
  children: React.ReactNode;
};

const protectedRoutes = [
  "/home",
  "/user-accounts",
  "/seller-accounts",
  "/admin-manage",
  "/product-moderation",
  "/chat",
  "/middleman",
];

export default function AuthProvider({ children }: AuthProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();

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

      // If logged in, check if user is ADMIN
      if (user) {
        const { data, error } = await supabase
          .from("Users")
          .select("type")
          .eq("user_id", user.id)
          .single();

        if (error || !data || data.type !== "ADMIN") {
          await supabase.auth.signOut();
          navigate("/", { replace: true });
          return;
        }
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <>{children}</>;
}
