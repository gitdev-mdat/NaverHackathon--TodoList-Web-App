// src/components/Sidebar.tsx
import { useState } from "react";
import { LayoutDashboard, ListTodo, Calendar } from "lucide-react";

type Menu = "dashboard" | "tasks" | "calendar";

interface SidebarProps {
  onSelect: (menu: Menu) => void;
  active: Menu;
}

export default function Sidebar({ onSelect, active }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { id: "tasks", label: "Task List", icon: <ListTodo size={20} /> },
    { id: "calendar", label: "Calendar", icon: <Calendar size={20} /> },
  ] as const;

  return (
    <div className="h-screen w-56 bg-gray-900 text-white flex flex-col p-4 space-y-4">
      <h1 className="text-xl font-bold mb-6">⏰ StudentTime</h1>
      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as Menu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
              active === item.id ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
