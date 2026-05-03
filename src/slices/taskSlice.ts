import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getTask,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
} from "../api/taskApi";
import type { Task } from "../api/taskApi";

interface State {
  data: Task[];
  totalRecords: number;
  selected: Task | null;
  loading: boolean;
}

const initialState: State = {
  data: [],
  totalRecords: 0,
  selected: null,
  loading: false,
};

export const fetchtask = createAsyncThunk(
  "tasks/fetch",
  async (params: { 
    page: number; 
    pageSize: number; 
    search?: string;      // ← made optional
    deviceId: number; 
    start_time?: string;  // ← made optional  
    end_time?: string;    // ← made optional
  }) => {
    const res = await getTask(params);
    return res.data;
  }
);

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchById",
  async (id: number) => {
    const res = await getTaskById(id);
    return res.data;
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (payload: Partial<Task>) => {
    const res = await addTask(payload);
    return res.data;
  }
);

export const editTask = createAsyncThunk(
  "tasks/update",
  async (payload: Partial<Task>) => {
    const res = await updateTask(payload);
    return res.data;
  }
);

export const removeTask = createAsyncThunk(
  "tasks/delete",
  async (id: number) => {
    await deleteTask(id);
    return id;
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchtask.pending, (state) => {
      state.loading = true;
    })

 .addCase(fetchtask.fulfilled, (state, action) => {
  state.loading = false;

  state.data = action.payload.content || [];
  state.totalRecords = action.payload.totalElements || 0;
})

    .addCase(fetchtask.rejected, (state) => {
      state.loading = false;
      state.data = [];
    })

    .addCase(fetchTaskById.fulfilled, (state, action) => {
      state.selected = action.payload;
    })
      .addCase(createTask.pending, (s) => {
        s.loading = true;
      })
      .addCase(createTask.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(createTask.rejected, (s) => {
        s.loading = false;
      })

      .addCase(editTask.pending, (s) => {
        s.loading = true;
      })
      .addCase(editTask.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(editTask.rejected, (s) => {
        s.loading = false;
      })

      .addCase(removeTask.pending, (s) => {
        s.loading = true;
      })
      .addCase(removeTask.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(removeTask.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default taskSlice.reducer;
