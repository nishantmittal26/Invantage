import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

const initialState: AlertState = {
  open: false,
  message: '',
  severity: 'info',
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action: PayloadAction<{ message: string; severity?: 'success' | 'info' | 'warning' | 'error' }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity ?? 'info';
    },
    hideAlert: (state) => {
      state.open = false;
      state.message = '';
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;
