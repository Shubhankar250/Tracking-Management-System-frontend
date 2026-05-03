import { useEffect, useMemo, useState } from "react";
import "../../assets/css/routeWizard.css";

type PassengerType = "Student" | "Staff" | "Other";

type StopOption = {
  id?: number;
  clientStopId: number;
  stopName: string;
  passengerCount?: number;
};

export type Passenger = {
  passengerName: string;
  passengerType: PassengerType;
  pickupStopId: number | "";
  dropStopId: number | "";
  guardianName: string;
  guardianMobile: string;
  username: string;
  tempPassword?: string;
  passwordChanged: boolean;
  autoLoginEnabled: boolean;
};

type FormData = {
  routeId?: string | number;
  passengers?: Passenger[];
  stops?: StopOption[];
};

type Props = {
  data: FormData;
  updateForm: (data: Partial<FormData>) => void;
};

const DEFAULT_PASSENGER: Passenger = {
  passengerName: "",
  passengerType: "Student",
  pickupStopId: "",
  dropStopId: "",
  guardianName: "",
  guardianMobile: "",
  username: "",
  tempPassword: "",
  passwordChanged: false,
  autoLoginEnabled: false,
};

const PASSENGER_TYPES: PassengerType[] = ["Student", "Staff", "Other"];

const PassengersStep = ({ data, updateForm }: Props) => {
  const [passengers, setPassengers] = useState<Passenger[]>(
    data.passengers || [],
  );
  const [newPassenger, setNewPassenger] =
    useState<Passenger>(DEFAULT_PASSENGER);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    setPassengers(data.passengers || []);
  }, [data.passengers]);

  useEffect(() => {
    if (newPassenger.autoLoginEnabled) {
      setNewPassenger((prev) => ({
        ...prev,
        username: prev.guardianMobile.trim(),
      }));
    }
  }, [newPassenger.guardianMobile, newPassenger.autoLoginEnabled]);

  const stopOptions = useMemo(() => data.stops || [], [data.stops]);

  const generatePassword = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const isPrimaryForMobile = (mobile: string, index?: number) => {
    return (
      passengers.findIndex((p) => p.guardianMobile.trim() === mobile.trim()) ===
      index
    );
  };

  const isPrimary = isPrimaryForMobile(
    newPassenger.guardianMobile,
    editingIndex ?? passengers.length,
  );

  const findSharedCredentials = (mobile: string, excludeIndex?: number) => {
    const normalizedMobile = mobile.trim();
    if (!normalizedMobile) return null;

    return (
      passengers.find(
        (passenger, index) =>
          index !== excludeIndex &&
          passenger.guardianMobile.trim() === normalizedMobile,
      ) || null
    );
  };

  const sharedCredentialsPassenger = findSharedCredentials(
    newPassenger.guardianMobile,
    editingIndex ?? undefined,
  );

  const resetPassengerForm = () => {
    setNewPassenger(DEFAULT_PASSENGER);
    setEditingIndex(null);
    setShowPassword(false);
    setPasswordInput("");
  };

  const sync = (updatedPassengers: Passenger[]) => {
    setPassengers(updatedPassengers);

    const updatedStops = stopOptions.map((stop) => {
      const count = updatedPassengers.filter(
        (passenger) => passenger.pickupStopId === stop.clientStopId,
      ).length;

      return {
        ...stop,
        passengerCount: count,
      };
    });

    updateForm({
      passengers: updatedPassengers,
      stops: updatedStops,
    });
  };

  const upsertPassenger = () => {
    if (!newPassenger.passengerName.trim()) return;

    const sharedPassenger = findSharedCredentials(
      newPassenger.guardianMobile,
      editingIndex ?? undefined,
    );

    const manualPassword = passwordInput.trim();
    const existingPassword =
      editingIndex !== null ? passengers[editingIndex].tempPassword || "" : "";
    const passwordToSave = newPassenger.autoLoginEnabled
      ? existingPassword || generatePassword()
      : manualPassword || existingPassword;
    const isPasswordChanged =
      newPassenger.autoLoginEnabled || manualPassword.length > 0 || !!existingPassword;

    const passengerToSave: Passenger = {
      ...newPassenger,
      passengerName: newPassenger.passengerName.trim(),
      guardianName: newPassenger.guardianName.trim(),
      guardianMobile: newPassenger.guardianMobile.trim(),
      username: sharedPassenger
        ? sharedPassenger.username
        : newPassenger.autoLoginEnabled
          ? newPassenger.guardianMobile.trim()
          : newPassenger.username.trim(),
      tempPassword: passwordToSave || undefined,
      passwordChanged: isPasswordChanged,

      pickupStopId:
        newPassenger.pickupStopId === ""
          ? ""
          : Number(newPassenger.pickupStopId),
      dropStopId:
        newPassenger.dropStopId === "" ? "" : Number(newPassenger.dropStopId),
    };

    const updatedPassengers =
      editingIndex === null
        ? [...passengers, passengerToSave]
        : passengers.map((passenger, index) =>
            index === editingIndex ? passengerToSave : passenger,
          );

    sync(updatedPassengers);
    resetPassengerForm();
  };

  const handleDelete = (index: number) => {
    const updatedPassengers = passengers.filter(
      (_, currentIndex) => currentIndex !== index,
    );
    sync(updatedPassengers);

    if (editingIndex === index) {
      resetPassengerForm();
    }
  };

  const handleEdit = (index: number) => {
    const passenger = passengers[index];

    setNewPassenger({
      ...passenger,
      tempPassword: "",
    });

    setEditingIndex(index);
    setShowPassword(false);
    setPasswordInput("");
  };

  const getStopName = (clientStopId: number | "") =>
    stopOptions.find((stop) => stop.clientStopId === clientStopId)?.stopName ||
    "-";

  const totalAutoLogin = passengers.filter(
    (passenger) => passenger.autoLoginEnabled,
  ).length;

  return (
    <section className="rwp-passenger">
      <div className="rwp-passenger__shell">
        <div className="rwp-passenger__banner">
          {data.routeId
            ? "Edit mode: Updating existing route."
            : "Create mode: Start a new route plan."}
        </div>

        <div className="rwp-passenger__header">
          <div>
            <p className="rwp-passenger__eyebrow">Passengers</p>
            <h3 className="rwp-passenger__title">Passenger Mapping</h3>
            <p className="rwp-passenger__subtitle">
              Add passengers, connect pickup and drop stops, and manage login
              access in one place.
            </p>
          </div>

          <div className="rwp-passenger__metrics">
            <div className="rwp-passenger__metric">
              <span className="rwp-passenger__metric-label">
                Total Passengers
              </span>
              <strong className="rwp-passenger__metric-value">
                {passengers.length}
              </strong>
            </div>
            <div className="rwp-passenger__metric">
              <span className="rwp-passenger__metric-label">Auto Login</span>
              <strong className="rwp-passenger__metric-value">
                {totalAutoLogin}
              </strong>
            </div>
          </div>
        </div>

        <div className="rwp-passenger__toggle-card">
          <div>
            <strong className="rwp-passenger__toggle-title">
              Auto-generate login
            </strong>
            <div className="rwp-passenger__hint">
              Auto create login credentials for passenger or parent.
            </div>
            {sharedCredentialsPassenger && !isPrimary && (
              <div className="rwp-passenger__hint rwp-passenger__hint--info">
                This passenger shares login with another. Password can only be
                updated from the primary record.
              </div>
            )}
          </div>

          <button
            type="button"
            className={`rwp-passenger__switch ${
              newPassenger.autoLoginEnabled ? "is-active" : ""
            }`}
            onClick={() => {
              const nextAuto = !newPassenger.autoLoginEnabled;
              const sharedPassenger = findSharedCredentials(
                newPassenger.guardianMobile,
                editingIndex ?? undefined,
              );

              setNewPassenger((prev) => ({
                ...prev,
                autoLoginEnabled: nextAuto,
                username: sharedPassenger
                  ? sharedPassenger.username
                  : nextAuto
                    ? prev.guardianMobile.trim() || ""
                    : prev.username.trim() || prev.guardianMobile.trim() || "",
              }));

              if (nextAuto) {
                setPasswordInput("");
              }
            }}
          >
            <span className="rwp-passenger__switch-thumb" />
          </button>
        </div>

        <div className="rwp-passenger__form">
          <div className="rwp-passenger__grid rwp-passenger__grid--three">
            <input
              className="rwp-passenger__input"
              placeholder="Passenger Name"
              value={newPassenger.passengerName}
              onChange={(event) =>
                setNewPassenger({
                  ...newPassenger,
                  passengerName: event.target.value,
                })
              }
            />

            <select
              className="rwp-passenger__select"
              value={newPassenger.passengerType}
              onChange={(event) =>
                setNewPassenger({
                  ...newPassenger,
                  passengerType: event.target.value as PassengerType,
                })
              }
            >
              {PASSENGER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              className="rwp-passenger__select"
              value={newPassenger.pickupStopId}
              onChange={(event) =>
                setNewPassenger({
                  ...newPassenger,
                  pickupStopId:
                    event.target.value === "" ? "" : Number(event.target.value),
                })
              }
            >
              <option value="">Select Pickup</option>
              {stopOptions.map((stop) => (
                <option key={stop.clientStopId} value={stop.clientStopId}>
                  {stop.stopName}
                </option>
              ))}
            </select>
          </div>

          <div className="rwp-passenger__grid rwp-passenger__grid--three">
            <input
              className="rwp-passenger__input"
              placeholder="Guardian Name"
              value={newPassenger.guardianName}
              onChange={(event) =>
                setNewPassenger({
                  ...newPassenger,
                  guardianName: event.target.value,
                })
              }
            />

            <input
              className="rwp-passenger__input"
              placeholder="Mobile"
              value={newPassenger.guardianMobile}
              onChange={(event) => {
                const mobile = event.target.value;

                setNewPassenger((prev) => ({
                  ...prev,
                  guardianMobile: mobile,
                  username: prev.autoLoginEnabled ? mobile : prev.username,
                }));
              }}
            />

            <select
              className="rwp-passenger__select"
              value={newPassenger.dropStopId}
              onChange={(event) =>
                setNewPassenger({
                  ...newPassenger,
                  dropStopId:
                    event.target.value === "" ? "" : Number(event.target.value),
                })
              }
            >
              <option value="">Select Drop</option>
              {stopOptions.map((stop) => (
                <option key={stop.clientStopId} value={stop.clientStopId}>
                  {stop.stopName}
                </option>
              ))}
            </select>
          </div>

          {!newPassenger.autoLoginEnabled && (
            <div className="rwp-passenger__grid rwp-passenger__grid--two">
              <input
                className="rwp-passenger__input"
                name="passengerUsername"
                autoComplete="new-username"
                placeholder="Username"
                value={newPassenger.username}
                disabled={newPassenger.autoLoginEnabled}
                onChange={(event) =>
                  setNewPassenger({
                    ...newPassenger,
                    username: event.target.value,
                  })
                }
              />
              <div className="rwp-passenger__password-wrap">
                <input
                  className="rwp-passenger__input rwp-passenger__input--with-toggle"
                  name="passengerPassword"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    newPassenger.autoLoginEnabled
                      ? "Auto-generated password"
                      : "Enter new password"
                  }
                  value={
                    newPassenger.autoLoginEnabled ? "******" : passwordInput
                  }
                  disabled={
                    newPassenger.autoLoginEnabled ||
                    (!isPrimary && editingIndex !== null)
                  }
                  onChange={(event) => setPasswordInput(event.target.value)}
                />

                <button
                  type="button"
                  className="rwp-passenger__password-toggle"
                  disabled={!isPrimary}
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rwp-passenger__footer">
          <div className="rwp-passenger__hint">
            Passengers will be saved in API payload and reflected in stop
            counts.
          </div>

          <div className="rwp-passenger__footer-actions">
            {editingIndex !== null && (
              <button
                type="button"
                className="rwp-passenger__action-btn is-muted"
                onClick={resetPassengerForm}
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              className="rwp-passenger__add-btn"
              onClick={upsertPassenger}
            >
              {editingIndex === null ? "Add Passenger" : "Update Passenger"}
            </button>
          </div>
        </div>

        <div className="rwp-passenger__table-wrap">
          <table className="rwp-passenger__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Guardian</th>
                <th>Mobile</th>
                <th>Username</th>
                <th>Login</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {passengers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="rwp-passenger__empty">
                    No passengers added yet.
                  </td>
                </tr>
              ) : (
                passengers.map((passenger, index) => (
                  <tr key={`${passenger.passengerName}-${index}`}>
                    <td>{passenger.passengerName}</td>
                    <td>
                      <span className="rwp-passenger__pill">
                        {passenger.passengerType}
                      </span>
                    </td>
                    <td>{getStopName(passenger.pickupStopId)}</td>
                    <td>{getStopName(passenger.dropStopId)}</td>
                    <td>{passenger.guardianName || "-"}</td>
                    <td>{passenger.guardianMobile || "-"}</td>
                    <td>{passenger.username || "-"}</td>
                    <td>
                      <span
                        className={`rwp-passenger__status ${
                          passenger.autoLoginEnabled ? "is-auto" : "is-manual"
                        }`}
                      >
                        {passenger.autoLoginEnabled ? "Auto" : "Manual"}
                      </span>
                    </td>
                    <td>
                      <div className="rwp-passenger__row-actions">
                        <button
                          type="button"
                          className="rwp-passenger__action-btn is-secondary"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rwp-passenger__action-btn is-danger"
                          onClick={() => handleDelete(index)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PassengersStep;
