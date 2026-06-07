import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  mode: 'light' | 'dark';
  companyName: string;
  logoUrl: string | null;
  gstNumber: string;
  unreadNotificationsCount: number;
}

const getInitialMode = (): 'light' | 'dark' => {
  const savedMode = localStorage.getItem('themeMode');
  return savedMode === 'light' ? 'light' : 'dark'; // Defaults to dark mode for rich aesthetics
};

const initialState: SettingsState = {
  mode: getInitialMode(),
  companyName: 'Invantage ERP',
  logoUrl: null,
  gstNumber: '',
  unreadNotificationsCount: 0,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', state.mode);
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
      localStorage.setItem('themeMode', state.mode);
    },
    updateCompanySettingsState: (state, action: PayloadAction<{ companyName: string; logoUrl: string | null; gstNumber?: string }>) => {
      state.companyName = action.payload.companyName;
      state.logoUrl = action.payload.logoUrl;
      if (action.payload.gstNumber !== undefined) {
        state.gstNumber = action.payload.gstNumber;
      }
    },
    setUnreadNotificationsCount: (state, action: PayloadAction<number>) => {
      state.unreadNotificationsCount = action.payload;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadNotificationsCount > 0) {
        state.unreadNotificationsCount -= 1;
      }
    },
  },
});

export const { toggleThemeMode, setThemeMode, updateCompanySettingsState, setUnreadNotificationsCount, decrementUnreadCount } = settingsSlice.actions;
export default settingsSlice.reducer;
