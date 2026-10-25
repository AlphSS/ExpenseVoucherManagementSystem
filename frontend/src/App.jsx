import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CreateVoucher from "./pages/CreateVoucher";
import DirectorDashboard from "./pages/DirectorDashboard";
import AccountsDashboard from "./pages/AccountsDashboard";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("evms_token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("evms_user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their assigned dashboard
    if (user.role === "EMPLOYEE") return <Navigate to="/employee" replace />;
    if (user.role === "DIRECTOR") return <Navigate to="/director" replace />;
    if (user.role === "ACCOUNTS") return <Navigate to="/accounts" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/vouchers"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/vouchers/new"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <CreateVoucher />
            </ProtectedRoute>
          }
        />

        {/* Director Routes */}
        <Route
          path="/director"
          element={
            <ProtectedRoute allowedRole="DIRECTOR">
              <DirectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/director/pending"
          element={
            <ProtectedRoute allowedRole="DIRECTOR">
              <DirectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/director/vouchers"
          element={
            <ProtectedRoute allowedRole="DIRECTOR">
              <DirectorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Accounts Routes */}
        <Route
          path="/accounts"
          element={
            <ProtectedRoute allowedRole="ACCOUNTS">
              <AccountsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/vouchers"
          element={
            <ProtectedRoute allowedRole="ACCOUNTS">
              <AccountsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts/history"
          element={
            <ProtectedRoute allowedRole="ACCOUNTS">
              <AccountsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Wildcard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
