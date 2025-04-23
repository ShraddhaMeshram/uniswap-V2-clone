"use client";

import dynamic from "next/dynamic";

const HomeDashboard = dynamic(() => import("@/src/components/HomeDashboard"), {
  ssr: false,
  loading: () => <p className="text-center mt-12">Loading UI...</p>,
});

export default function ClientOnlyPage() {
  return <HomeDashboard />;
}
