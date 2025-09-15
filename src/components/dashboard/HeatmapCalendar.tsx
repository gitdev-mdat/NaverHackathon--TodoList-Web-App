// components/dashboard/HeatmapCalendar.tsx
import React from "react";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import styles from "../../styles/Dashboard.module.css";

interface DayDatum {
  date: string;
  count: number;
  completed: number;
}
interface Props {
  data: DayDatum[]; // date: YYYY-MM-DD, count
  onClickDay?: (date: string) => void;
  title?: string;
}

export default function HeatmapCalendar({
  data,
  onClickDay,
  title = "Activity heatmap",
}: Props) {
  const values = data.map((d) => ({ date: d.date, count: d.count }));
  const max = Math.max(1, ...values.map((v) => v.count));

  return (
    <div className={styles.heatmapCard}>
      <div className={styles.heatmapHeader}>
        <h4 className={styles.cardTitle}>{title}</h4>
        <div className={styles.heatmapLegend}>
          <span className={styles.legendLabel}>Less</span>
          <span className={`${styles.legendSwatch} ${styles.colorLevel1}`} />
          <span className={`${styles.legendSwatch} ${styles.colorLevel2}`} />
          <span className={`${styles.legendSwatch} ${styles.colorLevel3}`} />
          <span className={`${styles.legendSwatch} ${styles.colorLevel4}`} />
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>

      <div className={styles.heatmapWrap}>
        <ReactCalendarHeatmap
          startDate={data[0]?.date ?? undefined}
          endDate={data[data.length - 1]?.date ?? undefined}
          values={values as any}
          className={styles.heatmap}
          gutterSize={6}
          showWeekdayLabels={false}
          onClick={(value) => {
            if (!value || !value.date) return;
            onClickDay?.(value.date);
          }}
          titleForValue={(v) =>
            v && v.date ? `${v.date}: ${v.count} task(s)` : ""
          }
          tooltipDataAttrs={(v) => {
            if (!v || !v.date) return {};
            return { "data-tip": `${v.date}: ${v.count} task(s)` };
          }}
          classForValue={(v) => {
            if (!v) return styles.colorEmpty;
            const pct = v.count / max;
            if (pct === 0) return styles.colorEmpty;
            if (pct <= 0.25) return styles.colorLevel1;
            if (pct <= 0.5) return styles.colorLevel2;
            if (pct <= 0.75) return styles.colorLevel3;
            return styles.colorLevel4;
          }}
        />
      </div>
    </div>
  );
}
