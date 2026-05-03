import React, { type CSSProperties, useMemo, useState } from "react";

type Compression = "h264" | "h265";
type Resolution = "720p" | "1080p" | "1440p" | "4k";
type UsageMode = "hybrid" | "live" | "event" | "depot";

const RESOLUTION_RATES: Record<Resolution, Record<Compression, number>> = {
  "720p": { h264: 1.2, h265: 0.7 },
  "1080p": { h264: 2.4, h265: 1.5 },
  "1440p": { h264: 4.0, h265: 2.4 },
  "4k": { h264: 8.0, h265: 4.8 },
};

const FPS_MULTIPLIER: Record<number, number> = {
  15: 0.7,
  25: 1.0,
  30: 1.18,
};

const ADDITIONAL_CAMERA_FACTOR = 0.6;

function formatGb(value: number): string {
  if (value < 1) return `${(value * 1024).toFixed(0)} MB`;
  return `${value.toFixed(2)} GB`;
}

function recommendPlan(monthlyGb: number): number {
  const buffered = monthlyGb * 1.2;
  if (buffered <= 5) return 5;
  if (buffered <= 10) return 10;
  if (buffered <= 20) return 20;
  if (buffered <= 50) return 50;
  if (buffered <= 100) return 100;
  if (buffered <= 200) return 200;
  if (buffered <= 500) return 500;
  return Math.ceil(buffered / 100) * 100;
}

interface SavingSuggestion {
  title: string;
  save: number;
  note: string;
  monthly: number;
}

