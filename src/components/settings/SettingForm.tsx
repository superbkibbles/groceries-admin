import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Setting } from "@/services/settingService";

interface SettingFormProps {
  type: "system" | "user";
  initialData?: Setting;
  onSubmit: (data: Setting) => void;
  isLoading: boolean;
}

const SettingForm = ({
  type,
  initialData,
  onSubmit,
  isLoading,
}: SettingFormProps) => {
  const router = useRouter();
  const [settingType, setSettingType] = useState<string>(
    initialData?.type || "string"
  );
  const [jsonValue, setJsonValue] = useState<string>("");
  const [booleanValue, setBooleanValue] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      key: initialData?.key || "",
      description: initialData?.description || "",
      type: initialData?.type || "string",
      value: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("key", initialData.key);
      setValue("description", initialData.description);
      setValue("type", initialData.type);

      if (initialData.type === "json") {
        try {
          setJsonValue(JSON.stringify(initialData.value, null, 2));
        } catch {
          setJsonValue(String(initialData.value));
        }
      } else if (initialData.type === "boolean") {
        setBooleanValue(Boolean(initialData.value));
      } else {
        setValue("value", String(initialData.value));
      }
    }
  }, [initialData, setValue]);

  const handleTypeChange = (value: string) => {
    setSettingType(value);
    setValue("type", value);
  };

  const handleFormSubmit = (data: {
    key: string;
    description: string;
    type: string;
    value: string;
  }) => {
    let finalValue;

    switch (settingType) {
      case "number":
        finalValue = Number(data.value);
        break;
      case "boolean":
        finalValue = booleanValue;
        break;
      case "json":
        try {
          finalValue = JSON.parse(jsonValue);
        } catch {
          alert("Invalid JSON format");
          return;
        }
        break;
      default: // string
        finalValue = data.value;
    }

    onSubmit({
      ...data,
      value: finalValue,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit" : "Add"} {type === "system" ? "System" : "User"}{" "}
          Setting
        </CardTitle>
        <CardDescription>
          {type === "system"
            ? "Configure system-wide settings that apply to the entire application."
            : "Configure your personal settings and preferences."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              placeholder="setting.key.name"
              {...register("key", { required: "Key is required" })}
              disabled={!!initialData} // Disable key editing for existing settings
            />
            {errors.key && (
              <p className="text-red-500 text-sm">
                {errors.key.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={settingType}
              onValueChange={handleTypeChange}
              disabled={!!initialData} // Disable type editing for existing settings
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            {settingType === "string" && (
              <Input
                id="value"
                placeholder="Setting value"
                {...register("value", { required: "Value is required" })}
              />
            )}
            {settingType === "number" && (
              <Input
                id="value"
                type="number"
                placeholder="0"
                {...register("value", {
                  required: "Value is required",
                  valueAsNumber: true,
                })}
              />
            )}
            {settingType === "boolean" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="value-checkbox"
                  checked={booleanValue}
                  onCheckedChange={(checked) =>
                    setBooleanValue(checked as boolean)
                  }
                />
                <label
                  htmlFor="value-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {booleanValue ? "True" : "False"}
                </label>
              </div>
            )}
            {settingType === "json" && (
              <Textarea
                id="json-value"
                placeholder='{"key": "value"}'
                value={jsonValue}
                onChange={(e) => setJsonValue(e.target.value)}
                className="font-mono"
                rows={5}
              />
            )}
            {errors.value && (
              <p className="text-red-500 text-sm">
                {errors.value.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this setting is used for"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message as string}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SettingForm;
