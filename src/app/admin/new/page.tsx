import { PostForm } from "@/components/admin/post-form";
import { createPost } from "@/app/admin/actions";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Nytt innlegg</h1>
      <div className="mt-8">
        <PostForm action={createPost} submitLabel="Opprett innlegg" />
      </div>
    </div>
  );
}
