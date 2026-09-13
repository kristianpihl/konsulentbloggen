import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { updatePost } from "@/app/admin/actions";
import { getPostById } from "@/lib/posts";

export const revalidate = 0;

export default async function EditPostPage(props: PageProps<"/admin/[id]/edit">) {
  const { id } = await props.params;
  const post = await getPostById(id);

  if (!post) notFound();

  const action = updatePost.bind(null, id);

  return (
    <div>
      <h1 className="text-xl font-semibold">Rediger innlegg</h1>
      <div className="mt-8">
        <PostForm action={action} post={post} submitLabel="Lagre endringer" />
      </div>
    </div>
  );
}
