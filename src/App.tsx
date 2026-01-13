import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import OwnerAuth from "./pages/owner/OwnerAuth";
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerRegister from "./pages/owner/OwnerRegister";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerAddSpace from "./pages/owner/OwnerAddSpace";
import OwnerEditSpace from "./pages/owner/OwnerEditSpace";

import UserAuth from "./pages/user/UserAuth";
import UserLogin from "./pages/user/UserLogin";
import UserRegister from "./pages/user/UserRegister";
import UserSearch from "./pages/user/UserSearch";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Flujo Dueño */}
      <Route path="/dueno" element={<OwnerAuth />} />
      <Route path="/dueno/login" element={<OwnerLogin />} />
      <Route path="/dueno/register" element={<OwnerRegister />} />
      <Route path="/dueno/dashboard" element={<OwnerDashboard />} />
      <Route path="/dueno/add-space" element={<OwnerAddSpace />} />
      <Route path="/dueno/edit-space/:id" element={<OwnerEditSpace />} />

      {/* Flujo Usuario */}
      <Route path="/usuario" element={<UserAuth />} />
      <Route path="/buscar" element={<UserSearch />} />
      <Route path="/usuario/login" element={<UserLogin />} />
      <Route path="/usuario/register" element={<UserRegister />} />
    </Routes>
  );
}