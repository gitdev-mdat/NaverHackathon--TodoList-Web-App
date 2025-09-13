import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TaskBoard from "../pages/TaskBoard";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../pages/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/todo"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TaskBoard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
