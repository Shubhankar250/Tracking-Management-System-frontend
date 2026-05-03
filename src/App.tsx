import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'sweetalert2/dist/sweetalert2.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { getSettingsThunk } from "./slices/settingsSlice";
import { fetchLoggedInUser } from "./slices/authSlice";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  const settings = useAppSelector((state) => state.settings.data);

  // 🔹 Load settings on app start
  useEffect(() => {
    dispatch(getSettingsThunk());
  }, [dispatch]);

  useEffect(() => {
  if (token) {
    dispatch(fetchLoggedInUser());
  }
}, [token, dispatch]);

  // 🔹 Set dynamic title
  useEffect(() => {
    if (settings?.serverDescription) {
      document.title = settings.serverDescription;
    } else {
      document.title = "Fleet Plus";
    }
  }, [settings]);

  return (
    <>
      <AppRoutes />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;