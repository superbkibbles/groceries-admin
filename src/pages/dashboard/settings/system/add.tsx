import { useRouter } from 'next/router';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import SettingForm from '@/components/settings/SettingForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createSystemSetting } from '@/store/slices/settingsSlice';
import { CreateSettingDto } from '@/services/settingService';

export default function AddSystemSetting() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.settings);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If not authenticated or not admin, redirect
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/dashboard/settings');
    }
  }, [isAuthenticated, router, user]);

  const handleSubmit = async (data: CreateSettingDto) => {
    try {
      await dispatch(createSystemSetting(data)).unwrap();
      router.push('/dashboard/settings');
    } catch (error) {
      console.error('Failed to create system setting:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Add System Setting</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        <SettingForm 
          type="system" 
          onSubmit={handleSubmit} 
          isLoading={loading} 
        />
      </div>
    </DashboardLayout>
  );
}