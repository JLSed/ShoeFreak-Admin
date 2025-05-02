import { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { fetchUsersByType } from "../lib/supabase";

export default function Home() {
  const [userCount, setUserCount] = useState(0);
  const [sellerCount, setSellerCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await fetchUsersByType("CUSTOMER");
        const sellers = await fetchUsersByType("SELLER");

        setUserCount(users.length);
        setSellerCount(sellers.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex font-poppins">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700">
                Users Registered
              </h3>
              <p className="text-3xl font-bold text-gray-900">{userCount}</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700">
                Sellers Registered
              </h3>
              <p className="text-3xl font-bold text-gray-900">{sellerCount}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
