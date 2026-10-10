import { notFound } from "next/navigation";
import CollectionEditor from "../../components/CollectionEditor";
import GoogleReviewsManager from "../../components/GoogleReviewsManager";
import { collections, type CollectionKey } from "../../lib/content";

export default async function CollectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!Object.hasOwn(collections, section)) notFound();
  return <><CollectionEditor key={section} collection={section as CollectionKey} />{section === "testimonials" && <GoogleReviewsManager />}</>;
}
