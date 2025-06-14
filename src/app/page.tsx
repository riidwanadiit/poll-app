'use client'

import ClientWrapper from "@/components/ClientWrapper";
import PollRoom from "@/features/poll/views/PollRoom";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <ClientWrapper Component={PollRoom} />
    </main>
  );
}
