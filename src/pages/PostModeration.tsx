import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPosts } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaSearch, FaEye, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";

type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  Users: {
    first_name: string;
    last_name: string;
    email: string;
    photo_url: string | null;
  };
  likesCount: number;
  commentsCount: number;
};

export default function PostModeration() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [emailSearch, setEmailSearch] = useState<string>("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (date = "all", email = "") => {
    setLoading(true);
    setError(null);

    try {
      const postsData = await fetchAllPosts(date, email);
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    fetchPosts(dateFilter, emailSearch);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateFilter(value);
    fetchPosts(value, emailSearch);
  };

  const handleViewPost = (postId: string) => {
    navigate(`/post-detail/${postId}`);
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  return (
    <div className="flex h-screen font-poppins">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Post Moderation</h2>
            <button
              onClick={() => navigate("/audit-logs")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md"
            >
              View Audit Logs
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Date Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Filter
                </label>
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Email Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Email
                </label>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="user@example.com"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 px-3 bg-green-600 text-white rounded-r-md hover:bg-green-700"
                    disabled={searching}
                  >
                    {searching ? "..." : "Search"}
                  </button>
                </form>
              </div>
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

          {/* Posts Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">
                No posts found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleViewPost(post.id)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* User Info */}
                  <div className="p-4 border-b flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img
                        src={post.Users.photo_url || "/default-avatar.png"}
                        alt={`${post.Users.first_name} ${post.Users.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {post.Users.first_name} {post.Users.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {post.Users.email}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    {post.image_url && (
                      <div className="mb-3 rounded-md overflow-hidden h-40">
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-gray-700 mb-3">
                      {truncateContent(post.content)}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatDate(post.created_at)}</span>
                      <div className="flex space-x-3">
                        <span>{post.likesCount} likes</span>
                        <span>{post.commentsCount} comments</span>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="px-4 py-3 bg-gray-50 flex justify-center">
                    <button className="flex items-center text-sm text-green-600 hover:text-green-800">
                      <FaEye className="mr-1" /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
