import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Header />

      {/* Page content */}
      <main style={{ paddingTop: "70px", minHeight: "calc(100vh - 120px)" }}>
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default MainLayout;
