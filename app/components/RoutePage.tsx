import Navbar from "./Navbar";

type RoutePageProps = {
  title: string;
  description: string;
};

export default function RoutePage({ title, description }: RoutePageProps) {
  return (
    <div className="min-h-screen bg-tertiary px-5 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <main className="px-3 py-20 sm:px-5 sm:py-28">
          <h1 className="text-4xl sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-secondary/80">{description}</p>
        </main>
      </div>
    </div>
  );
}
