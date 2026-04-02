import {configureStore} from "@reduxjs/toolkit"
import  userReducer  from "./Features/UserSlice.js"

const store = configureStore({
    reducer : {
        User : userReducer
    }
})

export default store