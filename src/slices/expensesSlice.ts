import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenses.api";
import type { Expense } from "../api/expenses.api";

interface State {
  data: Expense[];
  totalRecords: number;
  selected: Expense | null;
  loading: boolean;
}

const initialState: State = {
  data: [],
  totalRecords: 0,
  selected: null,
  loading: false,
};

export const fetchExpenses = createAsyncThunk(
  "expenses/fetch",
  async (params: { page: number; pageSize: number; search: string }) => {
    const res = await getExpenses(params);
    return res.data;
  }
);

export const fetchExpenseById = createAsyncThunk(
  "expenses/fetchById",
  async (id: number) => {
    const res = await getExpenseById(id);
    return res.data;
  }
);

export const createExpense = createAsyncThunk(
  "expenses/create",
  async (payload: Partial<Expense>) => {
    const res = await addExpense(payload);
    return res.data;
  }
);

export const editExpense = createAsyncThunk(
  "expenses/update",
  async (payload: Partial<Expense>) => {
    const res = await updateExpense(payload);
    return res.data;
  }
);

export const removeExpense = createAsyncThunk(
  "expenses/delete",
  async (id: number) => {
    await deleteExpense(id);
    return id;
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchExpenses.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (s, a) => {
        s.data = a.payload.data;
        s.totalRecords = a.payload.totalRecords;
        s.loading = false;
      })
      .addCase(fetchExpenses.rejected, (s) => {
        s.loading = false;
      })

      .addCase(fetchExpenseById.fulfilled, (s, a) => {
        s.selected = a.payload;
      })

      .addCase(createExpense.pending, (s) => {
        s.loading = true;
      })
      .addCase(createExpense.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(createExpense.rejected, (s) => {
        s.loading = false;
      })

      .addCase(editExpense.pending, (s) => {
        s.loading = true;
      })
      .addCase(editExpense.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(editExpense.rejected, (s) => {
        s.loading = false;
      })

      .addCase(removeExpense.pending, (s) => {
        s.loading = true;
      })
      .addCase(removeExpense.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(removeExpense.rejected, (s) => {
        s.loading = false;
      });
  },
});

export default expensesSlice.reducer;
