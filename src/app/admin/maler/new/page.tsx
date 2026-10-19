import { ResourceForm } from "@/components/admin/resource-form";
import { createResource } from "@/app/admin/maler/actions";

export default function NewResourcePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Ny mal eller verktøy</h1>
      <div className="mt-8">
        <ResourceForm action={createResource} submitLabel="Opprett" />
      </div>
    </div>
  );
}
