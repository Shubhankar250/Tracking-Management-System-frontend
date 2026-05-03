import React from "react";
import "../../assets/css/routeWizard.css";

interface Stop {
  passengerCount?: number;
}

interface Vehicle {
  id: string | number;
  name?: string;
}

interface SummaryData {
  routeId?: string | number;
  routeName?: string;
  shiftName?: string;
  routeType?: string;
  defaultVehicleId?: string | number;
  routeGeoJson?: unknown;
  passengers?: unknown[];
  stops?: Stop[];
}

interface Props {
  data: SummaryData;
  vehicles?: Vehicle[];
}

const SummaryStep: React.FC<Props> = ({ data, vehicles = [] }) => {
  const totalStops = data.stops?.length ?? 0;
  const totalPassengers =
    data.passengers?.length ??
    data.stops?.reduce((sum, stop) => sum + (stop.passengerCount ?? 0), 0) ??
    0;

  const vehicleName =
    vehicles.find((vehicle) => vehicle.id === data.defaultVehicleId)?.name ??
    "Not Assigned";

  const isEditing = Boolean(data.routeId);
  const isRouteDrawn = Boolean(data.routeGeoJson);

  const summaryItems = [
    { label: "Route Name", value: data.routeName || "N/A" },
    { label: "Shift", value: data.shiftName || "N/A" },
    { label: "Type", value: data.routeType || "N/A" },
    { label: "Total Stops", value: totalStops },
    { label: "Total Passengers", value: totalPassengers },
    {
      label: "Map Status",
      value: isRouteDrawn ? "Route Drawn" : "Not Drawn",
      tone: isRouteDrawn ? "success" : "danger",
    },
    { label: "Vehicle", value: vehicleName },
  ];

  return (
    <section className="rws-summary">
      <div className="rws-summary__panel">
        <div className="rws-summary__header">
          <div>
            <p className="rws-summary__eyebrow">Summary</p>
            <h3 className="rws-summary__title">Route Summary</h3>
          </div>

          <span
            className={`rws-summary__badge ${isEditing ? "is-primary" : "is-success"}`}
          >
            {isEditing ? "Editing" : "Creating"}
          </span>
        </div>

        <div className="rws-summary__grid">
          {summaryItems.map((item) => (
            <div className="rws-summary__item" key={item.label}>
              <label className="rws-summary__label">{item.label}</label>
              <span
                className={`rws-summary__value ${item.tone ? `is-${item.tone}` : ""}`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SummaryStep;
