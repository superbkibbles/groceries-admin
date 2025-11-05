import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { HomeSection } from "@/services/homeSectionService";

type Props = {
  initialData?: HomeSection;
  onSubmit: (payload: HomeSection) => Promise<void> | void;
  submitting?: boolean;
};

export default function HomeSectionForm({
  initialData,
  onSubmit,
  submitting,
}: Props) {
  const [form, setForm] = useState<HomeSection>(
    initialData ??
      ({
        type: "products",
        title: { en: "", ar: "" },
        order: 1,
        active: true,
        product_ids: [],
      } as HomeSection)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const isProducts = useMemo(() => form.type === "products", [form.type]);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(
      (prev) =>
        ({
          ...prev,
          [name]:
            type === "number"
              ? Number(value)
              : type === "checkbox"
              ? checked
              : value,
        } as HomeSection)
    );
  };

  const handleTitleChange =
    (lang: "en" | "ar") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm(
        (prev) =>
          ({ ...prev, title: { ...prev.title, [lang]: value } } as HomeSection)
      );
    };

  const handleIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // name = product_ids | category_ids
    const ids = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    setForm((prev) => {
      if (name === "product_ids" && prev.type === "products") {
        return { ...prev, product_ids: ids } as HomeSection;
      }
      if (name === "category_ids" && prev.type === "categories") {
        return { ...prev, category_ids: ids } as HomeSection;
      }
      return prev;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title?.en?.trim()) next["title.en"] = "English title required";
    if (!form.title?.ar?.trim()) next["title.ar"] = "Arabic title required";
    if (typeof form.order !== "number" || Number.isNaN(form.order))
      next.order = "Order must be a number";
    if (
      form.type === "products" &&
      (!form.product_ids || form.product_ids.length === 0)
    )
      next.product_ids = "At least one product id";
    if (
      form.type === "categories" &&
      (!form.category_ids || form.category_ids.length === 0)
    )
      next.category_ids = "At least one category id";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors");
      return;
    }
    await onSubmit(form);
  };

  const idsValue = isProducts
    ? (form.type === "products" ? form.product_ids || [] : []).join(", ")
    : (form.type === "categories" ? form.category_ids || [] : []).join(", ");

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {initialData?.id ? "Edit Home Section" : "Add Home Section"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) =>
                    (v as "products" | "categories") === "products"
                      ? {
                          id: p.id,
                          type: "products",
                          title: p.title,
                          order: p.order,
                          active: p.active,
                          product_ids:
                            p.type === "products" ? p.product_ids || [] : [],
                        }
                      : {
                          id: p.id,
                          type: "categories",
                          title: p.title,
                          order: p.order,
                          active: p.active,
                          category_ids:
                            p.type === "categories" ? p.category_ids || [] : [],
                        }
                  )
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="categories">Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={form.order}
                onChange={handleBasicChange}
              />
              {errors.order && (
                <p className="text-sm text-destructive">{errors.order}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (EN)</Label>
              <Input
                id="title_en"
                value={form.title?.en || ""}
                onChange={handleTitleChange("en")}
              />
              {errors["title.en"] && (
                <p className="text-sm text-destructive">{errors["title.en"]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_ar">Title (AR)</Label>
              <Input
                id="title_ar"
                value={form.title?.ar || ""}
                onChange={handleTitleChange("ar")}
              />
              {errors["title.ar"] && (
                <p className="text-sm text-destructive">{errors["title.ar"]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ids">
              {isProducts
                ? "Product IDs (comma-separated)"
                : "Category IDs (comma-separated)"}
            </Label>
            <Input
              id="ids"
              name={isProducts ? "product_ids" : "category_ids"}
              value={idsValue}
              onChange={handleIdsChange}
              placeholder={isProducts ? "64f..., 64a..." : "64c..., 64b..."}
            />
            {errors.product_ids && isProducts && (
              <p className="text-sm text-destructive">{errors.product_ids}</p>
            )}
            {errors.category_ids && !isProducts && (
              <p className="text-sm text-destructive">{errors.category_ids}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={!!form.active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, active: !!v }))}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="submit" disabled={!!submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
