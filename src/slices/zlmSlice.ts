import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createZlm,
  deleteZlm,
  fetchTokenByProject,
  getAllZlm,
  type ExternalAccessTokenDTO,
} from "../api/zlm.api";
import { updateZlmToken } from "./authSlice";
import { tokenService } from "../api/tokenService";

/* ================= STATE ================= */

interface ZlmState {
  list: ExternalAccessTokenDTO[];
  selected?: ExternalAccessTokenDTO;

  totalRecords: number;
  page: number;
  pageSize: number;
  search: string;

  loading: boolean;
   tokenLoading?: boolean;  
}

const initialState: ZlmState = {
  list: [],
  totalRecords: 0,
  page: 0,
  pageSize: 10,
  search: "",
  loading: false,
};

/* ================= THUNKS ================= */

export const fetchZlm = createAsyncThunk(
  "zlm/fetchAll",
  async (_, { getState }) => {
    const state = getState() as any;
    const { page, pageSize, search } = state.zlm;

    const res = await getAllZlm(page, pageSize, search);
    return res.data;
  }
);

export const saveZlm = createAsyncThunk(
  "zlm/save",
  async (payload: ExternalAccessTokenDTO, { dispatch }) => {
    await createZlm(payload);
    dispatch(fetchZlm());
  }
);
/* DELETE */
export const removeZlm = createAsyncThunk(
  "zlm/delete",
  async (id: number, { dispatch }) => {
    await deleteZlm(id);
    dispatch(fetchZlm()); // refresh list
  }
);

/* FETCH TOKEN FROM SERVER */
export const fetchProjectToken = createAsyncThunk(
  "zlm/fetchToken",
  async (projectName: string, { dispatch }) => {
    const res = await fetchTokenByProject(projectName);

    dispatch(
      updateZlmToken({
        zlm_token: res.data.token,
        url: res.data.url,
      })
    );
   tokenService.setZlmToken(res.data.token);
    tokenService.setZlmUrl(res.data.url);
    dispatch(fetchZlm());
    return res.data;
  }
);
/* ================= SLICE ================= */

const zlmSlice = createSlice({
  name: "zlm",
  initialState,
  reducers: {
    setZlmPage(state, action) {
      state.page = action.payload;
    },
    setZlmPageSize(state, action) {
      state.pageSize = action.payload;
    },
    setZlmSearch(state, action) {
      state.search = action.payload;
    },
    setSelectedZlm(state, action) {
      state.selected = action.payload;
    },
  },
 extraReducers(builder) {
  builder
    .addCase(fetchZlm.pending, (s) => {
      s.loading = true;
    })
    .addCase(fetchZlm.fulfilled, (s, a) => {
      s.loading = false;
      s.list = a.payload.data;
      s.totalRecords = a.payload.totalItems;
    })
    .addCase(fetchZlm.rejected, (s) => {
      s.loading = false;
    })

    /* FETCH TOKEN */
    .addCase(fetchProjectToken.pending, (s) => {
      s.tokenLoading = true;
    })
    .addCase(fetchProjectToken.fulfilled, (s, a) => {
      s.tokenLoading = false;

     if (s.selected && a.payload) {
  s.selected.externalAccessToken = a.payload.token;
  s.selected.url = a.payload.url;   // ⭐ recommended
}

    })
    .addCase(fetchProjectToken.rejected, (s) => {
      s.tokenLoading = false;
    });
}

});

export const {
  setZlmPage,
  setZlmPageSize,
  setZlmSearch,
  setSelectedZlm,
} = zlmSlice.actions;

export default zlmSlice.reducer;
