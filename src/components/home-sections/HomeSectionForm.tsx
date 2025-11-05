import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
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
import productService, { type Product } from "@/services/productService";
import categoryService, { type Category } from "@/services/categoryService";

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
  const router = useRouter();
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
  // Options for searchable multi-selects
  const [productOptions, setProductOptions] = useState<
    Array<Pick<Product, "id" | "name">>
  >([]);
  const [productSearch, setProductSearch] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<
    Array<Pick<Category, "id" | "name">>
  >([]);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const isProducts = useMemo(() => form.type === "products", [form.type]);

  // Load products on search
  useEffect(() => {
    let cancelled = false;
    if (!isProducts) return;
    (async () => {
      try {
        const res = await productService.getProducts({
          search: productSearch,
          limit: 20,
        });
        const list = res?.data ?? res; // backend may return {data: Product[]} or Product[]
        const items: Product[] = Array.isArray(list) ? list : [];
        if (!cancelled)
          setProductOptions(items.map((p) => ({ id: p.id, name: p.name })));
      } catch {
        if (!cancelled) setProductOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isProducts, productSearch]);

  // When switching back to products, reset search to fetch a fresh list
  useEffect(() => {
    if (isProducts) {
      setProductSearch("");
    }
  }, [isProducts]);

  // Load categories once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await categoryService.getCategories();
        const list: unknown = res?.data ?? res;
        const items: Category[] = Array.isArray(list) ? list : [];
        if (!cancelled)
          setCategoryOptions(items.map((c) => ({ id: c.id, name: c.name })));
      } catch {
        if (!cancelled) setCategoryOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  // legacy single-line input handler removed (now using multi-selects)

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

  const selectedIds = isProducts
    ? form.type === "products"
      ? form.product_ids || []
      : []
    : form.type === "categories"
    ? form.category_ids || []
    : [];

  const toggleSelect = (id: string) => {
    if (isProducts && form.type === "products") {
      const next = new Set(form.product_ids || []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setForm({ ...form, product_ids: Array.from(next) });
      return;
    }
    if (!isProducts && form.type === "categories") {
      const next = new Set(form.category_ids || []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setForm({ ...form, category_ids: Array.from(next) });
    }
  };

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

          <div className="space-y-2" key={form.type}>
            <Label>{isProducts ? "Products" : "Categories"}</Label>
            {isProducts ? (
              <div className="space-y-2">
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <div className="max-h-56 overflow-auto rounded border">
                  {(productOptions || []).map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0"
                    >
                      <Checkbox
                        id={`prod-${p.id}`}
                        checked={selectedIds.includes(p.id)}
                        onCheckedChange={() => toggleSelect(p.id)}
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                  {!productOptions?.length && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No products
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                <div className="max-h-56 overflow-auto rounded border">
                  {(categoryOptions || [])
                    .filter((c) =>
                      categorySearch
                        ? c.name
                            .toLowerCase()
                            .includes(categorySearch.toLowerCase())
                        : true
                    )
                    .map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0"
                      >
                        <Checkbox
                          id={`cat-${c.id}`}
                          checked={selectedIds.includes(c.id)}
                          onCheckedChange={() => toggleSelect(c.id)}
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    ))}
                  {!categoryOptions?.length && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No categories
                    </div>
                  )}
                </div>
              </div>
            )}
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={!!submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
