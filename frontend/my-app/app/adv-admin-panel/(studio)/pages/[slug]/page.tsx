import { notFound } from "next/navigation";
import PageEditor from "../../../components/PageEditor";
import { pageDefinitions, type PageKey } from "../../../lib/content";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.hasOwn(pageDefinitions, slug)) notFound();
  return <PageEditor key={slug} page={slug as PageKey} />;
}
