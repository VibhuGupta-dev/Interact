import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./Pages/Landingpage";
import SignUpPage from "./Pages/Signuppage";
import { MainScreen } from "./Pages/MainScreen";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/", { replace: true }); 
    }
  }, []);

  return (
    <div className="w-full min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/:roomcode" element={<MainScreen />} />
      </Routes>
    </div>
  );
}

export default App;

