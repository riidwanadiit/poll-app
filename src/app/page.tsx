import dynamic from "next/dynamic";
import { Suspense } from "react";

const PollRoomNoSSR = dynamic(() => import("@/features/poll/views/PollRoom"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <PollRoomNoSSR />
      </Suspense>
    </main>
  );
}
