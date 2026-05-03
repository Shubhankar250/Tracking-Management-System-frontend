import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Livetrack from "../pages/Livetrack";
import VerifyUser from "../pages/VerifyUser";
import VideoTrackingPage from "../pages/VideoTrackingPage";
import FleetLivePage from "../components/map/FleetLivePage";
import Home from "../pages/Home";
import ContactPage from "../pages/ContactPage";
import MainLayout from "../pages/MainLayout";
import SupportedDevices from "../pages/SupportedDevices";
import Pricing from "../pages/Pricing";
import HowItWorks from "../pages/HowItWorks";
import DashcamDataCalculatorPage from "../pages/dashcam_data_calc";
import DashcamStorageCalculatorPage from "../pages/dashcam_storage_calc";
import ProtectedRoute from "../pages/ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
         <Route path="/supported-devices" element={<SupportedDevices />} />
         <Route path="/pricing" element={<Pricing />} />
         <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/dashcam-4g-data-usage-calculator" element={<DashcamDataCalculatorPage />} />
        <Route path="/dashcam-storage-calculator" element={<DashcamStorageCalculatorPage />} />
        </Route>
         <Route path="/login" element={<Login />} />
<Route
  path="/livetrack"
  element={
    <ProtectedRoute>
      <Livetrack />
    </ProtectedRoute>
  }
/>        <Route path="/users_verfication" element={<VerifyUser />} />
        <Route path="/weblive" element={<FleetLivePage />} />

        <Route path="/video/:deviceId" element={<VideoTrackingPage />} />
        <Route path="/video/:deviceId/history" element={<VideoTrackingPage />} />
         <Route path="/video/:deviceId/gallery" element={<VideoTrackingPage />} />
        <Route path="/video/:deviceId/download" element={<VideoTrackingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
