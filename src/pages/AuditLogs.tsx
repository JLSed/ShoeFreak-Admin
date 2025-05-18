/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuditLogs, fetchAllAdmins } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaFilter, FaTimes } from "react-icons/fa";
import { format } from "date-fns";

type AuditLog = {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  target_data: any;
  action_timestamp: string;
  notes: string;
  Users: {
    first_name: string;
    last_name: string;
    email: string;
    photo_url: string | null;
  };
};

type Admin = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function AuditLogs() {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionType, setActionType] = useState<string>("all");
  const [adminId, setAdminId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    loadAdmins();
    fetchLogs();
  }, []);

  const loadAdmins = async () => {
    try {
      const adminsData = await fetchAllAdmins();
      setAdmins(adminsData);
    } catch (error) {
      console.error("Error loading admins:", error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const actionTypeParam = actionType === "all" ? undefined : actionType;
      const adminIdParam = adminId === "all" ? undefined : adminId;
      const logsData = await fetchAuditLogs(
        actionTypeParam,
        adminIdParam,
        startDate || undefined,
        endDate || undefined
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setAuditLogs(logsData);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setError("Failed to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    fetchLogs();
  };

  const handleFilterReset = () => {
    setActionType("all");
    setAdminId("all");
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      fetchLogs();
    }, 0);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  const formatTargetName = (log: AuditLog) => {
    const { target_type, target_data } = log;
    if (target_type === "POST") {
      return `Post by ${target_data?.Users?.first_name || ""} ${
        target_data?.Users?.last_name || ""
      }`;
    } else if (target_type === "PRODUCT") {
      return target_data?.shoe_name || "Product";
    }
    return target_type;
  };

  return (
    <div className="flex h-screen font-poppins">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Audit Logs</h2>
              <p className="text-gray-500 text-sm">
                View all admin activities on the platform
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md"
            >
              Back
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center">
                <FaFilter className="mr-2 text-green-600" /> Filter Logs
              </h3>
              <button
                onClick={handleFilterReset}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Action Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All Actions</option>
                  <option value="DELETE_POST">Delete Post</option>
                  <option value="DELETE_PRODUCT">Delete Product</option>
                </select>
              </div>

              {/* Admin Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin
                </label>
                <select
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All Admins</option>
                  {admins.map((admin) => (
                    <option key={admin.user_id} value={admin.user_id}>
                      {admin.first_name} {admin.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleFilterApply}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>

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

          {/* Audit Logs Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">
                No audit logs found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            <img
                              src={log.Users.photo_url || "/default-avatar.png"}
                              alt={`${log.Users.first_name} ${log.Users.last_name}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {log.Users.first_name} {log.Users.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.Users.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.action_type.includes("DELETE")
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {log.action_type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTargetName(log)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {log.target_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.action_timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
