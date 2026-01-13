import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import OwnerAuth from "./pages/owner/OwnerAuth";
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerRegister from "./pages/owner/OwnerRegister";
import OwnerDashboard from "./pages/owner/OwnerDashboard";

import UserAuth from "./pages/user/UserAuth";
import UserLogin from "./pages/user/UserLogin";
import UserRegister from "./pages/user/UserRegister";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Flujo Dueño */}
      <Route path="/dueno" element={<OwnerAuth />} />
      <Route path="/dueno/login" element={<OwnerLogin />} />
      <Route path="/dueno/register" element={<OwnerRegister />} />
      <Route path="/dueno/dashboard" element={<OwnerDashboard />} />

      {/* Flujo Usuario */}
      <Route path="/usuario" element={<UserAuth />} />
      <Route path="/usuario/login" element={<UserLogin />} />
      <Route path="/usuario/register" element={<UserRegister />} />
    </Routes>
  );
}