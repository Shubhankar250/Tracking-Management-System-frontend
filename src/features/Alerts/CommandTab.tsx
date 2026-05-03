import { useState, useEffect } from "react";

interface CommandTabProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  commands?: { value: string; label: string }[];
}

/* ✅ Local responsive hook (isolated, no global impact) */
const useResponsive = () => {
  const getScreenType = () => {
    const width = window.innerWidth;
    if (width <= 768) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  };

  const [screenType, setScreenType] = useState(getScreenType());

  useEffect(() => {
    const handleResize = () => setScreenType(getScreenType());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobile: screenType === "mobile",
  };
};

export default function CommandTab({
  value,
  onChange,
  error,

  commands = [],
}: CommandTabProps) {
  const { isMobile } = useResponsive();

  const [open, setOpen] = useState(false);

  /* ✅ Selected label (fallback = Select Command) */
  const selectedLabel =
    commands.find((c) => c.value === value)?.label || "Select Command";

  /* ✅ Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".command-dropdown-wrapper")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ minHeight: 300 }}>
      <div className="mb-3">
        <label className="alert-label">
          Command <span className="alert-required">*</span>
        </label>

        {/* ================= MOBILE ================= */}
        {isMobile ? (
          <div className="command-dropdown-wrapper">
            {/* Selected box */}
            <div
              className="custom-select-box"
              onClick={() => setOpen((prev) => !prev)}
            >
              {selectedLabel}
            </div>

            {/* Dropdown list */}
            {open && (
              <div className="custom-select-dropdown">
                {/* ✅ Default option (FIX) */}
                <div
                  className={`custom-option ${value === "" ? "active" : ""}`}
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  Select Command
                </div>

                {/* Command list */}
                {commands.map((cmd) => (
                  <div
                    key={cmd.value}
                    className={`custom-option ${
                      value === cmd.value ? "active" : ""
                    }`}
                    onClick={() => {
                      onChange(cmd.value);
                      setOpen(false);
                    }}
                  >
                    {cmd.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================= DESKTOP (UNCHANGED) ================= */
          <select
            className="form-control"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select Command</option>

            {commands.map((cmd) => (
              <option key={cmd.value} value={cmd.value}>
                {cmd.label}
              </option>
            ))}
          </select>
        )}

        {error && (
          <div
            className="text-danger"
            style={{ fontSize: 12, marginBottom: 8 }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
