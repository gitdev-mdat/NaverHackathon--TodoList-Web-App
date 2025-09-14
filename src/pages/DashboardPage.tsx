import React, { useState } from "react";
import KPIGrid from "../components/dashboard/KPIGrid";
import HeatmapCalendar from "../components/dashboard/HeatmapCalendar";
import TasksTrendChart from "../components/dashboard/TasksTrendChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import useDashboardData from "../hooks/useDashboardData";
import DayTasksModal from "../components/DayTasksModal";
import styles from "../styles/Dashboard.module.css";
import CreateFromNL from "../components/AI/CreateFromNL";
export default function DashboardPage() {
  const {
    total,
    completed,
    active,
    overdue,
    perfectDays,
    heatmap,
    trend,
    recent,
    tasks,
  } = useDashboardData();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <KPIGrid
        total={total}
        completed={completed}
        active={active}
        overdue={overdue}
        perfectDays={perfectDays}
        onClick={(k) => {
          // clicking KPI: simple behaviour: scroll to charts or could filter — placeholder
          console.log("KPI clicked", k);
        }}
      />

      <div className={styles.grid}>
        <div className={styles.left}>
          <HeatmapCalendar
            data={heatmap}
            onClickDay={(date) => setSelectedDate(date)}
          />
          <TasksTrendChart data={trend} />
        </div>

        <div className={styles.right}>
          <RecentActivity
            items={recent as any}
            onOpenTask={(taskId) => {
              // open DayTasksModal for day of task (resolve task)
              const t = tasks.find((tt) => tt.id === taskId);
              if (t) {
                const d = new Date(t.dueDate);
                setSelectedDate(d.toISOString().slice(0, 10));
              }
            }}
          />
        </div>
      </div>

      {selectedDate && (
        <DayTasksModal
          day={new Date(selectedDate)}
          tasks={(tasks || []).filter((t) => {
            const d = new Date(selectedDate);
            // reuse same logic used in useDashboardData
            const s = new Date(t.dueDate);
            const e = t.endDate
              ? new Date(t.endDate)
              : new Date(s.getTime() + 1);
            return (
              s < new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) &&
              e > new Date(d.getFullYear(), d.getMonth(), d.getDate())
            );
          })}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
