import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import ShiftStep from "./ShiftStep";
import RouteBasicsStep from "./RouteBasicsStep";
import PlannerMapStep from "./PlannerMapStep";
import StopsStep from "./StopsStep";
import PassengersStep from "./PassengersStep";
import SummaryStep from "./SummaryStep";
import "../../assets/css/routeWizard.css";

import {
  createRoutePlanner,
  editRoute,
  fetchRoutePlannerById,
} from "../../slices/transportPlannerSlice";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchDevices } from "../../slices/devicesSlice";
import { toast } from "react-toastify";

const steps = [
  "Shift",
  "Route Basics",
  "Planner Map",
  "Stops",
  "Passengers",
  "Summary",
];

const initialFormData = {
  routeId: null,
  shiftName: "",
  startTime: "",
  endTime: "",
  activeDays: [],
  holidayDates: [],
  routeName: "",
  routeType: "",
  defaultVehicleId: null,
  sourceType: "manual",
  routeGeoJson: "",
  stops: [],
  passengers: [],
};

const RouteWizardModal = ({ isOpen, onClose, routeId, onSuccess }: any) => {
  const dispatch = useAppDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const { route } = useAppSelector((state) => state.planner);
  const { devices: vehicleList } = useAppSelector((state) => state.devices);

  const [formData, setFormData] = useState<any>(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const updateForm = (data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      ...data,
    }));
  };

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    setActiveStep(0);

    if (routeId) {
      dispatch(fetchRoutePlannerById(routeId));
    } else {
      resetForm();
    }
  }, [dispatch, isOpen, routeId]);

  useEffect(() => {
    if (!isOpen || !route || !routeId) return;

    setFormData({
      routeId: route.routeId,
      shiftName: route.shiftName || "",
      startTime: route.startTime || "",
      endTime: route.endTime || "",
      activeDays: route.activeDays || [],
      holidayDates: route.holidayDates || [],
      routeName: route.routeName || "",
      routeType: route.routeType || "",
      defaultVehicleId: route.defaultVehicleId || null,
      sourceType: route.sourceType || "manual",
      routeGeoJson: route.routeGeoJson || "",
      stops: route.stops || [],
      passengers: route.passengers || [],
    });
  }, [route, isOpen, routeId]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      if (formData.routeId) {
        await dispatch(
          editRoute({
            routeId: formData.routeId,
            data: formData,
          }),
        ).unwrap();

        toast.success("Route updated successfully");
      } else {
        await dispatch(createRoutePlanner(formData)).unwrap();
        toast.success("Route created successfully");
      }

      onSuccess?.();
      onClose?.();
      resetForm();
      setActiveStep(0);
    } catch (err) {
      console.error(err);
      alert("Error saving route");
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <ShiftStep data={formData} updateForm={updateForm} />;

      case 1:
        return (
          <RouteBasicsStep
            data={formData}
            updateForm={updateForm}
            vehicles={vehicleList}
          />
        );

      case 2:
        return <PlannerMapStep data={formData} updateForm={updateForm} />;

      case 3:
        return <StopsStep data={formData} updateForm={updateForm} />;

      case 4:
        return <PassengersStep data={formData} updateForm={updateForm} />;

      case 5:
        return <SummaryStep data={formData} vehicles={vehicleList} />;

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title="Route Wizard"
      onClose={onClose}
      size="fullscreen"
    >
      <div className="wizard-wrapper">
        <div className="wizard-header">
          <div className="header-left" />

          <div className="header-actions">
            <button className="btn-light" onClick={resetForm}>
              Reset
            </button>

            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : formData.routeId
                  ? "Update Route"
                  : "Save Route"}
            </button>
          </div>
        </div>

        <div className="wizard-container">
          <div className="wizard-sidebar">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`wizard-step ${
                  index < activeStep ? "completed" : ""
                } ${index === activeStep ? "active" : ""}`}
                onClick={() => setActiveStep(index)}
              >
                <span>Step {index + 1}</span>
                <h4>{step}</h4>
              </div>
            ))}
          </div>

          <div className="wizard-content">
            {renderStep()}

            <div className="wizard-footer">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev: number) => prev - 1)}
              >
                Previous
              </button>

              <button
                disabled={activeStep === steps.length - 1}
                onClick={() => setActiveStep((prev: number) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RouteWizardModal;
