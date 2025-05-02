import { useEffect, useState } from "react";
import {
  fetchUsersByType,
  banUserAccount,
  sendPasswordRecovery,
} from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function UserAccounts() {
  const [users, setUsers] = useState<
    {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      status: string;
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
        const customers = await fetchUsersByType("CUSTOMER");
        setUsers(customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchData();
  }, []);

  const handleBanAccount = async (userId: string) => {
    try {
      await banUserAccount(userId);
      alert("User account has been banned.");
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

  const handleMessage = () => {
    console.log("message");
  };

  return (
    <div className="flex font-poppins">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">User Accounts</h2>

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
              <button
                onClick={() => selectedUser && handleMessage()}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!selectedUser}
              >
                Message
              </button>
            </div>
            <p>Seleted User: {selectedUser?.email}</p>
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
                      {user.status}
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
