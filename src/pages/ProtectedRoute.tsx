import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;