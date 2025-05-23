import { useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaUsers,
  FaStore,
  FaTools,
  FaBoxOpen,
  FaRegFile,
  FaHistory,
  FaLock,
  FaMoneyBill,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useAuth } from "./AuthProvider";
import { useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleAdminManageClick = () => {
    if (isSuperAdmin) {
      navigate("/admin-manage");
    }
  };

  const handleServiceFeesClick = () => {
    if (isSuperAdmin) {
      navigate("/service-fees");
    }
  };

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
        <div className="relative">
          <button
            onClick={handleAdminManageClick}
            onMouseEnter={() => !isSuperAdmin && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`w-full flex items-center text-left py-2 px-4 rounded-md ${
              isSuperAdmin
                ? "hover:bg-green-700"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <FaTools className="mr-3" />
            Admin Manage
            {!isSuperAdmin && <FaLock className="ml-2 text-xs" />}
          </button>

          {showTooltip && !isSuperAdmin && (
            <div className="absolute left-full ml-2 w-48 px-3 py-2 bg-gray-800 text-xs rounded shadow-lg">
              Only Super Admin can access this section
            </div>
          )}
        </div>
        <button
          onClick={() => navigate("/product-moderation")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaBoxOpen className="mr-3" />
          Product Moderation
        </button>
        <button
          onClick={() => navigate("/post-moderation")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaRegFile className="mr-3" />
          Post Moderation
        </button>
        <button
          onClick={handleServiceFeesClick}
          onMouseEnter={() => !isSuperAdmin && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`w-full flex items-center text-left py-2 px-4 rounded-md ${
            isSuperAdmin
              ? "hover:bg-green-700"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <FaMoneyBill className="mr-3" />
          Service Fees
          {!isSuperAdmin && <FaLock className="ml-2 text-xs" />}
        </button>
        <button
          onClick={() => navigate("/audit-logs")}
          className="w-full flex items-center text-left py-2 px-4 rounded-md hover:bg-green-700"
        >
          <FaHistory className="mr-3" />
          Audit Logs
        </button>
      </nav>
    </aside>
  );
}
