import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "User",
  initialState: {
    name: "",
    loading: false,
    error: null,
    roomcode: "",
    role: "user",
    userrequest: null, // ✅ "null" string ke bajaye null rakh (bug tha)
  },
  reducers: {
    setName(state, action) {
      state.name = action.payload;
    },
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setRoomcode(state, action) {
      state.roomcode = action.payload;
    },
    setRole(state, action) {
      state.role = action.payload;
    },
    setUserrequest(state, action) {
      state.userrequest = action.payload;
    },
    // ✅ NEW - Clear user on disconnect/logout
    clearUser(state) {
      state.name = "";
      state.loading = false;
      state.error = null;
      state.roomcode = "";
      state.role = "user";
      state.userrequest = null;
    },
  },
});

export const { 
  setName, 
  setLoading, 
  setError, 
  setRoomcode, 
  setRole, 
  setUserrequest,
  clearUser // ✅ Export karo
} = userSlice.actions;

export default userSlice.reducer;