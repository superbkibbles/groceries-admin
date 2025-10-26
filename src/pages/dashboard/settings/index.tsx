import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSystemSettings,
  fetchUserSettings,
  deleteSystemSetting,
  deleteUserSetting,
} from "@/store/slices/settingsSlice";
import { Setting } from "@/services/settingService";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Settings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { systemSettings, userSettings, loading, error } = useAppSelector(
    (state) => state.settings
  );
  const [activeTab, setActiveTab] = useState("system");

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Fetch settings when component mounts
    if (isAuthenticated) {
      dispatch(fetchSystemSettings({}));
      dispatch(fetchUserSettings({}));
    }
  }, [dispatch, isAuthenticated]);

  const handleAddSetting = (type: "system" | "user") => {
    router.push(`/dashboard/settings/${type}/add`);
  };

  const handleEditSetting = (type: "system" | "user", id: string) => {
    router.push(`/dashboard/settings/${type}/edit/${id}`);
  };

  const handleDeleteSetting = (type: "system" | "user", id: string) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      if (type === "system") {
        dispatch(deleteSystemSetting(id));
      } else {
        dispatch(deleteUserSetting(id));
      }
    }
  };

  // Format setting value for display
  const formatSettingValue = (setting: Setting) => {
    if (setting.type === "json") {
      try {
        return JSON.stringify(setting.value).substring(0, 50) + "...";
      } catch {
        return String(setting.value);
      }
    } else if (setting.type === "boolean") {
      return setting.value ? "True" : "False";
    } else {
      return (
        String(setting.value).substring(0, 50) +
        (String(setting.value).length > 50 ? "..." : "")
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="user">User Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Manage global settings that apply to the entire system.
                  </CardDescription>
                </div>
                {user?.role === "admin" && (
                  <Button onClick={() => handleAddSetting("system")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Setting
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-4">{error}</div>
                ) : systemSettings.length === 0 ? (
                  <div className="text-center py-4">
                    No system settings found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemSettings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-medium">
                            {setting.key}
                          </TableCell>
                          <TableCell>{formatSettingValue(setting)}</TableCell>
                          <TableCell>{setting.type}</TableCell>
                          <TableCell>{setting.description}</TableCell>
                          <TableCell className="text-right">
                            {user?.role === "admin" && (
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleEditSetting("system", setting.id)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteSetting("system", setting.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Settings</CardTitle>
                  <CardDescription>
                    Manage your personal settings and preferences.
                  </CardDescription>
                </div>
                <Button onClick={() => handleAddSetting("user")}>
                  <Plus className="mr-2 h-4 w-4" /> Add Setting
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-4">{error}</div>
                ) : userSettings.length === 0 ? (
                  <div className="text-center py-4">
                    No user settings found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userSettings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-medium">
                            {setting.key}
                          </TableCell>
                          <TableCell>{formatSettingValue(setting)}</TableCell>
                          <TableCell>{setting.type}</TableCell>
                          <TableCell>{setting.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleEditSetting("user", setting.id)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteSetting("user", setting.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
