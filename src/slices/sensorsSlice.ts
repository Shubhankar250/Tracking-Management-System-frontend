import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listSensors,
  createSensor,
  updateSensor,
  deleteSensor,
  getSensorById,
  getSensorTypes,
  getSensorAttributes,
  type DeviceSensorMappingDTO,
  type SensorTypeDTO,
  type SensorSaveDTO,
} from "../api/sensorService";

interface SensorsState {
  sensors: DeviceSensorMappingDTO[];
  totalElements: number;
  sensorTypes: SensorTypeDTO[];
  sensorDetails: DeviceSensorMappingDTO | null;
  attributes: Record<string, any> | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: SensorsState = {
  sensors: [],
  totalElements: 0,
  sensorTypes: [],
  sensorDetails: null,
  attributes: null,
  loading: false,
  creating: false,
  error: null,
};

/* ================= THUNKS ================= */

/* Fetch all sensors */
export const fetchSensors = createAsyncThunk(
  "sensors/fetchSensors",
  async ({ deviceId, page, size }: { deviceId: number; page: number; size: number }) => {
    return await listSensors(deviceId, page, size);
  },
);

/* Fetch sensor types */
export const fetchSensorTypes = createAsyncThunk(
  "sensors/fetchSensorTypes",
  async () => {
    return await getSensorTypes();
  },
);

/* Fetch sensor attributes for device */
export const fetchSensorAttributes = createAsyncThunk(
  "sensors/fetchSensorAttributes",
  async (deviceId: number) => {
    return await getSensorAttributes(deviceId);
  },
);

/* Fetch sensor details */
export const fetchSensorById = createAsyncThunk(
  "sensors/fetchSensorById",
  async (sensorId: number) => {
    return await getSensorById(sensorId);
  },
);

/* Create sensor */
export const createNewSensor = createAsyncThunk(
  "sensors/createSensor",
  async (
    { payload, deviceId }: { payload: SensorSaveDTO; deviceId: number },
    { dispatch }
  ) => {
    const res = await createSensor(payload);

    // ✅ refresh correct device sensors
    dispatch(fetchSensors({ deviceId, page: 0, size: 10 }));

    return res;
  }
);

/* Update sensor */
export const updateExistingSensor = createAsyncThunk(
  "sensors/updateSensor",
  async (
    { payload, deviceId }: { payload: SensorSaveDTO; deviceId: number },
    { dispatch }
  ) => {
    const res = await updateSensor(payload);

    dispatch(fetchSensors({ deviceId, page: 0, size: 10 }));

    return res;
  }
);

/* Delete sensor */
export const deleteExistingSensor = createAsyncThunk(
  "sensors/deleteSensor",
  async (
    { sensorId, deviceId }: { sensorId: number; deviceId: number },
    { dispatch }
  ) => {
    const res = await deleteSensor(sensorId);

    dispatch(fetchSensors({ deviceId, page: 0, size: 10 }));

    return res;
  }
);

/* ================= SLICE ================= */
const sensorsSlice = createSlice({
  name: "sensors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH SENSORS ---------- */
      .addCase(fetchSensors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSensors.fulfilled, (state, action) => {
        state.loading = false;
        state.sensors = action.payload.content;
        state.totalElements = action.payload.totalElements;
      })
      .addCase(fetchSensors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load sensors";
      })

      /* ---------- FETCH SENSOR TYPES ---------- */
      .addCase(fetchSensorTypes.fulfilled, (state, action) => {
        state.sensorTypes = action.payload;
      })

      /* ---------- FETCH SENSOR ATTRIBUTES ---------- */
      .addCase(fetchSensorAttributes.fulfilled, (state, action) => {
        state.attributes = action.payload;
      })

      /* ---------- FETCH SENSOR DETAILS ---------- */
      .addCase(fetchSensorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSensorById.fulfilled, (state, action) => {
        state.loading = false;
        state.sensorDetails = action.payload;
      })
      .addCase(fetchSensorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load sensor details";
      })

      /* ---------- CREATE SENSOR ---------- */
      .addCase(createNewSensor.pending, (state) => {
        state.creating = true;
      })
      .addCase(createNewSensor.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createNewSensor.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || "Failed to create sensor";
      })

      /* ---------- UPDATE SENSOR ---------- */
      .addCase(updateExistingSensor.pending, (state) => {
        state.creating = true;
      })
      .addCase(updateExistingSensor.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(updateExistingSensor.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || "Failed to update sensor";
      })

      /* ---------- DELETE SENSOR ---------- */
      .addCase(deleteExistingSensor.pending, (state) => {
        state.creating = true;
      })
      .addCase(deleteExistingSensor.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(deleteExistingSensor.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || "Failed to delete sensor";
      });
  },
});

export default sensorsSlice.reducer;
