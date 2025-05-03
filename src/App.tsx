import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import UserAccounts from "./pages/UserAccounts";
import SellerAccounts from "./pages/SellerAccounts";
import AdminManage from "./pages/AdminManage";
import ProductModeration from "./pages/ProductModeration";
import SellerChat from "./pages/SellerChat";
import MiddleMan from "./pages/MiddleMan";
import {
  AuthProvider,
  PublicRoute,
  RequireAuth,
} from "./components/AuthProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route - only accessible when not logged in */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected routes - require authentication */}
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/user-accounts"
            element={
              <RequireAuth>
                <UserAccounts />
              </RequireAuth>
            }
          />
          <Route
            path="/seller-accounts"
            element={
              <RequireAuth>
                <SellerAccounts />
              </RequireAuth>
            }
          />
          <Route
            path="/admin-manage"
            element={
              <RequireAuth>
                <AdminManage />
              </RequireAuth>
            }
          />
          <Route
            path="/product-moderation"
            element={
              <RequireAuth>
                <ProductModeration />
              </RequireAuth>
            }
          />
          <Route
            path="/chat/:sellerId"
            element={
              <RequireAuth>
                <SellerChat />
              </RequireAuth>
            }
          />
          <Route
            path="/middleman"
            element={
              <RequireAuth>
                <MiddleMan />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
