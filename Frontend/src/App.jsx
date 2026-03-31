
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./Pages/Landingpage";
import SignUpPage from "./Pages/Signuppage";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. URL se parameters nikaalo
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      // 2. Token ko localStorage mein save karo
      localStorage.setItem("token", token);
      console.log("Token saved successfully!");

      // 3. URL se token hata do taaki ganda na dikhe aur user dashboard pe rahe
      navigate("/", { replace: true }); 
    }
  }, [location, navigate]);

  return (
    <div className="w-full min-h-screen bg-gray-600">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* Agar tumne Dashboard page alag banaya hai toh yahan route dalo */}
      </Routes>
    </div>
  );
}

export default App;