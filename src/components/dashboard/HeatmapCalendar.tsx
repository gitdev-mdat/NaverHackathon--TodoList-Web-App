import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import styles from "../../styles/Dashboard.module.css";

interface DayDatum {
  date: string; // YYYY-MM-DD
  count: number;
  completed?: number;
}
interface Props {
  data: DayDatum[]; // date: YYYY-MM-DD, count
  onClickDay?: (date: string) => void;
  title?: string;
}

function toYMD(date: string | number | Date | undefined): string | undefined {
  if (date === undefined || date === null) return undefined;
  if (typeof date === "string")
    return date.includes("T") ? date.slice(0, 10) : date;
  if (typeof date === "number")
    return new Date(date).toISOString().slice(0, 10);
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  return String(date);
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

      <div className={`${styles.heatmapWrap} ${styles.heatmap}`}>
        <ReactCalendarHeatmap
          startDate={data[0]?.date ?? undefined}
          endDate={data[data.length - 1]?.date ?? undefined}
          values={values}
          gutterSize={6}
          showWeekdayLabels={false}
          onClick={(value) => {
            if (!value || value.date == null) return;
            const d = toYMD(value.date);
            if (!d) return;
            onClickDay?.(d);
          }}
          titleForValue={(v) => {
            if (!v || v.date == null) return "";
            const d = toYMD(v.date) ?? "";
            return `${d}: ${v.count ?? 0} task(s)`;
          }}
          tooltipDataAttrs={(v) => {
            if (!v || v.date == null) {
              return {} as ReactCalendarHeatmap.TooltipDataAttrs;
            }
            const d = toYMD(v.date) ?? "";
            return {
              "data-tip": `${d}: ${v.count ?? 0} task(s)`,
            } as ReactCalendarHeatmap.TooltipDataAttrs;
          }}
          classForValue={(v) => {
            if (!v) return styles.colorEmpty;
            const pct = (v.count ?? 0) / max;
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
