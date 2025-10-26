import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import settingService from "@/services/settingService";
import type {
  Setting,
  SettingFilter,
  CreateSettingDto,
} from "@/services/settingService";

interface SettingsState {
  systemSettings: Setting[];
  userSettings: Setting[];
  currentSetting: Setting | null;
  totalSystemSettings: number;
  totalUserSettings: number;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  systemSettings: [],
  userSettings: [],
  currentSetting: null,
  totalSystemSettings: 0,
  totalUserSettings: 0,
  loading: false,
  error: null,
};

// Fetch system settings
export const fetchSystemSettings = createAsyncThunk(
  "settings/fetchSystemSettings",
  async (filters: SettingFilter = {}, { rejectWithValue }) => {
    try {
      const response = await settingService.getSystemSettings(filters);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to fetch system settings"
      );
    }
  }
);

// Fetch user settings
export const fetchUserSettings = createAsyncThunk(
  "settings/fetchUserSettings",
  async (filters: SettingFilter = {}, { rejectWithValue }) => {
    try {
      const response = await settingService.getUserSettings(filters);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to fetch user settings"
      );
    }
  }
);

// Create system setting
export const createSystemSetting = createAsyncThunk(
  "settings/createSystemSetting",
  async (settingData: CreateSettingDto, { rejectWithValue }) => {
    try {
      const response = await settingService.createSystemSetting(settingData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to create system setting"
      );
    }
  }
);

// Create user setting
export const createUserSetting = createAsyncThunk(
  "settings/createUserSetting",
  async (settingData: CreateSettingDto, { rejectWithValue }) => {
    try {
      const response = await settingService.createUserSetting(settingData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to create user setting"
      );
    }
  }
);

// Update system setting
export const updateSystemSetting = createAsyncThunk(
  "settings/updateSystemSetting",
  async (
    { id, settingData }: { id: string; settingData: Partial<CreateSettingDto> },
    { rejectWithValue }
  ) => {
    try {
      const response = await settingService.updateSystemSetting(
        id,
        settingData
      );
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to update system setting"
      );
    }
  }
);

// Update user setting
export const updateUserSetting = createAsyncThunk(
  "settings/updateUserSetting",
  async (
    { id, settingData }: { id: string; settingData: Partial<CreateSettingDto> },
    { rejectWithValue }
  ) => {
    try {
      const response = await settingService.updateUserSetting(id, settingData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to update user setting"
      );
    }
  }
);

// Delete system setting
export const deleteSystemSetting = createAsyncThunk(
  "settings/deleteSystemSetting",
  async (id: string, { rejectWithValue }) => {
    try {
      await settingService.deleteSystemSetting(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to delete system setting"
      );
    }
  }
);

// Delete user setting
export const deleteUserSetting = createAsyncThunk(
  "settings/deleteUserSetting",
  async (id: string, { rejectWithValue }) => {
    try {
      await settingService.deleteUserSetting(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to delete user setting"
      );
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearCurrentSetting: (state) => {
      state.currentSetting = null;
    },
    setCurrentSetting: (state, action: PayloadAction<Setting>) => {
      state.currentSetting = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch system settings
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.systemSettings = action.payload.data;
        state.totalSystemSettings = action.payload.total;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch user settings
      .addCase(fetchUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.userSettings = action.payload.data;
        state.totalUserSettings = action.payload.total;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create system setting
      .addCase(createSystemSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSystemSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.systemSettings.push(action.payload);
        state.totalSystemSettings += 1;
      })
      .addCase(createSystemSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create user setting
      .addCase(createUserSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.userSettings.push(action.payload);
        state.totalUserSettings += 1;
      })
      .addCase(createUserSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update system setting
      .addCase(updateSystemSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemSetting.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.systemSettings.findIndex(
          (setting) => setting.id === action.payload.id
        );
        if (index !== -1) {
          state.systemSettings[index] = action.payload;
        }
        state.currentSetting = action.payload;
      })
      .addCase(updateSystemSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update user setting
      .addCase(updateUserSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserSetting.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.userSettings.findIndex(
          (setting) => setting.id === action.payload.id
        );
        if (index !== -1) {
          state.userSettings[index] = action.payload;
        }
        state.currentSetting = action.payload;
      })
      .addCase(updateUserSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete system setting
      .addCase(deleteSystemSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSystemSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.systemSettings = state.systemSettings.filter(
          (setting) => setting.id !== action.payload
        );
        state.totalSystemSettings -= 1;
        if (
          state.currentSetting &&
          state.currentSetting.id === action.payload
        ) {
          state.currentSetting = null;
        }
      })
      .addCase(deleteSystemSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete user setting
      .addCase(deleteUserSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.userSettings = state.userSettings.filter(
          (setting) => setting.id !== action.payload
        );
        state.totalUserSettings -= 1;
        if (
          state.currentSetting &&
          state.currentSetting.id === action.payload
        ) {
          state.currentSetting = null;
        }
      })
      .addCase(deleteUserSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSetting, setCurrentSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
