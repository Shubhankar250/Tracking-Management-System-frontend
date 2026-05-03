import { useState, useRef, useEffect } from "react";
import "../assets/css/weeklyschedule.css";
interface Props {
  onChange: (data: ScheduleSlot[]) => void;
  initialData?: ScheduleSlot[];
}

export interface ScheduleSlot {
  day: number;   // 0=Mon ... 6=Sun
  slot: number;  // row index (time slot)
}

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function generateTimeIntervals(minutes: number) {
  const arr: string[] = [];
  for (let i = 0; i < 24 * 60; i += minutes) {
    const h = Math.floor(i / 60).toString().padStart(2, "0");
    const m = (i % 60).toString().padStart(2, "0");
    arr.push(`${h}:${m}`);
  }
  return arr;
}

const times = generateTimeIntervals(60); // same as JSP

export default function WeeklyScheduleGrid({ onChange, initialData = [] }: Props) {
const [selected, setSelected] = useState<Set<string>>(new Set());

useEffect(() => {
  const converted = new Set(
    initialData.map((d) => `${(Number(d.day) + 6) % 7}-${d.slot}`)
  );
  setSelected(converted);
}, [initialData]);

  const dragging = useRef(false);

  const toggle = (day: number, slot: number, force?: boolean) => {
    const key = `${day}-${slot}`;
    const copy = new Set(selected);

    if (force === true) copy.add(key);
    else if (force === false) copy.delete(key);
    else copy.has(key) ? copy.delete(key) : copy.add(key);

    setSelected(copy);

    const payload: ScheduleSlot[] = [];
    copy.forEach((k) => {
      const [d, s] = k.split("-");
      payload.push({ day: Number(d), slot: Number(s) });
    });

    onChange(payload);
  };

  const handleMouseDown = (day: number, slot: number) => {
    dragging.current = true;
    toggle(day, slot);
  };

  const handleMouseEnter = (day: number, slot: number) => {
    if (dragging.current) toggle(day, slot, true);
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };
const triggerChange = (set: Set<string>) => {
  const payload: ScheduleSlot[] = [];

  set.forEach((k) => {
    const [d, s] = k.split("-");
    payload.push({ day: Number(d), slot: Number(s) });
  });

  onChange(payload);
};

 const selectWeekdays = () => {
  const copy = new Set<string>();

  for (let d = 0; d <= 4; d++) {
    for (let s = 0; s < times.length; s++) {
      copy.add(`${d}-${s}`);
    }
  }

  setSelected(copy);
  triggerChange(copy);
};

const selectWeekends = () => {
  const copy = new Set<string>();

  for (let d = 5; d <= 6; d++) {
    for (let s = 0; s < times.length; s++) {
      copy.add(`${d}-${s}`);
    }
  }

  setSelected(copy);
  triggerChange(copy);
};

const selectAll = () => {
  const copy = new Set<string>();

  for (let d = 0; d < 7; d++) {
    for (let s = 0; s < times.length; s++) {
      copy.add(`${d}-${s}`);
    }
  }

  setSelected(copy);
  triggerChange(copy);
};


  return (
    <div onMouseUp={handleMouseUp}>
      <div style={{ overflowX: "auto" }}>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Time</th>
              {days.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {times.map((t, slot) => (
              <tr key={slot}>
                <th>{t}</th>

                {days.map((_, day) => {
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

  <div className="schedule-actions">
  <button type="button" onClick={selectWeekdays}>Weekdays</button>
  <button type="button" onClick={selectWeekends}>Weekends</button>
  <button type="button" onClick={selectAll}>Always</button>
</div>


    </div>
  );
}
