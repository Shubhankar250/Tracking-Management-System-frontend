import React, { type CSSProperties, useMemo, useState } from "react";

type Resolution = "720p" | "1080p" | "1440p" | "4k";
type Codec = "h264" | "h265";

const STORAGE_BITRATES: Record<Resolution, number> = {
  "720p": 4,
  "1080p": 8,
  "1440p": 12,
  "4k": 20,
};

const GB_PER_MEGABIT_HOUR = 0.439453125;

function formatGb(value: number): string {
  if (value < 1) return `${(value * 1024).toFixed(0)} MB`;
  return `${value.toFixed(2)} GB`;
}

function recommendSdCard(totalGb: number): number {
  if (totalGb <= 32) return 32;
  if (totalGb <= 64) return 64;
  if (totalGb <= 128) return 128;
  if (totalGb <= 256) return 256;
  if (totalGb <= 512) return 512;
  return 1024;
}

function cardDurations(totalPerDay: number): Array<{ size: number; days: number }> {
  const cards = [32, 64, 128, 256, 512, 1024];
  return cards.map((size) => ({
    size,
    days: totalPerDay > 0 ? size / totalPerDay : 0,
  }));
}

interface CardProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
        border: "1px solid #e5e7eb",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface LabelProps {
  children: React.ReactNode;
}

function Label({ children }: LabelProps) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#334155",
      }}
    >
      {children}
    </label>
  );
}

interface SectionTitleProps {
  title: string;
  desc?: string;
}

function SectionTitle({ title, desc }: SectionTitleProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
        {title}
      </h2>
      {desc && (
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b" }}>{desc}</p>
      )}
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 18,
        padding: 16,
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
        {value}
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: SliderFieldProps) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 16,
        marginBottom: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{label}</div>
        <div style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>
          {value} {suffix}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

interface RowProps {
  label: string;
  value: string;
}

function Row({ label, value }: RowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <span style={{ color: "#64748b" }}>{label}</span>
      <strong style={{ color: "#0f172a" }}>{value}</strong>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#fff",
  fontSize: 14,
  outline: "none",
};

