import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import UserAccounts from "./pages/UserAccounts";
import SellerAccounts from "./pages/SellerAccounts";
import AdminManage from "./pages/AdminManage";
import ProductModeration from "./pages/ProductModeration";
import SellerChat from "./pages/SellerChat";
import MiddleMan from "./pages/MiddleMan";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/user-accounts" element={<UserAccounts />} />
        <Route path="/seller-accounts" element={<SellerAccounts />} />
        <Route path="/admin-manage" element={<AdminManage />} />
        <Route path="/product-moderation" element={<ProductModeration />} />
        <Route path="/chat/:sellerId" element={<SellerChat />} />
        <Route path="/middleman" element={<MiddleMan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