function estimateSavings(monthlyGb: number, mode: UsageMode): SavingSuggestion[] {
  const baseCostPerGb = 0.5;
  const cost = monthlyGb * baseCostPerGb;

  const suggestions = [
    {
      title: "Use depot Wi-Fi upload",
      save: 0.7,
      note: "Shift routine footage to Wi-Fi when vehicles return to the depot.",
    },
    {
      title: "Enable H.265",
      save: 0.45,
      note: "Reduce bandwidth while keeping practical video quality.",
    },
    {
      title: "Keep secondary cameras lighter",
      save: 0.22,
      note: "Use lower bitrate on rear, cabin, or side channels.",
    },
  ];

  if (mode === "live") {
    suggestions.unshift({
      title: "Switch to event-first upload",
      save: 0.8,
      note: "Continuous live streaming is usually the largest data cost driver.",
    });
  }

  return suggestions.slice(0, 3).map((s) => ({
    ...s,
    monthly: cost * s.save,
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
        marginBottom: 16,
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

export default function DashcamDataCalculatorPage() {
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [fps, setFps] = useState<number>(25);
  const [compression, setCompression] = useState<Compression>("h265");
  const [additionalCameras, setAdditionalCameras] = useState<number>(1);
  const [liveHours, setLiveHours] = useState<number>(1);
  const [eventHours, setEventHours] = useState<number>(0.5);
  const [backupHours, setBackupHours] = useState<number>(0.5);
  const [playbackHours, setPlaybackHours] = useState<number>(2);
  const [days, setDays] = useState<number>(30);
  const [mode, setMode] = useState<UsageMode>("hybrid");

  const calc = useMemo(() => {
    const basePerHour = RESOLUTION_RATES[resolution][compression] * FPS_MULTIPLIER[fps];
    const extraPerHour = basePerHour * ADDITIONAL_CAMERA_FACTOR * additionalCameras;
    const totalPerHourAllCameras = basePerHour + extraPerHour;

    const liveDaily = totalPerHourAllCameras * liveHours;
    const eventDaily = totalPerHourAllCameras * eventHours;
    const backupDaily = totalPerHourAllCameras * backupHours;
    const playbackMonthly = totalPerHourAllCameras * playbackHours;

    const monthlyGb = (liveDaily + eventDaily + backupDaily) * days + playbackMonthly;
    const recommendedPlan = recommendPlan(monthlyGb);

    return {
      totalPerHourAllCameras,
      liveDaily,
      eventDaily,
      backupDaily,
      playbackMonthly,
      monthlyGb,
      recommendedPlan,
    };
  }, [
    resolution,
    fps,
    compression,
    additionalCameras,
    liveHours,
    eventHours,
    backupHours,
    playbackHours,
    days,
  ]);

  const savings = estimateSavings(calc.monthlyGb, mode);

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
                TrackingPath • Dashcam 4G Data Calculator
              </div>
              <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.2 }}>
                Dashcam 4G Data Usage Calculator
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
                Estimate monthly mobile data usage for live streaming, event upload,
                cloud backup, and remote playback. Designed for fleet sales, operations,
                and telematics planning.
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
              <div style={{ fontSize: 13, color: "#64748b" }}>Estimated monthly usage</div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>
                {formatGb(calc.monthlyGb)}
              </div>
              <div style={{ marginTop: 18, fontSize: 13, color: "#64748b" }}>
                Recommended data plan
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: "#1d4ed8" }}>
                {calc.recommendedPlan} GB
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
                title="Video Profile"
                desc="Set the main camera quality and the number of extra channels."
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                }}
              >
                <div>
                  <Label>Resolution</Label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as Resolution)}
                    style={inputStyle}
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4k">4K</option>
                  </select>
                </div>

                <div>
                  <Label>Frame Rate</Label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    style={inputStyle}
                  >
                    <option value={15}>15 FPS</option>
                    <option value={25}>25 FPS</option>
                    <option value={30}>30 FPS</option>
                  </select>
                </div>

                <div>
                  <Label>Compression</Label>
                  <select
                    value={compression}
                    onChange={(e) => setCompression(e.target.value as Compression)}
                    style={inputStyle}
                  >
                    <option value="h264">H.264</option>
                    <option value="h265">H.265</option>
                  </select>
                </div>

                <div>
                  <Label>Additional Cameras</Label>
                  <select
                    value={additionalCameras}
                    onChange={(e) => setAdditionalCameras(Number(e.target.value))}
                    style={inputStyle}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle
                title="Usage Pattern"
                desc="Estimate how much footage goes over mobile data."
              />

              <div style={{ marginBottom: 18 }}>
                <Label>Usage Profile</Label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as UsageMode)}
                  style={inputStyle}
                >
                  <option value="hybrid">Hybrid Fleet Usage</option>
                  <option value="live">Live Monitoring Heavy</option>
                  <option value="event">Event-First Upload</option>
                  <option value="depot">Depot Wi-Fi Friendly</option>
                </select>
              </div>

              <SliderField
                label="Billing days"
                value={days}
                min={1}
                max={31}
                step={1}
                suffix="days"
                onChange={setDays}
              />

              <SliderField
                label="Live streaming hours / day"
                value={liveHours}
                min={0}
                max={24}
                step={0.5}
                suffix="hrs"
                onChange={setLiveHours}
              />

              <SliderField
                label="Event upload hours / day"
                value={eventHours}
                min={0}
                max={24}
                step={0.5}
                suffix="hrs"
                onChange={setEventHours}
              />

              <SliderField
                label="Cloud backup hours / day"
                value={backupHours}
                min={0}
                max={24}
                step={0.5}
                suffix="hrs"
                onChange={setBackupHours}
              />

              <SliderField
                label="Remote playback hours / month"
                value={playbackHours}
                min={0}
                max={50}
                step={0.5}
                suffix="hrs"
                onChange={setPlaybackHours}
              />
            </Card>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <Card>
              <SectionTitle
                title="Monthly Result"
                desc="Simple summary for customer proposals."
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <StatBox
                  label="Per hour / all cameras"
                  value={formatGb(calc.totalPerHourAllCameras)}
                />
                <StatBox label="Plan suggestion" value={`${calc.recommendedPlan} GB`} />
              </div>

              <div style={{ marginTop: 20, fontSize: 14 }}>
                <Row label="Live view / month" value={formatGb(calc.liveDaily * days)} />
                <Row label="Event clips / month" value={formatGb(calc.eventDaily * days)} />
                <Row label="Cloud backup / month" value={formatGb(calc.backupDaily * days)} />
                <Row label="Remote playback / month" value={formatGb(calc.playbackMonthly)} />
              </div>

              <div
                style={{
                  marginTop: 20,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 18,
                  padding: 16,
                  color: "#1e3a8a",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                <strong>Field recommendation:</strong> Keep only critical alerts and
                live sessions on 4G. For routine footage, use depot Wi-Fi or offline
                download workflows.
              </div>
            </Card>

            <Card>
              <SectionTitle
                title="Optimization Suggestions"
                desc="Practical ways to reduce SIM plan cost."
              />

              <div style={{ display: "grid", gap: 12 }}>
                {savings.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ color: "#0f172a" }}>{item.title}</strong>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Save ~₹{Math.round(item.monthly * 85)}
                      </span>
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b" }}>
                      {item.note}
                    </p>
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