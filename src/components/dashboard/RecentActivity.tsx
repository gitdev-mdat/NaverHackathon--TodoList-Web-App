import { useMemo, useState } from "react";
import styles from "../../styles/Dashboard.module.css";

interface Activity {
  id: string;
  type: "created" | "updated" | "completed";
  when: string; // ISO
  taskId: string;
  title: string;
}

interface Props {
  items: Activity[];
  onOpenTask?: (taskId: string) => void;
  limit?: number; // initial items to show
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - then) / 1000)); // seconds

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "1d";
  return `${days}d`;
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function groupByDay(items: Activity[]) {
  const map = new Map<string, Activity[]>();
  items.forEach((it) => {
    const k = dayKey(it.when);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(it);
  });
  // return array of [day, activities] sorted by day desc (most recent day first)
  return Array.from(map.entries()).sort((a, b) => {
    const ad = new Date(a[0]).getTime();
    const bd = new Date(b[0]).getTime();
    return bd - ad;
  });
}

export default function RecentActivity({
  items,
  onOpenTask,
  limit = 8,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(limit);

  const sorted = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.when).getTime() - new Date(a.when).getTime()
    );
  }, [items]);

  const grouped = useMemo(() => groupByDay(sorted), [sorted]);

  const total = items.length;
  const canLoadMore = visibleCount < total;

  return (
    <div className={styles.activityCard}>
      <h4 className={styles.cardTitle}>Recent activity</h4>

      <div className={styles.activityList}>
        {total === 0 && <div className={styles.empty}>No recent activity</div>}

        {grouped.map(([day, acts]) => {
          // compute how many of this group's items are within visibleCount window
          // determine index range of this group's items in sorted list
          return (
            <div key={day} className={styles.activityDayGroup}>
              <div className={styles.activityDayHeader}>{day}</div>
              {acts.map((it) => {
                const indexInSorted = sorted.findIndex((s) => s.id === it.id);
                if (indexInSorted >= visibleCount) return null; // hidden until load more
                return (
                  <div key={it.id} className={styles.activityItem}>
                    <div className={styles.activityLeft}>
                      <span
                        className={`${styles.activityIcon} ${
                          it.type === "created"
                            ? styles.iconCreated
                            : it.type === "completed"
                            ? styles.iconCompleted
                            : styles.iconUpdated
                        }`}
                        aria-hidden
                        title={it.type}
                      />
                      <div className={styles.activityBody}>
                        <div
                          className={styles.activityTitle}
                          role="button"
                          tabIndex={0}
                          onClick={() => onOpenTask?.(it.taskId)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onOpenTask?.(it.taskId);
                          }}
                        >
                          {it.title}
                        </div>
                        <div className={styles.activityMeta}>
                          <small>{it.type}</small>
                          <small> • {timeAgo(it.when)}</small>
                        </div>
                      </div>
                    </div>
                    <div className={styles.activityWhen}>
                      {new Date(it.when).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {canLoadMore && (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 8 }}
        >
          <button
            className={styles.loadMoreBtn}
            onClick={() => setVisibleCount((v) => Math.min(total, v + limit))}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
