import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // If user is authenticated and trying to access auth page, redirect to home
    if (isSignedIn && location.pathname === '/auth') {
      navigate('/');
    }
    // If user is not authenticated and trying to access protected routes
    else if (!isSignedIn && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [isSignedIn, isLoaded, navigate, location.pathname]);
};