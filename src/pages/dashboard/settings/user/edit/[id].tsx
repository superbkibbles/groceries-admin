import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SettingForm from "@/components/settings/SettingForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUserSettings,
  updateUserSetting,
  setCurrentSetting,
} from "@/store/slices/settingsSlice";
import { Setting } from "@/services/settingService";

export default function EditUserSetting() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { userSettings, loading, error } = useAppSelector(
    (state) => state.settings
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [setting, setSetting] = useState<Setting | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Fetch settings if not already loaded
    if (isAuthenticated && userSettings.length === 0) {
      dispatch(fetchUserSettings({}));
    }
  }, [dispatch, isAuthenticated, userSettings.length]);

  useEffect(() => {
    // Find the setting to edit
    if (id && userSettings.length > 0) {
      const foundSetting = userSettings.find((s) => s.id === id);
      if (foundSetting) {
        setSetting(foundSetting);
        dispatch(setCurrentSetting(foundSetting));
      } else {
        // Setting not found, redirect back
        router.push("/dashboard/settings?tab=user");
      }
    }
  }, [id, userSettings, dispatch, router]);

  const handleSubmit = async (data: {
    key: string;
    description: string;
    type: string;
    value: string | number | boolean | object;
  }) => {
    if (!id) return;

    try {
      await dispatch(
        updateUserSetting({
          id: id as string,
          settingData: {
            value: data.value,
            description: data.description,
          },
        })
      ).unwrap();
      router.push("/dashboard/settings?tab=user");
    } catch (error) {
      console.error("Failed to update user setting:", error);
    }
  };

  if (!setting) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit User Setting</h1>
          </div>
          <div className="text-center py-8">Loading setting...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit User Setting</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <SettingForm
          type="user"
          initialData={setting}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </DashboardLayout>
  );
}
