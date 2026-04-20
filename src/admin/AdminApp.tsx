import { Routes, Route } from "react-router-dom";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { RefreshCw } from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCompanies from "./pages/AdminCompanies";
import AdminUsers from "./pages/AdminUsers";

function AdminApp() {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando painel administrativo...
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/companies" element={<AdminCompanies />} />
          <Route path="/users" element={<AdminUsers />} />
        </Routes>
      </AdminLayout>
    </div>
  );
}

export default AdminApp;