'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CARD_VALUES = ["1", "2", "3", "5", "8", "13", "?"]

type Vote = {
  user: string
  value: string
}

const PokerPoll = () => {
  const [question, setQuestion] = useState("")
  const [showForm, setShowForm] = useState(true)
  const [votes, setVotes] = useState<Vote[]>([])
  const [showResults, setShowResults] = useState(false)
  const [currentUser, setCurrentUser] = useState("")
  const [hasVoted, setHasVoted] = useState(false)

  const startPoll = () => {
    if (question.trim()) {
      setShowForm(false)
    }
  }

  const castVote = (value: string) => {
    if (!currentUser.trim()) return
    const alreadyVoted = votes.find(v => v.user === currentUser)
    if (alreadyVoted) return

    setVotes(prev => [...prev, { user: currentUser.trim(), value }])
    setHasVoted(true)
  }

  const nextVoter = () => {
    setCurrentUser("")
    setHasVoted(false)
  }

  const resetPoll = () => {
    setQuestion("")
    setVotes([])
    setCurrentUser("")
    setShowForm(true)
    setShowResults(false)
    setHasVoted(false)
  }

  return showForm ? (
    <Card className="p-6 space-y-4 max-w-md w-full">
      <h2 className="text-xl font-semibold">Create Poker Poll</h2>
      <Input
        placeholder="Enter task or question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <Button onClick={startPoll} disabled={!question.trim()}>
        Start Poll
      </Button>
    </Card>
  ) : showResults ? (
    <Card className="p-6 space-y-4 max-w-md w-full">
      <h2 className="font-bold text-lg mb-2">{question}</h2>
      <h3 className="font-medium mb-2">Results:</h3>
      {votes.map((v, idx) => (
        <div key={idx} className="flex justify-between">
          <span>{v.user}</span>
          <span className="font-bold">{v.value}</span>
        </div>
      ))}
      <Button variant="secondary" onClick={resetPoll}>
        Start New Poll
      </Button>
    </Card>
  ) : (
    <Card className="p-6 space-y-4 max-w-md w-full">
      <h2 className="font-bold text-lg">{question}</h2>

      {!hasVoted ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
            />
          </div>

          {currentUser.trim() && (
            <>
              <p className="mt-4">Select your vote:</p>
              <div className="flex flex-wrap gap-3">
                {CARD_VALUES.map((val) => (
                  <Button key={val} onClick={() => castVote(val)}>
                    {val}
                  </Button>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <p>
            ✅ Thank you, <strong>{currentUser}</strong>! Your vote has been recorded.
          </p>
          <Button onClick={nextVoter}>Next Voter</Button>
          <Button variant="outline" onClick={() => setShowResults(true)}>
            Reveal Results
          </Button>
        </div>
      )}
    </Card>
  )
}

export default PokerPoll
