import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  homeSectionService,
  type HomeSection,
} from "@/services/homeSectionService";
import { toast } from "sonner";

export default function HomeSectionsListPage() {
  const [items, setItems] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await homeSectionService.list();
      setItems(data);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to load sections";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this section?")) return;
    try {
      await homeSectionService.remove(id);
      toast.success("Deleted");
      load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Delete failed";
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Home Sections</CardTitle>
        <Button asChild>
          <Link href="/dashboard/home-sections/add">Add Section</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.type}</TableCell>
                  <TableCell>{s.title?.en}</TableCell>
                  <TableCell>{s.order}</TableCell>
                  <TableCell>{s.active ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" asChild size="sm">
                      <Link href={`/dashboard/home-sections/edit/${s.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(s.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
