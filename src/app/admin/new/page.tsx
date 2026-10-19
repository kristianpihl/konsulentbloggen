import { PostForm } from "@/components/admin/post-form";
import { createPost } from "@/app/admin/actions";
import { getResourceLinkOptions } from "@/lib/resources";

export const revalidate = 0;

export default async function NewPostPage() {
  const resourceOptions = await getResourceLinkOptions();

  return (
    <div>
      <h1 className="text-xl font-semibold">Nytt innlegg</h1>
      <div className="mt-8">
        <PostForm
          action={createPost}
          submitLabel="Opprett innlegg"
          resourceOptions={resourceOptions}
        />
      </div>
    </div>
  );
}
