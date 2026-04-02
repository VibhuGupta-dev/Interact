import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice ({
    name : "User",
    initialState : {
        name : "",
        loading : false,
        error : null,
        roomcode : ""
    },
    reducers : {
        setName(state , action){
            state.name = action.payload
        },
        setLoading(state) {
            state.loading = true,
            state.error = null
        },
        setError (state , action) {
            state.error = action.payload
        },
        setRoomcode (state , action) {
            state.roomcode = action.payload
        }
    }
})

export const { setName, setLoading, setError, setRoomcode } = userSlice.actions;

export default userSlice.reducer;