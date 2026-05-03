import { useState, useRef, useEffect } from "react";

interface Props {
  onChange: (data: ScheduleSlot[], status: boolean) => void;
  initialData?: ScheduleSlot[];
  initialStatus?: boolean;
  error?: string;
}

export interface ScheduleSlot {
  day: number;
  slot: number;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

/* =======================
   TIME GENERATOR
======================= */
function generateTimeIntervals(minutes: number) {
  const arr: string[] = [];

  for (let i = 0; i < 24 * 60; i += minutes) {
    const h = Math.floor(i / 60).toString().padStart(2, "0");
    const m = (i % 60).toString().padStart(2, "0");
    arr.push(`${h}:${m}`);
  }

  return arr;
}

const times = generateTimeIntervals(60);

/* =======================
   COMPONENT
======================= */
export default function WeeklyScheduleGrid({
  onChange,
  initialData = [],
  initialStatus,
  error
}: Props) {

  /* =======================
     STATUS CHECKBOX
  ======================= */
  const [enabled, setEnabled] = useState<boolean>(
    initialStatus ?? false
  );

  useEffect(() => {
    if (initialStatus !== undefined) {
      setEnabled(initialStatus);
    }
  }, [initialStatus]);

  /* =======================
     SELECTED CELLS
  ======================= */
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialData.map(d => `${d.day}-${d.slot}`))
  );

  useEffect(() => {
    const newSelected = new Set(
      initialData.map(d => `${d.day}-${d.slot}`)
    );
    setSelected(newSelected);
  }, [initialData]);

  const dragging = useRef(false);

  /* =======================
     EMIT TO PARENT
  ======================= */
  const emit = (set: Set<string>, status = enabled) => {
    const payload: ScheduleSlot[] = [];

    set.forEach(k => {
      const [d, s] = k.split("-");
      payload.push({ day: Number(d), slot: Number(s) });
    });

    onChange(payload, status);
  };

  /* =======================
     CHECKBOX TOGGLE
  ======================= */
  const toggleSchedule = (checked: boolean) => {
    dragging.current = false;
    setEnabled(checked);
    emit(selected, checked); // preserve selections
  };

  /* =======================
     GRID TOGGLE
  ======================= */
  const toggle = (day: number, slot: number, force?: boolean) => {
    if (!enabled) return;

    const key = `${day}-${slot}`;
    const copy = new Set(selected);

    if (force === true) copy.add(key);
    else if (force === false) copy.delete(key);
    else copy.has(key) ? copy.delete(key) : copy.add(key);

    setSelected(copy);
    emit(copy);
  };

  /* =======================
     DRAG SELECT
  ======================= */
  const handleMouseDown = (day: number, slot: number) => {
    if (!enabled) return;
    dragging.current = true;
    toggle(day, slot);
  };

  const handleMouseEnter = (day: number, slot: number) => {
    if (!enabled || !dragging.current) return;
    toggle(day, slot, true);
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  /* =======================
     DAY TOGGLE
  ======================= */
  const toggleDay = (day: number) => {
    if (!enabled) return;

    const copy = new Set(selected);
    let allSelected = true;

    for (let s = 0; s < times.length; s++) {
      if (!copy.has(`${day}-${s}`)) {
        allSelected = false;
        break;
      }
    }

    for (let s = 0; s < times.length; s++) {
      const key = `${day}-${s}`;
      allSelected ? copy.delete(key) : copy.add(key);
    }

    setSelected(copy);
    emit(copy);
  };

  /* =======================
     BULK ACTIONS
  ======================= */
  const selectWeekdays = () => {
    if (!enabled) return;

    const copy = new Set<string>();

    for (let d = 0; d <= 4; d++) {
      for (let s = 0; s < times.length; s++) {
        copy.add(`${d}-${s}`);
      }
    }

    setSelected(copy);
    emit(copy);
  };

  const selectWeekends = () => {
    if (!enabled) return;

    const copy = new Set<string>();

    for (let d = 5; d <= 6; d++) {
      for (let s = 0; s < times.length; s++) {
        copy.add(`${d}-${s}`);
      }
    }

    setSelected(copy);
    emit(copy);
  };

  const selectAll = () => {
    if (!enabled) return;

    const copy = new Set<string>();

    for (let d = 0; d < 7; d++) {
      for (let s = 0; s < times.length; s++) {
        copy.add(`${d}-${s}`);
      }
    }

    setSelected(copy);
    emit(copy);
  };

  const deselectAll = () => {
    if (!enabled) return;

    const empty = new Set<string>();
    setSelected(empty);
    emit(empty);
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="schedule-root" onMouseUp={handleMouseUp}>

      {/* ENABLE TOGGLE */}
      <label style={{ marginBottom: 12, display: "block" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => toggleSchedule(e.target.checked)}
          style={{ marginRight: 8 }}
        />
        Enable Schedule
      </label>

      {/* ERROR MESSAGE */}
      {error && enabled && (
        <div
          className="text-danger"
          style={{ fontSize: 12, marginBottom: 8 }}
        >
          {error}
        </div>
      )}

      {/* GRID */}
      <div
        style={{
          overflowX: "auto",
          opacity: enabled ? 1 : 0.5
        }}
      >
        <table className="schedule-table">
          <thead>
            <tr>
              <th></th>
              {times.map((t, i) => (
                <th key={i}>{t}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {days.map((label, day) => (
              <tr key={day}>
                <th
                  style={{ cursor: enabled ? "pointer" : "default" }}
                  onClick={() => toggleDay(day)}
                >
                  {label}
                </th>

                {times.map((_, slot) => {
                  const key = `${day}-${slot}`;
                  const isSelected = selected.has(key);

                  return (
                    <td
                      key={key}
                      className={isSelected ? "selected" : ""}
                      onMouseDown={() => handleMouseDown(day, slot)}
                      onMouseEnter={() => handleMouseEnter(day, slot)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION BUTTONS */}
      <div className="schedule-actions">
        <button onClick={selectWeekdays}>Weekdays</button>
        <button onClick={selectWeekends}>Weekends</button>
        <button onClick={selectAll}>Always</button>
        <button className="alert-btn secondary" onClick={deselectAll}>Deselect All</button>
      </div>

    </div>
  );
}