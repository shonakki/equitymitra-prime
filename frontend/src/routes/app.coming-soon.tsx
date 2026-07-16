import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/coming-soon")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      feature: (search.feature as string) || "",
    };
  },
  component: ComingSoonPage,
});

function ComingSoonPage() {
  const { feature } = Route.useSearch();
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-black text-white">Coming Soon</h1>
      <p className="mt-2 text-sm text-white/60">
        The {feature || "requested"} feature is not available in this region yet.
      </p>
    </div>
  );
}
