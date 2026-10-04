import Navbar from "../components/Navbar";
import { getBlogPosts, getPage, getSiteSettings } from "../lib/queries";
import { defaultPageTitles, pageMetadata, pageSeoControls } from "../lib/site";
import BlogSection from "./components/BlogSection";

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("blogs")]);
  return pageMetadata({
    settings,
    title: page.seoTitle || defaultPageTitles["blogs"],
    description: page.seoDescription || settings.description,
    seo: pageSeoControls(page),
    path: "/blogs",
  });
}

export default async function BlogsPage() {
  const [posts, page] = await Promise.all([getBlogPosts(), getPage("blogs")]);
  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <main className="py-12 sm:py-16">
          <BlogSection posts={posts} eyebrow={page.eyebrow} heading={page.heading} />
        </main>
      </div>
    </div>
  );
}
