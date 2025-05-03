import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllShoes, removeShoe } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaTrash, FaEnvelope, FaTimes } from "react-icons/fa";

type Shoe = {
  shoe_id: string;
  created_at: string;
  shoe_name: string;
  price: number;
  color: string[];
  size: number[];
  image_url: string;
  status: string;
  published_by: string;
  Users:
    | {
        first_name: string;
        last_name: string;
        email: string;
      }
    | {
        first_name: string;
        last_name: string;
        email: string;
      }[];
};

export default function ProductModeration() {
  const navigate = useNavigate();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shoesData = await fetchAllShoes();
        setShoes(shoesData);
      } catch (error) {
        console.error("Error fetching shoes:", error);
      }
    };

    fetchData();
  }, []);

  const handleRemoveProduct = async () => {
    if (!selectedShoe) return;

    setLoading(true);
    setError(null);

    try {
      await removeShoe(selectedShoe.shoe_id);

      // Update local state
      setShoes((prevShoes) =>
        prevShoes.map((shoe) =>
          shoe.shoe_id === selectedShoe.shoe_id
            ? { ...shoe, status: "REMOVED" }
            : shoe
        )
      );

      setSuccess("Product has been removed successfully.");
      setShowModal(false);
    } catch (error) {
      console.error("Error removing product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to remove product."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSeller = () => {
    if (!selectedShoe) return;
    setShowModal(false);
    navigate(`/chat/${selectedShoe.published_by}`);
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
          <h2 className="text-2xl font-bold mb-6">Product Moderation</h2>

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex justify-between items-center">
              <span>{success}</span>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-700 hover:text-green-900"
              >
                <FaTimes />
              </button>
            </div>
          )}

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

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Price
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Colors
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Sizes
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Seller
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                    Date Published
                  </th>
                </tr>
              </thead>
              <tbody>
                {shoes.map((shoe) => (
                  <tr
                    key={shoe.shoe_id}
                    className={`cursor-pointer ${
                      selectedShoe?.shoe_id === shoe.shoe_id
                        ? "bg-green-100"
                        : ""
                    } hover:bg-gray-50`}
                    onClick={() => {
                      setSelectedShoe(shoe);
                      setShowModal(true);
                    }}
                  >
                    <td className="py-3 px-4 text-sm">
                      <img
                        src={shoe.image_url || "https://via.placeholder.com/50"}
                        alt={shoe.shoe_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {shoe.shoe_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      ₱ {shoe.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {Array.isArray(shoe.color)
                        ? shoe.color.join(", ")
                        : typeof shoe.color === "string"
                        ? shoe.color
                        : JSON.stringify(shoe.color)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {Array.isArray(shoe.size)
                        ? shoe.size.join(", ")
                        : typeof shoe.size === "string"
                        ? shoe.size
                        : JSON.stringify(shoe.size)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          shoe.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : shoe.status === "REMOVED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {shoe.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {Array.isArray(shoe.Users)
                        ? `${shoe.Users[0]?.first_name || ""} ${
                            shoe.Users[0]?.last_name || ""
                          }`
                        : `${shoe.Users?.first_name || ""} ${
                            shoe.Users?.last_name || ""
                          }`}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatDate(shoe.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal for Product Actions */}
      {showModal && selectedShoe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Product Actions
              </h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center space-x-4">
              <img
                src={selectedShoe.image_url}
                alt={selectedShoe.shoe_name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h4 className="text-lg font-semibold">
                  {selectedShoe.shoe_name}
                </h4>
                <p className="text-gray-600">
                  <p className="text-sm text-gray-500">
                    Seller:{" "}
                    {Array.isArray(selectedShoe.Users)
                      ? `${selectedShoe.Users[0]?.first_name || ""} ${
                          selectedShoe.Users[0]?.last_name || ""
                        }`
                      : `${selectedShoe.Users?.first_name || ""} ${
                          selectedShoe.Users?.last_name || ""
                        }`}
                  </p>
                </p>
                <p className="text-sm text-gray-500">
                  Status: {selectedShoe.status}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleRemoveProduct}
                disabled={loading || selectedShoe.status === "REMOVED"}
                className={`flex items-center justify-center py-2 px-4 rounded-md ${
                  selectedShoe.status === "REMOVED" || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <FaTrash className="mr-2" />
                {selectedShoe.status === "REMOVED"
                  ? "Product Already Removed"
                  : loading
                  ? "Processing..."
                  : "Remove Product"}
              </button>

              <button
                onClick={handleMessageSeller}
                className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaEnvelope className="mr-2" />
                Message Seller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