export default function DashcamStorageCalculatorPage() {
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [bitrate, setBitrate] = useState<number>(8);
  const [codec, setCodec] = useState<Codec>("h265");
  const [additionalCameras, setAdditionalCameras] = useState<number>(1);
  const [recordHours, setRecordHours] = useState<number>(8);
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [parkingMode, setParkingMode] = useState<number>(0);

  const calc = useMemo(() => {
    const codecFactor = codec === "h265" ? 0.72 : 1;
    const mainDaily = bitrate * GB_PER_MEGABIT_HOUR * codecFactor * recordHours;
    const additionalDaily = mainDaily * 0.6 * additionalCameras;
    const parkingDaily = parkingMode * 0.12 * (1 + additionalCameras * 0.4);
    const totalPerDay = mainDaily + additionalDaily + parkingDaily;
    const totalRequired = totalPerDay * retentionDays;
    const recommendedCard = recommendSdCard(totalRequired * 1.15);
    const durations = cardDurations(totalPerDay);

    return {
      mainDaily,
      additionalDaily,
      parkingDaily,
      totalPerDay,
      totalRequired,
      recommendedCard,
      durations,
    };
  }, [bitrate, codec, additionalCameras, recordHours, retentionDays, parkingMode]);

  const presets = [
    {
      name: "Taxi / Ride Share",
      note: "1080p, front + cabin, 12 hrs/day, 5-day retention",
      tag: "128–256 GB",
    },
    {
      name: "Logistics / Truck",
      note: "1080p front + rear, 10 hrs/day, 7-day retention",
      tag: "256 GB",
    },
    {
      name: "Bus / Public Transport",
      note: "4-channel setup, 14 hrs/day, 14-day retention",
      tag: "512 GB–1 TB",
    },
    {
      name: "Enterprise / Compliance",
      note: "Higher retention for audits and investigations",
      tag: "512 GB+",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg,#1d4ed8 0%, #2563eb 45%, #ef4444 100%)",
            color: "#fff",
            borderRadius: 28,
            padding: 32,
            boxShadow: "0 12px 40px rgba(30,64,175,0.25)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 0.9fr",
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  fontSize: 13,
                  marginBottom: 14,
                }}
              >
                TrackingPath • Dashcam Storage Calculator
              </div>
              <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.2 }}>
                Dashcam Storage Calculator
              </h1>
              <p
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.92)",
                  maxWidth: 760,
                }}
              >
                Estimate daily storage, retention requirement, and the right SD card
                size for dashcam deployments. Ideal for customer demos, pricing, and
                fleet planning.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.96)",
                color: "#0f172a",
                borderRadius: 24,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 13, color: "#64748b" }}>Recommended SD card</div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8, color: "#1d4ed8" }}>
                {calc.recommendedCard === 1024 ? "1 TB" : `${calc.recommendedCard} GB`}
              </div>
              <div style={{ marginTop: 18, fontSize: 13, color: "#64748b" }}>
                Storage needed for selected retention
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
                {formatGb(calc.totalRequired)}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
          }}
        >
          <div style={{ display: "grid", gap: 24 }}>
            <Card>
              <SectionTitle
                title="Storage Inputs"
                desc="Designed for SD card sizing and retention planning."
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div>
                  <Label>Main Camera Resolution</Label>
                  <select
                    value={resolution}
                    onChange={(e) => {
                      const value = e.target.value as Resolution;
                      setResolution(value);
                      setBitrate(STORAGE_BITRATES[value]);
                    }}
                    style={inputStyle}
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4k">4K</option>
                  </select>
                </div>

                <div>
                  <Label>Codec</Label>
                  <select
                    value={codec}
                    onChange={(e) => setCodec(e.target.value as Codec)}
                    style={inputStyle}
                  >
                    <option value="h264">H.264</option>
                    <option value="h265">H.265</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <SliderField
                    label="Main camera bitrate"
                    value={bitrate}
                    min={2}
                    max={40}
                    step={1}
                    suffix="Mbps"
                    onChange={setBitrate}
                  />
                </div>

                <div>
                  <Label>Additional Cameras</Label>
                  <select
                    value={additionalCameras}
                    onChange={(e) => setAdditionalCameras(Number(e.target.value))}
                    style={inputStyle}
                  >
                    <option value={0}>None</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>

                <div>
                  <SliderField
                    label="Recording hours per day"
                    value={recordHours}
                    min={1}
                    max={24}
                    step={1}
                    suffix="hrs"
                    onChange={setRecordHours}
                  />
                </div>

                <div>
                  <SliderField
                    label="Retention days needed"
                    value={retentionDays}
                    min={1}
                    max={60}
                    step={1}
                    suffix="days"
                    onChange={setRetentionDays}
                  />
                </div>

                <div>
                  <SliderField
                    label="Parking mode hours / day"
                    value={parkingMode}
                    min={0}
                    max={24}
                    step={1}
                    suffix="hrs"
                    onChange={setParkingMode}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle
                title="Quick Presets"
                desc="Use-case blocks for taxi, logistics, bus, and enterprise."
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {presets.map((preset) => (
                  <div
                    key={preset.name}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{preset.name}</div>
                        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b" }}>
                          {preset.note}
                        </p>
                      </div>
                      <span
                        style={{
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {preset.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <Card>
              <SectionTitle
                title="Total Storage Required"
                desc="Clear result for recommendation and retention capacity."
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <StatBox label="Total per day" value={formatGb(calc.totalPerDay)} />
                <StatBox
                  label="Recommended SD card"
                  value={calc.recommendedCard === 1024 ? "1 TB" : `${calc.recommendedCard} GB`}
                />
              </div>

              <div
                style={{
                  marginTop: 18,
                  background: "linear-gradient(135deg,#1d4ed8 0%, #ef4444 100%)",
                  color: "#fff",
                  borderRadius: 20,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  Storage needed for selected retention
                </div>
                <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>
                  {formatGb(calc.totalRequired)}
                </div>
              </div>

              <div style={{ marginTop: 18, fontSize: 14 }}>
                <Row label="Main camera / day" value={formatGb(calc.mainDaily)} />
                <Row label="Additional cameras / day" value={formatGb(calc.additionalDaily)} />
                <Row label="Parking mode / day" value={formatGb(calc.parkingDaily)} />
              </div>

              <div
                style={{
                  marginTop: 18,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 18,
                  padding: 16,
                  color: "#1e3a8a",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                <strong>Recommendation:</strong> Use high-endurance microSD cards for
                continuous recording and keep a safety margin above the exact requirement.
              </div>
            </Card>

            <Card>
              <SectionTitle
                title="SD Card Quick Reference"
                desc="How long each card size lasts under current settings."
              />

              <div style={{ display: "grid", gap: 12 }}>
                {calc.durations.map((row) => (
                  <div
                    key={row.size}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>
                        {row.size === 1024 ? "1 TB" : `${row.size} GB`}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                        Continuous loop recording estimate
                      </div>
                    </div>

                    <span
                      style={{
                        background:
                          row.size === calc.recommendedCard ? "#dcfce7" : "#f1f5f9",
                        color: row.size === calc.recommendedCard ? "#15803d" : "#334155",
                        borderRadius: 999,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.days > 0 ? `${row.days.toFixed(row.days >= 10 ? 0 : 1)} days` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}