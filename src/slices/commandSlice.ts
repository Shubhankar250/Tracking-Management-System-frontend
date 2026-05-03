import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchCommandsApi,
  fetchCommandByIdApi,
  createCommandApi,
  updateCommandApi,
  deleteCommandApi,
  fetchCommandsByDeviceApi,
  sendCommandApi,
  fetchCommandLogsApi,
  type CommandDTO,
  downloadCommandTemplateApi,
  previewCommandExcelApi,
  uploadCommandExcelApi,
} from "../api/commandService.ts";

/* =======================
   STATE
======================= */

interface CommandState {
  commands: CommandDTO[];
  commandLogs: CommandDTO[];
  previewData: CommandDTO[];
  selectedCommand: CommandDTO | null;
  deviceCommands: Record<string, string>;
  loading: boolean;

  totalPages: number;
  totalElements: number;
  currentPage: number;

  logTotalPages: number;
  logTotalElements: number;
  logCurrentPage: number;
}

const initialState: CommandState = {
  commands: [],
  commandLogs: [],
  previewData: [],
  selectedCommand: null,
  deviceCommands: {},
  loading: false,
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  logTotalPages: 0,
  logTotalElements: 0,
  logCurrentPage: 0,
};

/* =======================
   THUNKS
======================= */

// GET /commands
export const fetchCommands = createAsyncThunk(
  "commands/fetchCommands",
  async ({
    page,
    size,
    search,
  }: {
    page: number;
    size: number;
    search: string;
  }) => {
    const res = await fetchCommandsApi(page, size, search);
    return res.data;
  },
);

// GET /commands/{id}
export const fetchCommandById = createAsyncThunk(
  "commands/fetchCommandById",
  async (id: number) => {
    const res = await fetchCommandByIdApi(id);
    return res.data;
  },
);

// POST /commands
export const createCommand = createAsyncThunk(
  "commands/createCommand",
  async (payload: CommandDTO) => {
    const res = await createCommandApi(payload);
    return res.data;
  },
);

// PUT /commands
export const updateCommand = createAsyncThunk(
  "commands/updateCommand",
  async (payload: CommandDTO) => {
    const res = await updateCommandApi(payload);
    return res.data;
  },
);

// DELETE /commands?id=
export const removeCommand = createAsyncThunk(
  "commands/removeCommand",
  async (id: number) => {
    const res = await deleteCommandApi(id);
    return { id, data: res.data };
  },
);

// GET /commands/byDeviceId
export const fetchCommandsByDevice = createAsyncThunk(
  "commands/fetchCommandsByDevice",
  async (deviceId: number) => {
    const res = await fetchCommandsByDeviceApi(deviceId);
    return res.data;
  },
);

// POST /commands/send
export const sendCommand = createAsyncThunk(
  "commands/sendCommand",
  async (payload: CommandDTO) => {
    const res = await sendCommandApi(payload);
    return res.data;
  },
);

// GET /commands/log
export const fetchCommandLogs = createAsyncThunk(
  "commands/fetchCommandLogs",
  async ({
    page,
    size,
    search,
  }: {
    page: number;
    size: number;
    search: string;
  }) => {
    const res = await fetchCommandLogsApi(page, size, search);
    return res.data;
  },
);

export const downloadCommandTemplate = createAsyncThunk(
  "commands/downloadTemplate",
  async () => {
    const res = await downloadCommandTemplateApi();
    return res.data;
  },
);

export const previewCommandExcel = createAsyncThunk(
  "commands/previewExcel",
  async (file: File) => {
    const res = await previewCommandExcelApi(file);
    return res.data;
  },
);

export const uploadCommandExcel = createAsyncThunk(
  "commands/uploadExcel",
  async (file: File) => {
    const res = await uploadCommandExcelApi(file);
    return res.data;
  },
);

/* =======================
   SLICE
======================= */

const commandSlice = createSlice({
  name: "commands",
  initialState,
  reducers: {
    clearSelectedCommand: (state) => {
      state.selectedCommand = null;
    },
    clearPreview: (state) => {
      state.previewData = [];
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- COMMAND LIST ---------- */
      .addCase(fetchCommands.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCommands.fulfilled, (state, action) => {
        state.loading = false;

        state.commands = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchCommands.rejected, (state) => {
        state.loading = false;
      })

      /* ---------- SINGLE COMMAND ---------- */
      .addCase(fetchCommandById.fulfilled, (state, action) => {
        state.selectedCommand = action.payload;
      })

      /* ---------- DEVICE COMMANDS ---------- */
      .addCase(fetchCommandsByDevice.fulfilled, (state, action) => {
        state.deviceCommands = action.payload || {};
      })

      /* ---------- SEND COMMAND ---------- */
      .addCase(sendCommand.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendCommand.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendCommand.rejected, (state) => {
        state.loading = false;
      })

      /* ---------- COMMAND LOGS ---------- */
      .addCase(fetchCommandLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCommandLogs.fulfilled, (state, action) => {
        state.loading = false;

        state.commandLogs = action.payload.content;
        state.logTotalPages = action.payload.totalPages;
        state.logTotalElements = action.payload.totalElements;
        state.logCurrentPage = action.payload.number;
      })
      .addCase(fetchCommandLogs.rejected, (state) => {
        state.loading = false;
      })

      /* ---------- CUpload/Download Template ---------- */
      .addCase(downloadCommandTemplate.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadCommandTemplate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadCommandTemplate.rejected, (state) => {
        state.loading = false;
      })

      .addCase(previewCommandExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(previewCommandExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.previewData = action.payload;
      })
      .addCase(previewCommandExcel.rejected, (state) => {
        state.loading = false;
      })
      .addCase(uploadCommandExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadCommandExcel.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadCommandExcel.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearSelectedCommand, clearPreview } = commandSlice.actions;
export default commandSlice.reducer;
