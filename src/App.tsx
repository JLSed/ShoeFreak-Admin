import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import UserAccounts from "./pages/UserAccounts";
import SellerAccounts from "./pages/SellerAccounts";
import AdminManage from "./pages/AdminManage";
import ProductModeration from "./pages/ProductModeration";
import PostModeration from "./pages/PostModeration";
import PostDetail from "./pages/PostDetail";
import AuditLogs from "./pages/AuditLogs";
import SellerChat from "./pages/SellerChat";
import MiddleMan from "./pages/MiddleMan";
import AuthProvider from "./components/AuthProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route - only accessible when not logged in */}
          <Route path="/" element={<Login />} />

          {/* Protected routes - require authentication */}
          <Route path="/home" element={<Home />} />
          <Route path="/user-accounts" element={<UserAccounts />} />
          <Route path="/seller-accounts" element={<SellerAccounts />} />
          <Route path="/admin-manage" element={<AdminManage />} />
          <Route path="/product-moderation" element={<ProductModeration />} />
          <Route path="/post-moderation" element={<PostModeration />} />
          <Route path="/post-detail/:postId" element={<PostDetail />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/chat/:sellerId" element={<SellerChat />} />
          <Route path="/middleman" element={<MiddleMan />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
