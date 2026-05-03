import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDevices,
  createDevice,
  updateDevice,
  getGroups,
  getUsers,
  getDeviceByIdForUpdate,
  getDeviceGroupDataForUpdate,
  addDeviceGroup,
  updateDeviceGroup,
  type DeviceSettingDto,
  type DevicesDetailsDto,
  type DevicesUpdateDto,
  type DGMDTO,
  type DeviceGroupDataDto,
  getAllObject,
  type TodayActivityDTO,
  getTodayActivity,
  getNotAssignDevices,
} from "../api/deviceService";

/* ================= TYPES ================= */

export interface Device {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
}

interface DevicesState {
  devices: Device[];
  groups: Group[];
  users: User[];
  deviceDetails: DevicesDetailsDto | null;
    todayActivity: TodayActivityDTO | null;

  groupsData: DeviceGroupDataDto[]; // ⬅ added for device group modal
  loading: boolean;
  creating: boolean;
  error: string | null;
  objectsTable: any[];
    notAssignedDevices: { id: number; name: string }[];

recordsTotal: number;
}

/* ================= INITIAL STATE ================= */

const initialState: DevicesState = {
  devices: [],
  groups: [],
  users: [],
  deviceDetails: null,
    todayActivity: null,
  groupsData: [],
  loading: false,
  creating: false,
  error: null,
  objectsTable: [],
  notAssignedDevices:[],
recordsTotal: 0,

};

/* ================= THUNKS ================= */

/* Fetch devices */
export const fetchDevices = createAsyncThunk(
  "devices/fetchDevices",
  async () => {
    const data = await getDevices();
    return Object.entries(data).map(([id, name]) => ({ id: Number(id), name }));
  }
);
/* Fetch Not Assign Devices */
export const fetchNotAssignDevices = createAsyncThunk(
  "devices/NotAssignDevices",
  async () => {
    const data = await getNotAssignDevices();

    return Object.entries(data).map(([id, name]) => ({
      id: Number(id),
      name,
    }));
  }
);
/* Fetch device details for update */
export const fetchDeviceByIdForUpdate = createAsyncThunk(
  "devices/fetchDeviceByIdForUpdate",
  async (deviceId: number) => {
    return await getDeviceByIdForUpdate(deviceId);
  }
);

/* Fetch groups */
export const fetchGroups = createAsyncThunk(
  "devices/fetchGroups",
  async () => {
    const data = await getGroups();
    return Object.entries(data).map(([id, name]) => ({ id: Number(id), name }));
  }
);

/* Fetch users */
export const fetchUsers = createAsyncThunk(
  "devices/fetchUsers",
  async () => {
    const data = await getUsers();
    return Object.entries(data).map(([id, name]) => ({ id: Number(id), name }));
  }
);

/* Fetch device group data for update */
export const fetchDeviceGroupDataForUpdate = createAsyncThunk(
  "deviceGroups/fetchForUpdate",
  async ({ group_name, deviceIds }: { group_name: string; deviceIds: number[] }) => {
    return await getDeviceGroupDataForUpdate(group_name, deviceIds.join(","));
  }
);

/* Create new device */
type CreateDevicePayload = DeviceSettingDto & {
  rcFile?: File | null;
  insuranceFile?: File | null;
};


