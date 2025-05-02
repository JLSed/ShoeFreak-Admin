import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMiddleManCheckouts } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaUser, FaStore, FaTimes } from "react-icons/fa";

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

export default function MiddleMan() {
  const navigate = useNavigate();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const checkoutsData = await fetchMiddleManCheckouts();
        setCheckouts(checkoutsData);
      } catch (error) {
        console.error("Error fetching middle man checkouts:", error);
        setError("Failed to load middle man checkouts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChatWithBuyer = () => {
    if (!selectedCheckout) return;
    setShowModal(false);
    navigate(`/chat/${selectedCheckout.buyer_id}`);
  };

  const handleChatWithSeller = () => {
    if (!selectedCheckout || !selectedCheckout.Shoes.published_by) return;
    setShowModal(false);
    navigate(`/chat/${selectedCheckout.Shoes.published_by}`);
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex font-poppins">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Middle Man Transactions</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : checkouts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No middle man transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                      Shoe
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                      Price
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                      Buyer
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                      Seller
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                      Transaction Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checkouts.map((checkout) => (
                    <tr
                      key={checkout.checkout_id}
                      className={`cursor-pointer ${
                        selectedCheckout?.checkout_id === checkout.checkout_id
                          ? "bg-green-100"
                          : ""
                      } hover:bg-gray-50`}
                      onClick={() => {
                        setSelectedCheckout(checkout);
                        setShowModal(true);
                      }}
                    >
                      <td className="py-3 px-4 text-sm">
                        <img
                          src={
                            checkout.Shoes.image_url ||
                            "https://via.placeholder.com/50"
                          }
                          alt={checkout.Shoes.shoe_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {checkout.Shoes.shoe_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        ${checkout.Shoes.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {checkout.Users.first_name} {checkout.Users.last_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {checkout.Seller
                          ? `${checkout.Seller.first_name} ${checkout.Seller.last_name}`
                          : "Unknown Seller"}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDate(checkout.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal for Chat Options */}
      {showModal && selectedCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chat Options</h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-lg font-semibold">
                {selectedCheckout.Shoes.shoe_name}
              </h4>
              <p className="text-gray-600">
                ${selectedCheckout.Shoes.price.toFixed(2)}
              </p>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <p>
                  <span className="font-medium">Buyer:</span>{" "}
                  {selectedCheckout.Users.first_name}{" "}
                  {selectedCheckout.Users.last_name}
                </p>
                <p>
                  <span className="font-medium">Seller:</span>{" "}
                  {selectedCheckout.Seller
                    ? `${selectedCheckout.Seller.first_name} ${selectedCheckout.Seller.last_name}`
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleChatWithBuyer}
                className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaUser className="mr-2" />
                Chat with Buyer
              </button>

              <button
                onClick={handleChatWithSeller}
                disabled={!selectedCheckout.Seller}
                className={`flex items-center justify-center py-2 px-4 rounded-md ${
                  !selectedCheckout.Seller
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                <FaStore className="mr-2" />
                Chat with Seller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
