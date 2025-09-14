// routes/AppRoutes.tsx
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
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/todo/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tasks" replace />} />
        {/* <Route path="dashboard" element={<DashboardHome />} /> */}
        <Route path="tasks" element={<TaskBoard />} />
        {/* <Route path="calendar" element={<CalendarPage />} /> */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
