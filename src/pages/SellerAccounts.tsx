import { useEffect, useState } from "react";
import {
  fetchUsersByType,
  banUserAccount,
  sendPasswordRecovery,
} from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { formatDistanceToNow, isValid } from "date-fns";

export default function SellerAccounts() {
  const [users, setUsers] = useState<
    {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      status: string;
      last_sign_in_at: string | null;
    }[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<null | {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellers = await fetchUsersByType("SELLER");
        console.log("Fetched sellers:", sellers);
        setUsers(sellers);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };

    fetchData();
  }, []);

  const formatLastSignIn = (dateString: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    if (!isValid(date)) return "Invalid date";

    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Unknown";
    }
  };

  const handleBanAccount = async (userId: string) => {
    try {
      await banUserAccount(userId);
      alert("Seller account has been banned.");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: "BANNED" } : user
        )
      );
    } catch (error) {
      console.error("Error banning account:", error);
      alert("Failed to ban the account.");
    }
  };

  const handleSendPasswordRecovery = async (email: string) => {
    try {
      await sendPasswordRecovery(email);
      alert("Password recovery email has been sent.");
    } catch (error) {
      console.error("Error sending password recovery email:", error);
      alert("Failed to send password recovery email.");
    }
  };

  return (
    <div className="flex h-svh font-poppins">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Seller Accounts</h2>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  selectedUser && handleBanAccount(selectedUser.id)
                }
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!selectedUser}
              >
                Ban Account
              </button>
              <button
                onClick={() =>
                  selectedUser && handleSendPasswordRecovery(selectedUser.email)
                }
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!selectedUser}
              >
                Send Password Recovery
              </button>
            </div>
            <p>Selected User: {selectedUser?.email}</p>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    First Name
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Last Name
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Email
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Last Sign In
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`cursor-pointer ${
                      selectedUser?.id === user.id ? "bg-gray-100" : ""
                    } hover:bg-gray-50`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {user.first_name}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {user.last_name}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : user.status === "BANNED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {formatLastSignIn(user.last_sign_in_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
