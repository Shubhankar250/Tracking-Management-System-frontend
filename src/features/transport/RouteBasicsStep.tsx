import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import "../../assets/css/routeWizard.css";

type Vehicle = {
  id: string | number;
  name: string;
};

type RouteType = "Pickup" | "Drop";
type SourceType = "manual" | "gps" | "kml";

type FormData = {
  routeId?: string | number;
  routeName?: string;
  routeType?: RouteType | null;
  sourceType?: SourceType;
  defaultVehicleId?: string | number | null;
  gpsVehicleId?: string | number | null;
  gpsFrom?: string;
  gpsTo?: string;
  idleThreshold?: string;
};

type Props = {
  data: FormData;
  updateForm: (data: Partial<FormData>) => void;
  vehicles: Vehicle[];
};

type VehicleOption = {
  value: string | number;
  label: string;
};

const METHOD_CONTENT: Record<
  SourceType,
  { title: string; description: string }
> = {
  manual: {
    title: "Manual Draw",
    description: "Draw route path and stops directly on the map.",
  },
  gps: {
    title: "GPS History",
    description: "Use vehicle history and refine the route on the map.",
  },
  kml: {
    title: "KML Import",
    description: "Import route path and stops from a KML file.",
  },
};

const RouteBasicsStep = ({ data, updateForm, vehicles }: Props) => {
  const [method, setMethod] = useState<SourceType>(data.sourceType || "manual");

  useEffect(() => {
    if (!data.routeType) {
      updateForm({ routeType: "Pickup" });
    }
  }, [data.routeType, updateForm]);

  useEffect(() => {
    if (data.sourceType && data.sourceType !== method) {
      setMethod(data.sourceType);
    }
  }, [data.sourceType, method]);

  const vehicleOptions: VehicleOption[] = useMemo(
    () =>
      (vehicles || []).map((vehicle) => ({
        value: vehicle.id,
        label: vehicle.name,
      })),
    [vehicles],
  );

  const handleMethodChange = (type: SourceType) => {
    setMethod(type);
    updateForm({ sourceType: type });
  };

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: 42,
      borderRadius: 12,
      borderColor: state.isFocused ? "#14b8a6" : "#cbd5e1",
      boxShadow: state.isFocused
        ? "0 0 0 4px rgba(20, 184, 166, 0.12)"
        : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#14b8a6" : "#cbd5e1",
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94a3b8",
      fontSize: 12,
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#0f172a",
      fontSize: 12,
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 20,
      borderRadius: 12,
      overflow: "hidden",
    }),
  };

  return (
    <section className="rwrb-routebasics">
      <div className="rwrb-routebasics__shell">
        <div className="rwrb-routebasics__banner">
          {data.routeId
            ? "Edit mode: Updating existing route."
            : "Create mode: Start a new route plan."}
        </div>

        <div className="rwrb-routebasics__header">
          <div>
            <p className="rwrb-routebasics__eyebrow">Route Basics</p>
            <h3 className="rwrb-routebasics__title">Template Setup</h3>
            <p className="rwrb-routebasics__subtitle">
              Define the route type, assign vehicles, and choose how the route
              should be generated.
            </p>
          </div>

          <div className="rwrb-routebasics__metrics">
            <div className="rwrb-routebasics__metric">
              <span className="rwrb-routebasics__metric-label">Route Type</span>
              <strong className="rwrb-routebasics__metric-value">
                {data.routeType || "Pickup"}
              </strong>
            </div>
            <div className="rwrb-routebasics__metric">
              <span className="rwrb-routebasics__metric-label">Method</span>
              <strong className="rwrb-routebasics__metric-value">
                {method.toUpperCase()}
              </strong>
            </div>
          </div>
        </div>

        <div className="rwrb-routebasics__card">
          <div className="rwrb-routebasics__grid rwrb-routebasics__grid--three">
            <div className="rwrb-routebasics__field">
              <label className="rwrb-routebasics__label">Route Name</label>
              <input
                className="rwrb-routebasics__input"
                value={data.routeName || ""}
                onChange={(event) =>
                  updateForm({ routeName: event.target.value })
                }
              />
            </div>

            <div className="rwrb-routebasics__field">
              <label className="rwrb-routebasics__label">Route Type</label>
              <select
                className="rwrb-routebasics__select"
                value={data.routeType || "Pickup"}
                onChange={(event) =>
                  updateForm({ routeType: event.target.value as RouteType })
                }
              >
                <option value="Pickup">Pickup</option>
                <option value="Drop">Drop</option>
              </select>
            </div>

            <div className="rwrb-routebasics__field">
              <label className="rwrb-routebasics__label">Default Vehicle</label>
              <Select
                className="rwrb-routebasics__select2"
                options={vehicleOptions}
                isSearchable
                placeholder="Select Vehicle"
                value={
                  vehicleOptions.find(
                    (option) => option.value === data.defaultVehicleId,
                  ) || null
                }
                onChange={(option) =>
                  updateForm({
                    defaultVehicleId: option ? option.value : null,
                  })
                }
                styles={selectStyles}
                classNamePrefix="rwrb-routebasics__native-select"
              />
            </div>
          </div>
        </div>

        <div className="rwrb-routebasics__card">
          <label className="rwrb-routebasics__label">
            Route Creation Method
          </label>

          <div className="rwrb-routebasics__methods">
            {(Object.keys(METHOD_CONTENT) as SourceType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`rwrb-routebasics__method ${
                  method === type ? "is-active" : ""
                }`}
                onClick={() => handleMethodChange(type)}
              >
                <h4 className="rwrb-routebasics__method-title">
                  {METHOD_CONTENT[type].title}
                </h4>
                <p className="rwrb-routebasics__method-text">
                  {METHOD_CONTENT[type].description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {method === "gps" && (
          <div className="rwrb-routebasics__card">
            <div className="rwrb-routebasics__grid rwrb-routebasics__grid--four">
              <div className="rwrb-routebasics__field">
                <label className="rwrb-routebasics__label">GPS Vehicle</label>
                <Select
                  className="rwrb-routebasics__select2"
                  options={vehicleOptions}
                  isSearchable
                  placeholder="Select GPS Vehicle"
                  value={
                    vehicleOptions.find(
                      (option) => option.value === data.gpsVehicleId,
                    ) || null
                  }
                  onChange={(option) =>
                    updateForm({
                      gpsVehicleId: option ? option.value : null,
                    })
                  }
                  styles={selectStyles}
                  classNamePrefix="rwrb-routebasics__native-select"
                />
              </div>

              <div className="rwrb-routebasics__field">
                <label className="rwrb-routebasics__label">
                  From Date &amp; Time
                </label>
                <input
                  className="rwrb-routebasics__input"
                  type="datetime-local"
                  value={data.gpsFrom || ""}
                  onChange={(event) =>
                    updateForm({ gpsFrom: event.target.value })
                  }
                />
              </div>

              <div className="rwrb-routebasics__field">
                <label className="rwrb-routebasics__label">
                  To Date &amp; Time
                </label>
                <input
                  className="rwrb-routebasics__input"
                  type="datetime-local"
                  value={data.gpsTo || ""}
                  onChange={(event) =>
                    updateForm({ gpsTo: event.target.value })
                  }
                />
              </div>

              <div className="rwrb-routebasics__field">
                <label className="rwrb-routebasics__label">
                  Idle Threshold
                </label>
                <select
                  className="rwrb-routebasics__select"
                  value={data.idleThreshold || "3"}
                  onChange={(event) =>
                    updateForm({ idleThreshold: event.target.value })
                  }
                >
                  <option value="3">3 min</option>
                  <option value="5">5 min</option>
                  <option value="7">7 min</option>
                  <option value="10">10 min</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RouteBasicsStep;
