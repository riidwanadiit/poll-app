"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { database as db } from "@lib/firebase";
import { ref, set, onValue, remove, get, update } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { Lock } from "lucide-react";

const DEFAULT_CARDS = ["1", "2", "3", "5", "8", "11", "13"];

const PokerRoom = () => {
  const params = useSearchParams();
  const roomId = params.get("room") || "";
  const router = useRouter();

  const storedName = Cookies.get("poker_name");
  const storedRole = Cookies.get("poker_role");

  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [vote, setVote] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [cardValues, setCardValues] = useState<string[]>(DEFAULT_CARDS);
  const [customCardInput, setCustomCardInput] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isEditCard, setIsEditCard] = useState(false);
  const [roomPassword, setRoomPassword] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [roomName, setRoomName] = useState("");

  // Quit
  const handleQuit = async () => {
    // if (!roomId || !name) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const membersRef = ref(db, `rooms/${roomId}/members`);

    if (isCreator) {
      // Get all members
      const membersSnapshot = await get(membersRef);
      const membersData = membersSnapshot.val();

      if (membersData) {
        const memberNames = Object.keys(membersData);
        // Remove each member
        await Promise.all(
          memberNames.map((memberName) =>
            remove(ref(db, `rooms/${roomId}/members/${memberName}`))
          )
        );
      }

      // Finally, delete the entire room
      await remove(roomRef);
    } else {
      // Just remove the member
      await remove(ref(db, `rooms/${roomId}/members/${name}`));
    }

    // Clean up cookies and redirect
    Cookies.remove("poker_name");
    Cookies.remove("poker_room");
    Cookies.remove("poker_role");

    router.replace("/");
  };
  
  // Check if room exists in Firebase
  const checkRoomExists = async () => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
      alert("Room does not exist");
      handleQuit(); // quit handler cleans cookies and redirects
      return;
    }
  };

  // Join room (add to members)
  const handleJoin = async () => {
    checkRoomExists();

    if (!name.trim() || !roomId) return;

    const memberRef = ref(db, `rooms/${roomId}/members/${name}`);

    // Check if the name already exists
    const snapshot = await get(memberRef);
    if (snapshot.exists()) {
      alert("This name is already in use. Please choose another one.");
      return;
    }

    // Otherwise, add the user to members
    await set(memberRef, true);

    Cookies.set("poker_name", name);
    Cookies.set("poker_room", roomId);
    Cookies.set("poker_role", "member");

    setHasJoined(true);
  };

  // Cast vote
  const handleVote = async (value: string) => {
    checkRoomExists();
    if (!name || !roomId || revealed) return;
    await set(ref(db, `rooms/${roomId}/votes/${name}`), value);
    setVote(value);
  };

  // Set question (creator only)
  const handleSetQuestion = async (q: string) => {
    checkRoomExists();
    setQuestion(q);
    await set(ref(db, `rooms/${roomId}/question`), q);
  };

  // Reveal results (creator only)
  const handleReveal = async () => {
    checkRoomExists();
    await set(ref(db, `rooms/${roomId}/revealed`), true);
  };

  // Reset poll (creator only)
  const handleReset = async () => {
    checkRoomExists();
    await update(ref(db, `rooms/${roomId}`), {
      votes: null, // Clear all votes
      revealed: false, // Hide results
      // question is preserved!
    });
  };

  //   Kick Member
  const handleKick = async (memberName: string) => {
    checkRoomExists();
    if (!roomId) return;
    if (!isCreator) return;
    if (memberName === name) return; // creator cannot kick themselves

    await remove(ref(db, `rooms/${roomId}/members/${memberName}`));
  };

  const handleSetCardValues = async () => {
    checkRoomExists();
    const values = customCardInput
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length > 0) {
      await update(ref(db, `rooms/${roomId}`), { cardValues: values }).then(
        () => setCustomCardInput("")
      );
    }
  };

  const handleUpdatePassword = async () => {
    checkRoomExists();
    if (!roomId) return;

    const trimmed = newPassword.trim();

    // Update password (empty string means remove)
    await update(ref(db, `rooms/${roomId}`), {
      password: trimmed || null,
    });

    setIsEditingPassword(false);
    setNewPassword("");
    if (newPassword == "") {
      setRoomPassword(null);
    }
  };

  useEffect(() => {
    checkRoomExists();

    // if (!roomId) {
    //   alert("Room does not exist");
    //   Cookies.remove("poker_name");
    //   Cookies.remove("poker_room");
    //   Cookies.remove("poker_role");
    //   router.replace("/");
    //   return;
    // }

    // checkRoomExists();
  }, [roomId, router]);

  useEffect(() => {
    if (storedName) setName(storedName);
    if (storedRole === "creator") {
      setIsCreator(true);
    }
    if (storedName && storedRole) {
      setHasJoined(true);
    }
  }, [storedName, storedRole]);

  useEffect(() => {
    if (!roomId) return;

    const membersRef = ref(db, `rooms/${roomId}/members`);
    const votesRef = ref(db, `rooms/${roomId}/votes`);
    const revealedRef = ref(db, `rooms/${roomId}/revealed`);
    const questionRef = ref(db, `rooms/${roomId}/question`);
    const cardsRef = ref(db, `rooms/${roomId}/cardValues`);
    const passwordRef = ref(db, `rooms/${roomId}/password`); // <-- add this

    onValue(membersRef, (snapshot) => {
      setMembers(Object.keys(snapshot.val() || {}));
    });

    onValue(votesRef, (snapshot) => {
      setVotes(snapshot.val() || {});
    });

    onValue(revealedRef, (snapshot) => {
      setRevealed(!!snapshot.val());
    });

    onValue(questionRef, (snapshot) => {
      setQuestion(snapshot.val() || "");
    });

    onValue(cardsRef, (snapshot) => {
      const val = snapshot.val();
      if (val && Array.isArray(val)) {
        setCardValues(val);
      } else {
        setCardValues(DEFAULT_CARDS);
      }
    });

    // Get password
    onValue(passwordRef, (snapshot) => {
      const val = snapshot.val();
      setRoomPassword(val ?? null);
    });

    // Check if creator
    if (name) {
      const creatorRef = ref(db, `rooms/${roomId}/creator`);
      get(creatorRef).then((snap) => {
        if (snap.exists() && snap.val() === name) {
          setIsCreator(true);
          Cookies.set("poker_role", "creator");
          setHasJoined(true);
        }
      });
    }
  }, [roomId, name]);

  useEffect(() => {
    if (!revealed && name && !votes[name]) {
      setVote("");
    }
  }, [revealed, votes, name]);

  // Detect if removed
  useEffect(() => {
    if (!roomId || !name || !hasJoined) return;
    const memberRef = ref(db, `rooms/${roomId}/members/${name}`);
    const unsubscribe = onValue(memberRef, (snapshot) => {
      if (!snapshot.exists()) {
        Cookies.remove("poker_name");
        Cookies.remove("poker_room");
        Cookies.remove("poker_role");
        router.replace("/");
      }
    });
    return () => unsubscribe();
  }, [roomId, name, hasJoined]);

  // Load room state
  useEffect(() => {
    if (!roomId) return;

    const membersRef = ref(db, `rooms/${roomId}/members`);
    const votesRef = ref(db, `rooms/${roomId}/votes`);
    const revealedRef = ref(db, `rooms/${roomId}/revealed`);
    const questionRef = ref(db, `rooms/${roomId}/question`);
    const cardsRef = ref(db, `rooms/${roomId}/cardValues`);

    onValue(membersRef, (snapshot) => {
      setMembers(Object.keys(snapshot.val() || {}));
    });

    onValue(votesRef, (snapshot) => {
      setVotes(snapshot.val() || {});
    });

    onValue(revealedRef, (snapshot) => {
      setRevealed(!!snapshot.val());
    });

    onValue(questionRef, (snapshot) => {
      setQuestion(snapshot.val() || "");
    });

    onValue(cardsRef, (snapshot) => {
      const val = snapshot.val();
      if (val && Array.isArray(val)) {
        setCardValues(val);
      } else {
        setCardValues(DEFAULT_CARDS);
      }
    });

    // Check if creator
    if (name) {
      const creatorRef = ref(db, `rooms/${roomId}/creator`);
      get(creatorRef).then((snap) => {
        if (snap.exists() && snap.val() === name) {
          setIsCreator(true);
          Cookies.set("poker_role", "creator");
          setHasJoined(true);
        }
      });
    }
  }, [roomId, name]);

  useEffect(() => {
    if (!roomId) return;

    const roomNameRef = ref(db, `rooms/${roomId}/roomName`);
    onValue(roomNameRef, (snapshot) => {
      setRoomName(snapshot.val() || "");
    });
  }, [roomId]);

  return (
    <div>
      <Card className="p-6 space-y-4 w-[90vw] mx-auto">
        <div>
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold text-lg flex gap-3 items-center">
                Room: {roomName} ({roomId})
              </h2>

              <h2 className="font-bold text-lg flex gap-3 items-center">
                Password:{" "}
                {isEditingPassword ? (
                  <div className="flex gap-2 items-center font-medium text-sm">
                    <Input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-[150px]"
                    />
                    <Button
                      onClick={handleUpdatePassword}
                      className="px-3 py-1 text-xs"
                      variant="default"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setNewPassword("");
                      }}
                      className="px-3 py-1 text-xs"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {roomPassword ? (
                      <span className="">
                        {roomPassword} <Lock className="inline" width={12} />
                      </span>
                    ) : (
                      "-"
                    )}
                    {isCreator && (
                      <Button
                        onClick={() => setIsEditingPassword(true)}
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 "
                      >
                        Edit
                      </Button>
                    )}
                    {isCreator && roomPassword && (
                      <Button
                        onClick={async () => {
                          await update(ref(db, `rooms/${roomId}`), {
                            password: null,
                          });
                          setRoomPassword(null);
                        }}
                        size="sm"
                        variant="destructive"
                        className="text-xs px-2"
                      >
                        Delete
                      </Button>
                    )}
                  </span>
                )}
              </h2>
            </div>
            <Button
              onClick={handleQuit}
              variant="destructive"
              className="cursor-pointer"
            >
              Quit Room
            </Button>
          </div>
          <h4 className="font-semibold mt-2">{isCreator ? "Admin" : name}</h4>
        </div>

        {/* Creator Controls */}
        {isCreator && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Poll Title</Label>
                <Input
                  placeholder="Enter poll title"
                  value={question}
                  onChange={(e) => handleSetQuestion(e.target.value)}
                  className="mb-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cards">Cards</Label>

                {isEditCard ? (
                  <div className="flex w-full items-center gap-2">
                    <Input
                      id="cards"
                      value={customCardInput}
                      defaultValue={cardValues.join(", ")}
                      onChange={(e) => setCustomCardInput(e.target.value)}
                      placeholder="e.g. 1,2,3,5,8,13"
                      className="grow"
                    />
                    <Button
                      onClick={() => {
                        handleReset();
                        handleSetCardValues();
                        setIsEditCard(false);
                      }}
                      className="min-w-[200px]"
                    >
                      Update Cards
                    </Button>
                  </div>
                ) : (
                  <div className="flex w-full items-center gap-2">
                    <Input
                      value={cardValues.join(", ")}
                      className="grow disabled:text-foreground"
                      disabled
                    />
                    <Button
                      onClick={() => setIsEditCard(true)}
                      className="min-w-[200px]"
                    >
                      Edit Card
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              {revealed ? (
                <Button
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              ) : (
                <Button
                  onClick={handleReveal}
                  disabled={Object.keys(votes).length === 0}
                  className="w-full cursor-pointer"
                >
                  Reveal
                </Button>
              )}
            </div>
          </>
        )}

        {/* Joiners enter name */}
        {!hasJoined && !isCreator && (
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleJoin();
                }
              }}
              placeholder="Enter your name"
            />
            <Button
              className="mt-2"
              onClick={handleJoin}
              disabled={!name.trim()}
            >
              Join Room
            </Button>
          </div>
        )}

        {/* Show question */}
        {!isCreator && question && (
          <p className="text-muted-foreground font-bold text-3xl">
            📌 {question}
          </p>
        )}

        {/* Vote UI */}
        {hasJoined && !isCreator && !revealed && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Select your card (you can change before reveal):
            </p>
            <div className="flex flex-wrap gap-2">
              {cardValues.map((val) => (
                <Button
                  key={val}
                  variant={votes[name] === val ? "default" : "outline"}
                  onClick={() => handleVote(val)}
                  className="cursor-pointer w-[75px] h-auto aspect-[3/4]"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Vote confirmation */}
        {vote && !revealed && (
          <p className="text-green-700 font-medium">
            ✅ Vote recorded as <strong>{vote}</strong>
          </p>
        )}

        {/* Member List + Results */}
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Members</h3>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {members.map((member) => (
                <Card key={member} className="relative">
                  {isCreator && member !== name && (
                    <Button
                      variant="destructive"
                      className="p-0 w-[20px] h-[20px] text-[10px] absolute right-2 top-2 cursor-pointer"
                      aria-label={`Kick ${member}`}
                      onClick={() => handleKick(member)}
                    >
                      X
                    </Button>
                  )}

                  <h4 className="text-center font-semibold">{member}</h4>
                  <div className="w-full min-h-[7rem] flex items-center justify-center">
                    {revealed && votes[member] ? (
                      <span className="font-bold text-5xl">
                        {votes[member]}
                      </span>
                    ) : votes[member] ? (
                      <span className="text-green-600 text-4xl">✅</span>
                    ) : (
                      <span className="text-muted-foreground text-4xl">🕒</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PokerRoom;
