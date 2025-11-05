import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HomeSectionForm from "@/components/home-sections/HomeSectionForm";
import {
  homeSectionService,
  type HomeSection,
} from "@/services/homeSectionService";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function EditHomeSectionPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [item, setItem] = useState<HomeSection | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await homeSectionService.getById(id);
        setItem(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to load";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload: HomeSection) => {
    if (!id) return;
    try {
      setSubmitting(true);
      await homeSectionService.update(id, payload);
      toast.success("Section updated");
      router.push("/dashboard/home-sections");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Update failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  if (!item)
    return (
      <DashboardLayout>
        <p>Not found</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <HomeSectionForm
        initialData={item}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </DashboardLayout>
  );
}
