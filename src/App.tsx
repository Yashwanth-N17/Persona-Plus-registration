import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const AdminPage = lazy(() => import("./pages/AdminPage.tsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.tsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.tsx"));
const RetrieveQrPage = lazy(() => import("./pages/RetrieveQrPage.tsx"));
const ScannerPage = lazy(() => import("./pages/ScannerPage.tsx"));
const SuccessPage = lazy(() => import("./pages/SuccessPage.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen grid place-items-center text-teal font-bold">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/success/:id" element={<SuccessPage />} />
              <Route path="/retrieve" element={<RetrieveQrPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/scanner" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
