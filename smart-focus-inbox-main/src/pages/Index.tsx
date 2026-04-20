import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    } else if (!user.onboarded) {
      navigate("/profile-setup", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return null;
};

export default Index;
