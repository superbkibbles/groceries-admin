import { useRouter } from "next/router";
import { useState } from "react";
import HomeSectionForm from "@/components/home-sections/HomeSectionForm";
import {
  homeSectionService,
  type HomeSection,
} from "@/services/homeSectionService";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function AddHomeSectionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload: HomeSection) => {
    try {
      setSubmitting(true);
      await homeSectionService.create(payload);
      toast.success("Section created");
      router.push("/dashboard/home-sections");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Create failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <HomeSectionForm onSubmit={handleSubmit} submitting={submitting} />
    </DashboardLayout>
  );
}
