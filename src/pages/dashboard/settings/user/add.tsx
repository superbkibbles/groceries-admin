import { useRouter } from 'next/router';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import SettingForm from '@/components/settings/SettingForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createUserSetting } from '@/store/slices/settingsSlice';
import { CreateSettingDto } from '@/services/settingService';

export default function AddUserSetting() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.settings);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (data: CreateSettingDto) => {
    try {
      await dispatch(createUserSetting(data)).unwrap();
      router.push('/dashboard/settings?tab=user');
    } catch (error) {
      console.error('Failed to create user setting:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Add User Setting</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        <SettingForm 
          type="user" 
          onSubmit={handleSubmit} 
          isLoading={loading} 
        />
      </div>
    </DashboardLayout>
  );
}