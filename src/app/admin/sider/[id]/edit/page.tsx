import { notFound } from "next/navigation";
import { PageForm } from "@/components/admin/page-form";
import { updatePage } from "@/app/admin/sider/actions";
import { getPageById } from "@/lib/pages";

export const revalidate = 0;

export default async function EditPagePage(
  props: PageProps<"/admin/sider/[id]/edit">,
) {
  const { id } = await props.params;
  const page = await getPageById(id);

  if (!page) notFound();

  const action = updatePage.bind(null, id);

  return (
    <div>
      <h1 className="text-xl font-semibold">Rediger side</h1>
      <div className="mt-8">
        <PageForm action={action} page={page} submitLabel="Lagre endringer" />
      </div>
    </div>
  );
}
