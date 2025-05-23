import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaTimes, FaEdit, FaSave } from "react-icons/fa";

type ServiceFee = {
  id: string;
  service_name: string;
  service_price: number;
  created_at: string;
};

export default function ServiceFees() {
  const [serviceFees, setServiceFees] = useState<ServiceFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newFee, setNewFee] = useState({
    service_name: "",
    service_price: 0,
  });
  const [editedFee, setEditedFee] = useState({
    service_name: "",
    service_price: 0,
  });

  useEffect(() => {
    fetchServiceFees();
  }, []);

  const fetchServiceFees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_fee")
        .select("*")
        .order("service_name", { ascending: true });

      if (error) {
        throw error;
      }

      setServiceFees(data || []);
    } catch (error) {
      console.error("Error fetching service fees:", error);
      setError("Failed to load service fees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!newFee.service_name) {
      setError("Service name is required");
      return;
    }

    if (newFee.service_price < 0) {
      setError("Price cannot be negative");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("service_fee")
        .insert([
          {
            service_name: newFee.service_name,
            service_price: newFee.service_price,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      setServiceFees([...serviceFees, data[0]]);
      setSuccess(`${newFee.service_name} fee has been added successfully.`);
      setShowAddModal(false);
      setNewFee({ service_name: "", service_price: 0 });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error adding service fee:", error);
      setError("Failed to add service fee. Please try again.");
    }
  };

  const handleEditFee = async (id: string) => {
    // If we're not in edit mode, start editing
    if (editingId !== id) {
      const feeToEdit = serviceFees.find((fee) => fee.id === id);
      if (feeToEdit) {
        setEditingId(id);
        setEditedFee({
          service_name: feeToEdit.service_name,
          service_price: feeToEdit.service_price,
        });
      }
      return;
    }

    // Otherwise, save the edits
    setError(null);

    // Validate inputs
    if (!editedFee.service_name) {
      setError("Service name is required");
      return;
    }

    if (editedFee.service_price < 0) {
      setError("Price cannot be negative");
      return;
    }

    try {
      const { error } = await supabase
        .from("service_fee")
        .update({
          service_name: editedFee.service_name,
          service_price: editedFee.service_price,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setServiceFees(
        serviceFees.map((fee) =>
          fee.id === id ? { ...fee, ...editedFee } : fee
        )
      );
      setSuccess("Fee updated successfully.");
      setEditingId(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating service fee:", error);
      setError("Failed to update service fee. Please try again.");
    }
  };

  // const handleDeleteFee = async (id: string) => {
  //   if (!window.confirm("Are you sure you want to delete this fee?")) {
  //     return;
  //   }

  //   setError(null);

  //   try {
  //     const { error } = await supabase
  //       .from("service_fee")
  //       .delete()
  //       .eq("id", id);

  //     if (error) {
  //       throw error;
  //     }

  //     setServiceFees(serviceFees.filter((fee) => fee.id !== id));
  //     setSuccess("Fee deleted successfully.");
  //     setEditingId(null);

  //     // Clear success message after 3 seconds
  //     setTimeout(() => setSuccess(null), 3000);
  //   } catch (error) {
  //     console.error("Error deleting service fee:", error);
  //     setError("Failed to delete service fee. Please try again.");
  //   }
  // };

  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price);
  };

  return (
    <div className="flex h-screen font-poppins">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Service Fees Management</h2>
            {/* <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Add New Fee
            </button> */}
          </div>

          {/* Success Message */}
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

          {/* Error Message */}
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

          {/* Service Fees Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : serviceFees.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">
                No service fees found. Add your first service fee.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Service Name
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Price
                    </th>
                    <th className="py-3 px-6 text-right text-sm font-medium text-gray-700">
                      Edit Service
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {editingId === fee.id ? (
                          <input
                            type="text"
                            value={editedFee.service_name}
                            onChange={(e) =>
                              setEditedFee({
                                ...editedFee,
                                service_name: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        ) : (
                          fee.service_name
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {editingId === fee.id ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editedFee.service_price}
                            onChange={(e) =>
                              setEditedFee({
                                ...editedFee,
                                service_price: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        ) : (
                          formatPrice(fee.service_price)
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-right space-x-2">
                        {editingId === fee.id ? (
                          <button
                            onClick={() => handleEditFee(fee.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <FaSave className="inline h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditFee(fee.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit className="inline h-5 w-5" />
                          </button>
                        )}
                        {/* <button
                          onClick={() => handleDeleteFee(fee.id)}
                          className="text-red-600 hover:text-red-800 ml-3"
                        >
                          <FaTrash className="inline h-4 w-4" />
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Add New Fee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Add New Service Fee
              </h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setShowAddModal(false)}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFee}>
              <div className="mb-4">
                <label
                  htmlFor="service_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Service Name
                </label>
                <input
                  type="text"
                  id="service_name"
                  value={newFee.service_name}
                  onChange={(e) =>
                    setNewFee({ ...newFee, service_name: e.target.value })
                  }
                  required
                  placeholder="e.g., Shipping Fee, Middleman Fee"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="service_price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Service Price (PHP)
                </label>
                <input
                  type="number"
                  id="service_price"
                  value={newFee.service_price}
                  onChange={(e) =>
                    setNewFee({
                      ...newFee,
                      service_price: parseFloat(e.target.value),
                    })
                  }
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
