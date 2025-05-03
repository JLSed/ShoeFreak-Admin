import { useEffect, useState, useRef } from "react";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import { fetchCurrentUser } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
    photo_url: string;
  } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/SFLogo.png" alt="Logo" className="h-10 w-10" />
        <h1 className="ml-3 text-xl font-bold text-gray-800">ShoeFreak</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <FaBell className="text-gray-600 h-6 w-6 cursor-pointer hover:text-gray-800" />
        {user && (
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="text-gray-800 font-medium">
                Welcome, {user.first_name.charAt(0)}. {user.last_name}
              </span>
              <img
                src={user.photo_url || "https://via.placeholder.com/40"}
                alt="User Avatar"
                className="h-10 w-10 rounded-full border border-gray-300"
              />
            </div>

            {/* Profile Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="mr-2" />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
