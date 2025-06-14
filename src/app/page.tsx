import PokerPoll from "@/features/poll/views/PokerPoll";
import Poll from "@/features/poll/views/Poll";
import PollRoom from "@/features/poll/views/PollRoom";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      {/* <Poll /> */}
      {/* <PokerPoll /> */}
      <PollRoom />
    </main>
  );
}