export const createNewDevice = createAsyncThunk(
  "devices/createDevice",
  async (payload: CreateDevicePayload, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();

      // ✅ STEP 1: Put ALL DTO fields inside "dto"
      const dto: any = { ...payload };

      delete dto.rcFile;
      delete dto.insuranceFile;

      formData.append("dto", JSON.stringify(dto));

      // ✅ STEP 2: Append files separately
      if (payload.rcFile) formData.append("rcFile", payload.rcFile);
      if (payload.insuranceFile) formData.append("insuranceFile", payload.insuranceFile);

      const res = await createDevice(formData);

      dispatch(fetchDevices());
      dispatch(fetchGroups());
      dispatch(fetchUsers());

      return res;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
/* Update existing device */
type UpdateDevicePayload = DevicesUpdateDto & {
  rcFile?: File | null;
  insuranceFile?: File | null;
};


export const updateExistingDevice = createAsyncThunk(
  "devices/updateDevice",
  async (
    { deviceId, payload }: { deviceId: number; payload: UpdateDevicePayload },
    { dispatch }
  ) => {
    const res = await updateDevice(deviceId, payload);
    // refresh dropdowns & list
    dispatch(fetchDevices());
    dispatch(fetchGroups());
    dispatch(fetchUsers());
    return res;
  }
);;

/* Create new device group */
export const createNewDeviceGroup = createAsyncThunk(
  "deviceGroups/create",
  async (payload: DGMDTO, { dispatch }) => {
    const res = await addDeviceGroup(payload);
    // refresh dropdowns & devices
    dispatch(fetchDevices());
    dispatch(fetchGroups());
    dispatch(fetchUsers());
    return res;
  }
);

/* Update existing device group */
export const updateExistingDeviceGroup = createAsyncThunk(
  "deviceGroups/update",
  async (payload: DGMDTO, { dispatch }) => {
    const res = await updateDeviceGroup(payload);
    // refresh dropdowns & devices
    dispatch(fetchDevices());
    dispatch(fetchGroups());
    dispatch(fetchUsers());
    return res;
  }
);
export const fetchAllObject = createAsyncThunk(
  "devices/fetchAllObject",
  async ({
    draw,
    start,
    length,
    search,   
  }: {
    draw: number;
    start: number;
    length: number;
    search: string;   
  }) => {
    return await getAllObject(draw, start, length, search);
  }
);
export const fetchTodayActivity = createAsyncThunk(
  "devices/fetchTodayActivity",
  async (
    {
      deviceId,
      date,
    }: {
      deviceId: number;
      date?: string;
    }
  ) => {
    return await getTodayActivity(deviceId, date);
  }
);
/* ================= SLICE ================= */

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ---------- FETCH DEVICES ---------- */
      .addCase(fetchDevices.pending, (state) => { state.loading = true; })
      .addCase(fetchDevices.fulfilled, (state, action) => { state.loading = false; state.devices = action.payload; })
      .addCase(fetchDevices.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to load devices"; })

      /* ---------- FETCH DEVICE DETAILS ---------- */
      .addCase(fetchDeviceByIdForUpdate.pending, (state) => { state.loading = true; })
      .addCase(fetchDeviceByIdForUpdate.fulfilled, (state, action) => { state.loading = false; state.deviceDetails = action.payload; })
      .addCase(fetchDeviceByIdForUpdate.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to load device details"; })

      /* ---------- FETCH GROUPS ---------- */
      .addCase(fetchGroups.fulfilled, (state, action) => { state.groups = action.payload; })

      /* ---------- FETCH USERS ---------- */
      .addCase(fetchUsers.fulfilled, (state, action) => { state.users = action.payload; })

      /* ---------- FETCH DEVICE GROUP DATA ---------- */
      .addCase(fetchDeviceGroupDataForUpdate.pending, (state) => { state.loading = true; })
      .addCase(fetchDeviceGroupDataForUpdate.fulfilled, (state, action) => { state.loading = false; state.groupsData = action.payload; })
      .addCase(fetchDeviceGroupDataForUpdate.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch device group data"; })

      /* ---------- CREATE DEVICE ---------- */
      .addCase(createNewDevice.pending, (state) => { state.creating = true; })
      .addCase(createNewDevice.fulfilled, (state) => { state.creating = false; })
      .addCase(createNewDevice.rejected, (state, action) => { state.creating = false; state.error = action.error.message || "Failed to create device"; })

      /* ---------- UPDATE DEVICE ---------- */
      .addCase(updateExistingDevice.pending, (state) => { state.creating = true; })
      .addCase(updateExistingDevice.fulfilled, (state) => { state.creating = false; })
      .addCase(updateExistingDevice.rejected, (state, action) => { state.creating = false; state.error = action.error.message || "Failed to update device"; })

      /* ---------- CREATE DEVICE GROUP ---------- */
      .addCase(createNewDeviceGroup.pending, (state) => { state.creating = true; })
      .addCase(createNewDeviceGroup.fulfilled, (state) => { state.creating = false; })
      .addCase(createNewDeviceGroup.rejected, (state, action) => { state.creating = false; state.error = action.error.message || "Failed to create device group"; })

      /* ---------- UPDATE DEVICE GROUP ---------- */
      .addCase(updateExistingDeviceGroup.pending, (state) => { state.creating = true; })
      .addCase(updateExistingDeviceGroup.fulfilled, (state) => { state.creating = false; })
      .addCase(updateExistingDeviceGroup.rejected, (state, action) => { state.creating = false; state.error = action.error.message || "Failed to update device group"; })


      .addCase(fetchAllObject.pending, (state) => {state.loading = true;})
      .addCase(fetchAllObject.fulfilled, (state, action) => { state.loading = false;
      state.objectsTable = action.payload.data;
        state.recordsTotal = action.payload.recordsTotal;})
      .addCase(fetchAllObject.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message || "Failed to load objects";
})
/* ---------- FETCH TODAY ACTIVITY ---------- */
.addCase(fetchTodayActivity.pending, (state) => {
  state.loading = true;
})
.addCase(fetchTodayActivity.fulfilled, (state, action) => {
  state.loading = false;
  state.todayActivity = action.payload;
})
builder.addCase(fetchNotAssignDevices.fulfilled, (state, action) => {
  state.notAssignedDevices = action.payload;
})
.addCase(fetchTodayActivity.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message || "Failed to load today activity";
});
  },
})


export default devicesSlice.reducer;
