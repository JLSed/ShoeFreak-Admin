import { useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaUsers,
  FaStore,
  FaTools,
  FaBoxOpen,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="bg-green-800 text-white w-64 max-w-64 flex-1 p-6">
      <nav className="space-y-4">
        <button
          onClick={() => navigate("/home")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <MdDashboard className="mr-3" />
          Dashboard
        </button>
        <button
          onClick={() => navigate("/middleman")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaUserFriends className="mr-3" />
          Middle Man
        </button>
        <button
          onClick={() => navigate("/user-accounts")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaUsers className="mr-3" />
          Users Account
        </button>
        <button
          onClick={() => navigate("/seller-accounts")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaStore className="mr-3" />
          Seller Accounts
        </button>
        <button
          onClick={() => navigate("/admin-manage")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaTools className="mr-3" />
          Admin Manage
        </button>
        <button
          onClick={() => navigate("/product-moderation")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaBoxOpen className="mr-3" />
          Product Moderation
        </button>
      </nav>
    </aside>
  );
}
