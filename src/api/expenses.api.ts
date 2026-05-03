import axiosClient from "./axiosClient";

export interface Expense {
  id: number;
  expenseName: string;
  deviceId: number;
  deviceName:string;
  date: string;
  expenseOdometer: number;
  cost: number;
  description: string;
  supplier: string;
  buyer: string;
  quantity: number;
  engineHour: number;
  adminId: number;
  userId: number;
}

export interface ExpenseResponse {
  data: Expense[];
  totalRecords: number;
}

export const getExpenses = (params: {
  page: number;
  pageSize: number;
  search: string;
}) =>
  axiosClient.get<ExpenseResponse>("/expenses", {
    params,
  });

export const getExpenseById = (id: number) =>
  axiosClient.get<Expense>(`/expenses/${id}`);

export const addExpense = (data: Partial<Expense>) =>
  axiosClient.post<Expense>("/expenses", data);

export const updateExpense = (data: Partial<Expense>) =>
  axiosClient.put<Expense>("/expenses", data);

export const deleteExpense = (id: number) =>
  axiosClient.delete(`/expenses/${id}`);
