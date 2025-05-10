import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import SettingForm from '@/components/settings/SettingForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSystemSettings, updateSystemSetting, setCurrentSetting } from '@/store/slices/settingsSlice';
import { Setting } from '@/services/settingService';

export default function EditSystemSetting() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { systemSettings, loading, error } = useAppSelector((state) => state.settings);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [setting, setSetting] = useState<Setting | null>(null);

  useEffect(() => {
    // If not authenticated or not admin, redirect
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/dashboard/settings');
    }
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    // Fetch settings if not already loaded
    if (isAuthenticated && systemSettings.length === 0) {
      dispatch(fetchSystemSettings());
    }
  }, [dispatch, isAuthenticated, systemSettings.length]);

  useEffect(() => {
    // Find the setting to edit
    if (id && systemSettings.length > 0) {
      const foundSetting = systemSettings.find(s => s.id === id);
      if (foundSetting) {
        setSetting(foundSetting);
        dispatch(setCurrentSetting(foundSetting));
      } else {
        // Setting not found, redirect back
        router.push('/dashboard/settings');
      }
    }
  }, [id, systemSettings, dispatch, router]);

  const handleSubmit = async (data: any) => {
    if (!id) return;
    
    try {
      await dispatch(updateSystemSetting({ 
        id: id as string, 
        settingData: {
          value: data.value,
          description: data.description
        } 
      })).unwrap();
      router.push('/dashboard/settings');
    } catch (error) {
      console.error('Failed to update system setting:', error);
    }
  };

  if (!setting) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit System Setting</h1>
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
          <h1 className="text-3xl font-bold">Edit System Setting</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        <SettingForm 
          type="system" 
          initialData={setting}
          onSubmit={handleSubmit} 
          isLoading={loading} 
        />
      </div>
    </DashboardLayout>
  );
}