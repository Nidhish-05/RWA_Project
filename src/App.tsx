import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Maintenance from "@/pages/Maintenance";
import Notices from "@/pages/Notices";
import Gallery from "@/pages/Gallery";
import Grievances from "@/pages/Grievances";
import ServicePeople from "@/pages/ServicePeople";
import QuickLinks from "@/pages/QuickLinks";
import UsersPage from "@/pages/UsersPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPage = ({ children, roles }: { children: React.ReactNode; roles: Array<'admin' | 'resident' | 'collector'> }) => (
  <ProtectedRoute allowedRoles={roles}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedPage roles={['admin', 'resident', 'collector']}><Dashboard /></ProtectedPage>} />
            <Route path="/maintenance" element={<ProtectedPage roles={['admin', 'resident', 'collector']}><Maintenance /></ProtectedPage>} />
            <Route path="/notices" element={<ProtectedPage roles={['admin', 'resident']}><Notices /></ProtectedPage>} />
            <Route path="/gallery" element={<ProtectedPage roles={['admin', 'resident']}><Gallery /></ProtectedPage>} />
            <Route path="/grievances" element={<ProtectedPage roles={['admin', 'resident']}><Grievances /></ProtectedPage>} />
            <Route path="/service-people" element={<ProtectedPage roles={['admin', 'resident']}><ServicePeople /></ProtectedPage>} />
            <Route path="/quick-links" element={<ProtectedPage roles={['admin', 'resident']}><QuickLinks /></ProtectedPage>} />
            <Route path="/users" element={<ProtectedPage roles={['admin']}><UsersPage /></ProtectedPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
