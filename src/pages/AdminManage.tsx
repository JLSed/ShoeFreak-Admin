import { useEffect, useState } from "react";
import {
  fetchUsersByType,
  createAdminAccount,
  uploadProfileImage,
} from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaTimes, FaLock } from "react-icons/fa";

type AdminUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  last_sign_in_at?: string | null;
  type: string;
};

export default function AdminManage() {
  // State for admin accounts
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [superAdmins, setSuperAdmins] = useState<AdminUser[]>([]);

  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  // State for the new admin form
  const [newAdmin, setNewAdmin] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    photo_url: "",
    address: "",
    brith_date: "",
    contact_number: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // State for form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regular admins
        const adminAccounts = await fetchUsersByType("ADMIN");
        setAdmins(adminAccounts);

        // Fetch super admins
        const superAdminAccounts = await fetchUsersByType("SUPER ADMIN");
        setSuperAdmins(superAdminAccounts);
      } catch (error) {
        console.error("Error fetching admin accounts:", error);
      }
    };

    fetchData();
  }, []);

  // Handlers for new admin form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format last sign in date
  const formatLastSignIn = (dateString?: string | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    // Calculate time difference in days
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
    }
  };

  // Modified handleCreateAdmin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload image if selected
      let photoUrl = newAdmin.photo_url;

      if (photoFile) {
        photoUrl = await uploadProfileImage(photoFile);
      }

      // Create admin with the image URL
      await createAdminAccount({
        ...newAdmin,
        photo_url: photoUrl,
      });

      setSuccess("Admin account created successfully!");

      // Reset form
      setNewAdmin({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        photo_url: "",
        address: "",
        brith_date: "",
        contact_number: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);

      // Refresh admin list
      const adminAccounts = await fetchUsersByType("ADMIN");
      setAdmins(adminAccounts);
    } catch (error) {
      console.error("Error creating admin account:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create admin account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex font-poppins">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Admin Management</h2>

          {/* Success/Error Messages */}
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

          {/* Super Admin Accounts Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-semibold mr-2">
                Super Admin Account
              </h3>
            </div>

            {/* Super Admin Table */}
            <div className="overflow-x-auto mb-8">
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
                    <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                      Access
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {superAdmins.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-4 px-6 text-center text-sm text-gray-500"
                      >
                        No super admin accounts found.
                      </td>
                    </tr>
                  ) : (
                    superAdmins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="bg-yellow-50 hover:bg-yellow-100"
                      >
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {admin.first_name}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {admin.last_name}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {admin.email}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              admin.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : admin.status === "BANNED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {formatLastSignIn(admin.last_sign_in_at)}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700 flex items-center">
                          Full Access
                          <FaLock
                            className="ml-2 text-xs text-gray-500"
                            title="Protected Account"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regular Admin Accounts Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Admin Accounts</h3>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-4">
              {selectedAdmin && (
                <p className="text-sm text-gray-600">
                  Selected Admin: {selectedAdmin.first_name}{" "}
                  {selectedAdmin.last_name} ({selectedAdmin.email})
                </p>
              )}
            </div>

            {/* Admin Table */}
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
                  {admins.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 px-6 text-center text-sm text-gray-500"
                      >
                        No admin accounts found.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className={`cursor-pointer ${
                          selectedAdmin?.id === admin.id ? "bg-green-100" : ""
                        } hover:bg-gray-50`}
                        onClick={() => setSelectedAdmin(admin)}
                      >
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {admin.first_name}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {admin.last_name}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {admin.email}
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              admin.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : admin.status === "BANNED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-700">
                          {formatLastSignIn(admin.last_sign_in_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create New Admin Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Create New Admin</h3>

            <form
              onSubmit={handleCreateAdmin}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={newAdmin.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={newAdmin.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newAdmin.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Modified Photo URL/Upload */}
                <div>
                  <label
                    htmlFor="photo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Profile Photo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Or provide a URL
                      </p>
                      <input
                        type="url"
                        id="photo_url"
                        name="photo_url"
                        value={newAdmin.photo_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    {photoPreview && (
                      <div className="w-16 h-16 overflow-hidden rounded-full">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newAdmin.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label
                    htmlFor="brith_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Birth Date
                  </label>
                  <input
                    type="date"
                    id="brith_date"
                    name="brith_date"
                    value={newAdmin.brith_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label
                    htmlFor="contact_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={newAdmin.contact_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
