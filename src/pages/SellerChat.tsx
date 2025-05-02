import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCurrentUser,
  fetchSellerDetails,
  fetchAdminSellerMessages,
  sendAdminMessage,
  supabase,
} from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaArrowLeft } from "react-icons/fa";

// Update message type to match actual database schema
type Message = {
  id: string;
  seller_id: string; // Replaces from_id
  customer_id: string; // Replaces to_id
  message: string;
  sender: "SELLER" | "CUSTOMER"; // SELLER = Admin, CUSTOMER = Seller
  created_at: string;
  read: boolean;
};

type Seller = {
  first_name: string;
  last_name: string;
  email: string;
  photo_url?: string;
};

export default function SellerChat() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [seller, setSeller] = useState<Seller | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    seller: true,
    messages: true,
    send: false,
  });

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Load admin info
  useEffect(() => {
    const loadAdminInfo = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        if (!currentUser?.user_id) {
          navigate(-1);
          return;
        }
        setAdminId(currentUser.user_id);
      } catch (error) {
        console.error("Error loading admin info:", error);
        navigate("/home");
      }
    };

    loadAdminInfo();
  }, [navigate]);

  // Load seller info
  useEffect(() => {
    const loadSellerInfo = async () => {
      if (!sellerId) return;

      try {
        const sellerData = await fetchSellerDetails(sellerId);
        setSeller(sellerData);
      } catch (error) {
        console.error("Error loading seller info:", error);
      } finally {
        setLoading((prev) => ({ ...prev, seller: false }));
      }
    };

    loadSellerInfo();
  }, [sellerId]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!sellerId || !adminId) return;

      try {
        const messagesData = await fetchAdminSellerMessages(sellerId, adminId);
        setMessages(messagesData);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    };

    if (adminId) {
      loadMessages();
    }
  }, [sellerId, adminId]);

  // Real-time message subscription
  useEffect(() => {
    const channel = supabase
      .channel("realtime messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          // Adapt the check to the new schema
          const newMsg = payload.new as Message;
          if (
            (newMsg.seller_id === sellerId && newMsg.customer_id === adminId) ||
            (newMsg.seller_id === adminId && newMsg.customer_id === sellerId)
          ) {
            setMessages((prev) => {
              const msgExists = prev.some((m) => m.id === newMsg.id);
              if (!msgExists) {
                setTimeout(scrollToBottom, 100);
                return [...prev, newMsg];
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId, adminId]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId || !sellerId) return;

    setLoading((prev) => ({ ...prev, send: true }));
    try {
      await sendAdminMessage(adminId, sellerId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading((prev) => ({ ...prev, send: false }));
    }
  };

  return (
    <div className="flex font-poppins">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 h-[calc(100vh-80px)]">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <FaArrowLeft className="text-gray-700" />
            </button>
            <h2 className="text-2xl font-bold">
              Chat with{" "}
              {`${seller?.first_name || ""} ${seller?.last_name || ""}`}
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-md h-[calc(100%-60px)] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b">
              {loading.seller ? (
                <div className="h-6 w-40 animate-pulse bg-gray-200 rounded"></div>
              ) : seller ? (
                <div className="flex items-center">
                  {seller.photo_url && (
                    <img
                      src={seller.photo_url}
                      alt={`${seller.first_name} ${seller.last_name}`}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {seller.first_name} {seller.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{seller.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-500">Seller not found</p>
              )}
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {loading.messages ? (
                <div className="flex justify-center">
                  <div className="loader">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-500 my-6">
                  No previous messages. Start a conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      // If sender is SELLER and the seller_id matches adminId, it's from the admin
                      // Or if sender is CUSTOMER and the customer_id matches adminId, it's from the admin
                      // Otherwise, it's from the seller
                      (msg.sender === "SELLER" && msg.seller_id === adminId) ||
                      (msg.sender === "CUSTOMER" && msg.customer_id === adminId)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        (msg.sender === "SELLER" &&
                          msg.seller_id === adminId) ||
                        (msg.sender === "CUSTOMER" &&
                          msg.customer_id === adminId)
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="break-words">{msg.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          (msg.sender === "SELLER" &&
                            msg.seller_id === adminId) ||
                          (msg.sender === "CUSTOMER" &&
                            msg.customer_id === adminId)
                            ? "text-green-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={loading.seller || !seller}
                  className="flex-1 rounded-lg border border-gray-300 py-2 px-4 focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={
                    !newMessage.trim() ||
                    loading.send ||
                    loading.seller ||
                    !seller
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.send ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
