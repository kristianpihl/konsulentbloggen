import { PageForm } from "@/components/admin/page-form";
import { createPage } from "@/app/admin/sider/actions";

export default function NewPagePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Ny side</h1>
      <div className="mt-8">
        <PageForm action={createPage} submitLabel="Opprett side" />
      </div>
    </div>
  );
}
