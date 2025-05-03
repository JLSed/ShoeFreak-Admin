import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        // User is logged in, check if they're an admin
        const { data: userData, error } = await supabase
          .from("Users")
          .select("type")
          .eq("user_id", sessionData.session.user.id)
          .single();

        if (!error && userData && userData.type === "ADMIN") {
          // User is an admin
          setIsAuthenticated(true);
          setIsAdmin(true);
          setUser(sessionData.session.user);
        } else {
          // Not an admin, sign them out
          await signOut();
        }
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // New sign in, check if admin
          const { data: userData, error } = await supabase
            .from("Users")
            .select("type")
            .eq("user_id", session.user.id)
            .single();

          if (!error && userData && userData.type === "ADMIN") {
            // User is an admin
            setIsAuthenticated(true);
            setIsAdmin(true);
            setUser(session.user);
          } else {
            // Not an admin, sign them out
            await signOut();
          }
        } else if (event === "SIGNED_OUT") {
          // User signed out
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      }
    );

    // Clean up subscription
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Route guard for protected routes
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Public route (accessible only when NOT authenticated)
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
