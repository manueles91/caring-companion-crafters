import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import AuthUI from "./components/auth/AuthUI";

const publishableKey = "pk_test_cGxlYXNhbnQtaGFtc3Rlci0xMC5jbGVyay5hY2NvdW50cy5kZXYk";

if (!publishableKey) {
  console.error("Missing Clerk Publishable Key - Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables");
}

const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider publishableKey={publishableKey}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/auth" element={<AuthUI />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;