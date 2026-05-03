import { useEffect, useMemo, useState } from "react";
import "../../assets/css/routeWizard.css";

type ShiftData = {
  routeId?: string | number;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  activeDays?: string[];
  holidayDates?: string[];
};

type Props = {
  data: ShiftData;
  updateForm: (data: Partial<ShiftData>) => void;
};

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const ShiftStep = ({ data, updateForm }: Props) => {
  const [activeDays, setActiveDays] = useState<string[]>(data.activeDays || []);

  useEffect(() => {
    setActiveDays(data.activeDays || []);
  }, [data.activeDays]);

  const toggleDay = (day: string) => {
    const updated = activeDays.includes(day)
      ? activeDays.filter((item) => item !== day)
      : [...activeDays, day];

    setActiveDays(updated);
    updateForm({ activeDays: updated });
  };

  const shiftMetrics = useMemo(
    () => [
      { label: "Working Days", value: String(activeDays.length) },
      { label: "Holidays", value: String((data.holidayDates || []).length) },
    ],
    [activeDays.length, data.holidayDates],
  );
  const parseHolidayDates = (value: string) =>
    value
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item));

  const [holidayInput, setHolidayInput] = useState(
    (data.holidayDates || []).join(", "),
  );

  useEffect(() => {
    setHolidayInput((data.holidayDates || []).join(", "));
  }, [data.holidayDates]);

  return (
    <section className="rwss-shiftstep">
      <div className="rwss-shiftstep__shell">
        <div className="rwss-shiftstep__banner">
          {data.routeId
            ? "Edit mode: Updating existing route."
            : "Create mode: Start a new route plan."}
        </div>

        <div className="rwss-shiftstep__header">
          <div>
            <p className="rwss-shiftstep__eyebrow">Shift Setup</p>
            <h3 className="rwss-shiftstep__title">Shift Configuration</h3>
            <p className="rwss-shiftstep__subtitle">
              Define shift timing, working days, and holiday exceptions.
            </p>
          </div>

          <div className="rwss-shiftstep__metrics">
            {shiftMetrics.map((metric) => (
              <div className="rwss-shiftstep__metric" key={metric.label}>
                <span className="rwss-shiftstep__metric-label">
                  {metric.label}
                </span>
                <strong className="rwss-shiftstep__metric-value">
                  {metric.value}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rwss-shiftstep__card">
          <div className="rwss-shiftstep__grid rwss-shiftstep__grid--three">
            <div className="rwss-shiftstep__field">
              <label className="rwss-shiftstep__label">Shift Name</label>
              <input
                className="rwss-shiftstep__input"
                value={data.shiftName || ""}
                onChange={(event) =>
                  updateForm({ shiftName: event.target.value })
                }
              />
            </div>

            <div className="rwss-shiftstep__field">
              <label className="rwss-shiftstep__label">Start Time</label>
              <input
                className="rwss-shiftstep__input"
                type="time"
                value={data.startTime || ""}
                onChange={(event) =>
                  updateForm({ startTime: event.target.value })
                }
              />
            </div>

            <div className="rwss-shiftstep__field">
              <label className="rwss-shiftstep__label">End Time</label>
              <input
                className="rwss-shiftstep__input"
                type="time"
                value={data.endTime || ""}
                onChange={(event) =>
                  updateForm({ endTime: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="rwss-shiftstep__grid rwss-shiftstep__grid--two">
          <div className="rwss-shiftstep__card">
            <div className="rwss-shiftstep__field">
              <label className="rwss-shiftstep__label">Working Days</label>

              <div className="rwss-shiftstep__chips">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`rwss-shiftstep__chip ${
                      activeDays.includes(day) ? "is-active" : ""
                    }`}
                    onClick={() => toggleDay(day)}
                  >
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="rwss-shiftstep__hint">
                Click day chips to mark route running days.
              </div>
            </div>
          </div>

          <div className="rwss-shiftstep__card">
            <div className="rwss-shiftstep__field">
              <label className="rwss-shiftstep__label">Holiday Dates</label>

              <textarea
                className="rwss-shiftstep__textarea"
                value={holidayInput}
                onChange={(event) => {
                  setHolidayInput(event.target.value);
                }}
                onBlur={() => {
                  updateForm({
                    holidayDates: parseHolidayDates(holidayInput),
                  });
                }}
              />

              <div className="rwss-shiftstep__hint">
                Enter dates separated by comma, space, or new line.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShiftStep;
