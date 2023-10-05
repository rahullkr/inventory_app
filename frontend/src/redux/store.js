import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/features/auth/authSlice";

export const store = configureStore({
  reducer: { // It should be "reducer" not "reuer"
    auth: authReducer,
  },
});
