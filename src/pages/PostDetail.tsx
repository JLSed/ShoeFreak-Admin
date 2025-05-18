import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPostDetails,
  deletePost,
  fetchCurrentUser,
} from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  FaTrash,
  FaArrowLeft,
  FaThumbsUp,
  FaComment,
  FaTimes,
} from "react-icons/fa";
import { format } from "date-fns";

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  Users: {
    first_name: string;
    last_name: string;
    photo_url: string | null;
  };
};

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
  comments: Comment[];
};

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  // Get current admin user
  useEffect(() => {
    const getCurrentAdmin = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setAdminId(currentUser.user_id);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    getCurrentAdmin();
  }, []);

  useEffect(() => {
    const loadPostDetails = async () => {
      if (!postId) return;
      setLoading(true);
      setError(null);

      try {
        const postData = await fetchPostDetails(postId);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setPost(postData);
      } catch (error) {
        console.error("Error loading post:", error);
        setError("Failed to load post details.");
      } finally {
        setLoading(false);
      }
    };

    loadPostDetails();
  }, [postId]);

  const handleDeletePost = async () => {
    if (!post || !adminId) return;

    setDeleting(true);
    try {
      await deletePost(post.id, adminId);
      setShowDeleteModal(false);
      navigate("/post-moderation", {
        state: { message: "Post deleted successfully" },
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post. Please try again.");
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  if (loading) {
    return (
      <div className="flex h-screen font-poppins">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6 flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-screen font-poppins">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
              {error || "Post not found"}
            </div>
            <button
              onClick={() => navigate("/post-moderation")}
              className="flex items-center text-green-600 hover:text-green-800"
            >
              <FaArrowLeft className="mr-2" /> Back to Post Moderation
            </button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-poppins">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/post-moderation")}
              className="flex items-center text-green-600 hover:text-green-800"
            >
              <FaArrowLeft className="mr-2" /> Back to Post Moderation
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <FaTrash className="mr-2" /> Delete Post
            </button>
          </div>

          {/* Post Content */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            {/* User Info */}
            <div className="p-6 border-b flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img
                  src={post.Users.photo_url || "/default-avatar.png"}
                  alt={`${post.Users.first_name} ${post.Users.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-lg text-gray-900">
                  {post.Users.first_name} {post.Users.last_name}
                </p>
                <p className="text-sm text-gray-500">{post.Users.email}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(post.created_at)}
                  {post.updated_at !== post.created_at &&
                    ` (edited ${formatDate(post.updated_at)})`}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-6">
              <p className="text-gray-800 text-lg mb-6 whitespace-pre-line">
                {post.content}
              </p>

              {post.image_url && (
                <div className="mb-6">
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="max-h-96 rounded-lg mx-auto"
                  />
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center mr-6">
                  <FaThumbsUp className="mr-1" />
                  {post.likesCount} likes
                </div>
                <div className="flex items-center">
                  <FaComment className="mr-1" />
                  {post.comments.length} comments
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">
                Comments ({post.comments.length})
              </h3>
            </div>

            <div className="divide-y">
              {post.comments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No comments on this post.
                </div>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="p-4">
                    <div className="flex items-start mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={comment.Users.photo_url || "/default-avatar.png"}
                          alt={`${comment.Users.first_name} ${comment.Users.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm text-gray-900">
                            {comment.Users.first_name} {comment.Users.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                        <p className="mt-1 text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Deletion
              </h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
              >
                {deleting ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
