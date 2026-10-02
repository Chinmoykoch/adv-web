import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import BlogSection from "./components/BlogSection";

export const metadata: Metadata = {
  title: "Blogs | AdventureCarz",
  description: "Travel notes, fleet advice, and road trip inspiration from AdventureCarz.",
};

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <main className="py-12 sm:py-16">
          <BlogSection />
        </main>
      </div>
    </div>
  );
}
