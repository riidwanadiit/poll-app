import dynamic from "next/dynamic";
import { Suspense } from "react";
// import PollRoom from "@/features/poll/views/PollRoom";

const PollRoom = dynamic(() => import("@/features/poll/views/PollRoom"), {
  ssr: false,
});

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="min-h-screen flex items-center justify-center p-8">
        <PollRoom />
      </main>
    </Suspense>
  );
}
