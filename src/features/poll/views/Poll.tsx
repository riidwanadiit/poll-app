"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
import { Poll } from "../types";

const PollForm = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [poll, setPoll] = useState<Poll | null>(null);

  const handleVote = (optionId: string) => {
    if (!poll) return;
    const updated = {
      ...poll,
      options: poll.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
    };
    setPoll(updated);
  };

  const handleCreatePoll = () => {
    const filledOptions = options.filter((o) => o.trim() !== "");
    if (!question.trim() || filledOptions.length < 2) return;

    const newPoll: Poll = {
      question,
      options: filledOptions.map((o) => ({ id: uuidv4(), text: o, votes: 0 })),
    };
    setPoll(newPoll);
  };

  if (poll) {
    return (
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-bold">{poll.question}</h2>
        {poll.options.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <span>{option.text}</span>
            <Button onClick={() => handleVote(option.id)}>Vote</Button>
            <span>{option.votes} votes</span>
          </div>
        ))}
        <Button variant="secondary" onClick={() => setPoll(null)}>
          Create New Poll
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <Input
        placeholder="Poll question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      {options.map((opt, index) => (
        <Input
          key={index}
          placeholder={`Option ${index + 1}`}
          value={opt}
          onChange={(e) => {
            const updated = [...options];
            updated[index] = e.target.value;
            setOptions(updated);
          }}
        />
      ))}
      <Button onClick={() => setOptions([...options, ""])}>Add Option</Button>
      <Button onClick={handleCreatePoll}>Create Poll</Button>
    </Card>
  );
};

export default PollForm;
