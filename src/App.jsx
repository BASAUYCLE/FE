import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { PostingProvider } from "./contexts/PostingContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ConfigProvider, App as AntApp } from "antd";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ProtectedRoute from "./components/ProtectedRoute";
import { usePostingStatusNotifications } from "./contexts/usePostingStatusNotifications";
import { fontFamily, antdToken } from "./config/theme";

// Lazy-load trang để app khởi động nhanh hơn
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const GuideBuy = lazy(() => import("./pages/GuideBuy"));
const GuidePayment = lazy(() => import("./pages/GuidePayment"));
const Shipping = lazy(() => import("./pages/Shipping"));
const PaymentPolicy = lazy(() => import("./pages/PaymentPolicy"));
const Complaint = lazy(() => import("./pages/Complaint"));
const ReturnPolicyPage = lazy(() => import("./pages/ReturnPolicy"));
const PrivacyPage = lazy(() => import("./pages/Privacy"));
const Payment = lazy(() => import("./pages/Payment"));
const PaymentResult = lazy(() => import("./pages/Payment/PaymentResult"));
const Wallet = lazy(() => import("./pages/Wallet"));
const PostBike = lazy(() => import("./pages/Post"));
const ManageListings = lazy(() => import("./pages/ManageListings"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Account = lazy(() => import("./pages/Account"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Orders = lazy(() => import("./pages/Orders"));
const MySales = lazy(() => import("./pages/MySales"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminReports = lazy(() => import("./pages/admin/reports"));
const AdminUsers = lazy(() => import("./pages/admin/user"));
const AdminListings = lazy(() => import("./pages/admin/listing"));
const AdminApprovedListings = lazy(
  () => import("./pages/admin/approved-listings"),
);
const AdminRevenue = lazy(() => import("./pages/admin/revenue"));
const AdminInspectionReports = lazy(
  () => import("./pages/admin/inspection-reports"),
);
const AdminTransactions = lazy(() => import("./pages/admin/transaction"));
const AdminConfig = lazy(() => import("./pages/admin/config"));
const InspectorDashboard = lazy(() => import("./pages/inspector/dashboard"));
const InspectorDetail = lazy(() => import("./pages/inspector/detail"));
const InspectorDetailsList = lazy(
  () => import("./pages/inspector/details-list"),
);
const InspectorDisputes = lazy(() => import("./pages/inspector/disputes"));
const UserFeedbackPage = lazy(() => import("./pages/UserFeedback"));

const muiTheme = createTheme({
  palette: { mode: "light" },
  typography: { fontFamily, allVariants: { fontFamily } },
});

function PageFallback() {
  return (
    <div className="app-loading" aria-hidden="true">
      <span>Loading...</span>
    </div>
  );
}

function PostingStatusEffect() {
  usePostingStatusNotifications();
  return null;
}

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ConfigProvider theme={{ token: antdToken }}>
        <AntApp>
          <BrowserRouter>
            <AuthProvider>
              <WishlistProvider>
                <PostingProvider>
                  <OrderProvider>
                    <NotificationProvider>
                      <PostingStatusEffect />
                      <Suspense fallback={<PageFallback />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/guide-buy" element={<GuideBuy />} />
                          <Route
                            path="/guide-payment"
                            element={<GuidePayment />}
                          />
                          <Route path="/shipping" element={<Shipping />} />
                          <Route
                            path="/payment-policy"
                            element={<PaymentPolicy />}
                          />
                          <Route path="/complaint" element={<Complaint />} />
                          <Route
                            path="/return"
                            element={<ReturnPolicyPage />}
                          />
                          <Route path="/privacy" element={<PrivacyPage />} />
                          <Route
                            path="/marketplace"
                            element={<Marketplace />}
                          />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                          />
                          <Route
                            path="/reset-password"
                            element={<ResetPassword />}
                          />
                          <Route
                            path="/payment"
                            element={
                              <ProtectedRoute>
                                <Payment />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/payment/result"
                            element={
                              <ProtectedRoute>
                                <PaymentResult />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/post"
                            element={
                              <ProtectedRoute>
                                <PostBike />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/postings"
                            element={<Navigate to="/manage-listings" replace />}
                          />
                          <Route
                            path="/manage-listings"
                            element={
                              <ProtectedRoute>
                                <ManageListings />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route
                            path="/product/:id"
                            element={<ProductDetail />}
                          />
                          <Route
                            path="/user/:userId/feedback"
                            element={<UserFeedbackPage />}
                          />
                          <Route
                            path="/user-detail"
                            element={<Navigate to="/account" replace />}
                          />
                          <Route
                            path="/set-profile"
                            element={<Navigate to="/account" replace />}
                          />
                          <Route
                            path="/account"
                            element={
                              <ProtectedRoute>
                                <Account />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/wallet"
                            element={
                              <ProtectedRoute>
                                <Wallet />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/orders"
                            element={
                              <ProtectedRoute>
                                <Orders />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/my-sales"
                            element={
                              <ProtectedRoute>
                                <MySales />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/unauthorized"
                            element={<Unauthorized />}
                          />
                          <Route
                            path="/admin-dashboard"
                            element={<AdminDashboard />}
                          />
                          <Route
                            path="/admin-reports"
                            element={<AdminReports />}
                          />
                          <Route path="/admin-users" element={<AdminUsers />} />
                          <Route
                            path="/admin-listings"
                            element={<AdminListings />}
                          />
                          <Route
                            path="/admin-listing"
                            element={<Navigate to="/admin-listings" replace />}
                          />
                          <Route
                            path="/admin-approved-listings"
                            element={<AdminApprovedListings />}
                          />
                          <Route
                            path="/admin-revenue"
                            element={<AdminRevenue />}
                          />
                          <Route
                            path="/admin-inspection-reports"
                            element={<AdminInspectionReports />}
                          />
                          <Route
                            path="/admin-transactions"
                            element={<AdminTransactions />}
                          />
                          <Route
                            path="/admin-config"
                            element={<AdminConfig />}
                          />
                          <Route
                            path="/inspector"
                            element={<InspectorDashboard />}
                          />
                          <Route
                            path="/inspector/details"
                            element={<InspectorDetailsList />}
                          />
                          <Route
                            path="/inspector/disputes"
                            element={<InspectorDisputes />}
                          />
                          <Route
                            path="/inspector/:id"
                            element={<InspectorDetail />}
                          />
                        </Routes>
                      </Suspense>
                    </NotificationProvider>
                  </OrderProvider>
                </PostingProvider>
              </WishlistProvider>
            </AuthProvider>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;
