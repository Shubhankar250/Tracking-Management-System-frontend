import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getDefaultPermissions,
  getMapSettings,
  getDevicesGrouped,
  type UserDTO,
  type CustomUserDTO,
  type UserModulePermission,
  type MapSettings,
  type GroupedDevicesDTO,
  type UsersMapDTO,
  getAllUserMap
} from "../api/users.api";

/* ================= STATE ================= */
interface UsersState {
  list: UserDTO[];
  selected?: UserDTO;
  permissions: UserModulePermission[];
  mapSettings?: MapSettings;
  groupedDevices?: GroupedDevicesDTO;
  totalRecords: number;
  page: number;
  pageSize: number;
  search: string;
    usersMap?: UsersMapDTO;

  loading: boolean;
}

const initialState: UsersState = {
  list: [],
  permissions: [],
  totalRecords: 0,
  page: 1,
  pageSize: 25,
  search: "",
  loading: false,
};

/* ================= THUNKS ================= */

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { getState }) => {
    const state = getState() as any;
    const { page, pageSize, search } = state.users;

    const res = await getUsers(page, pageSize, search);
    return res.data;
  },
);


export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id: number) => (await getUserById(id)).data
);

export const createUser = createAsyncThunk(
  "users/create",
  async (
    { payload, groupId }: { payload: CustomUserDTO; groupId: number },
    { dispatch }
  ) => {
    await addUser(payload, groupId);
    dispatch(fetchUsers());
  }
);

export const editUser = createAsyncThunk(
  "users/update",
  async (
    { payload, groupId }: { payload: CustomUserDTO; groupId: number },
    { dispatch }
  ) => {
    await updateUser(payload, groupId);
    dispatch(fetchUsers());
  }
);

export const removeUser = createAsyncThunk(
  "users/delete",
  async (id: number, { dispatch }) => {
    await deleteUser(id);
    dispatch(fetchUsers());
  }
);

export const fetchDefaultPermissions = createAsyncThunk(
  "users/permissions",
  async () => (await getDefaultPermissions()).data
);

export const fetchMapSettings = createAsyncThunk(
  "users/maps",
  async () => (await getMapSettings()).data
);

/* ✅ NEW: GROUPED DEVICES */
export const fetchGroupedDevices = createAsyncThunk(
  "users/groupedDevices",
  async () => (await getDevicesGrouped()).data
);
export const fetchAllUser = createAsyncThunk(
  "users/allUserMap",
  async () => (await getAllUserMap()).data
);

/* ================= SLICE ================= */
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload;
    },
    setSearch(state, action) {
      state.search = action.payload;
    },
  },
  extraReducers(builder) {
    builder

      // USERS
      .addCase(fetchUsers.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.content;
        s.totalRecords = a.payload.totalElements;
      })
      .addCase(fetchUsers.rejected, (s) => {
        s.loading = false;
      })

      // SINGLE USER
      .addCase(fetchUserById.fulfilled, (s, a) => {
        s.selected = a.payload;
      })

      // PERMISSIONS
      .addCase(fetchDefaultPermissions.fulfilled, (s, a) => {
        s.permissions = a.payload;
      })

      // MAP SETTINGS
      .addCase(fetchMapSettings.fulfilled, (s, a) => {
        s.mapSettings = a.payload;
      })

      // GROUPED DEVICES
      .addCase(fetchGroupedDevices.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchGroupedDevices.fulfilled, (s, a) => {
        s.loading = false;
        s.groupedDevices = a.payload;
      })
      .addCase(fetchGroupedDevices.rejected, (s) => {
        s.loading = false;
      })
      .addCase(fetchAllUser.pending, (s) => {
  s.loading = true;
})
.addCase(fetchAllUser.fulfilled, (s, a) => {
  s.loading = false;
  s.usersMap = a.payload;
})
.addCase(fetchAllUser.rejected, (s) => {
  s.loading = false;
});
  },
});

export const { setPage, setPageSize, setSearch } = usersSlice.actions;


export default usersSlice.reducer;
