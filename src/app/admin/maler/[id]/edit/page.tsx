import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";
import { updateResource } from "@/app/admin/maler/actions";
import { getResourceById } from "@/lib/resources";

export const revalidate = 0;

export default async function EditResourcePage(
  props: PageProps<"/admin/maler/[id]/edit">,
) {
  const { id } = await props.params;
  const resource = await getResourceById(id);

  if (!resource) notFound();

  const action = updateResource.bind(null, id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Rediger</h1>
      <div className="mt-8">
        <ResourceForm
          action={action}
          resource={resource}
          submitLabel="Lagre endringer"
        />
      </div>
    </div>
  );
}
