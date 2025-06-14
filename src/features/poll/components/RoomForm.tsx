"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ref, set, get } from "firebase/database";
import { database as db } from "@lib/firebase";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const RoomForm = () => {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [roomNameError, setRoomNameError] = useState("");
  const [roomPasswordJoin, setRoomPasswordJoin] = useState("");
  const [roomToJoin, setRoomToJoin] = useState("");

  const router = useRouter();

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleSubmitCreateRoom = async () => {
    if (!roomName.trim()) {
      setRoomNameError("Room Name is required");
      return;
    }

    setRoomNameError("");

    const newRoomId = uuidv4().slice(0, 6);
    localStorage.setItem("createdRoom", newRoomId);

    await set(ref(db, `rooms/${newRoomId}`), {
      createdAt: Date.now(),
      name: roomName,
      password: roomPassword,
      members: {},
      votes: {},
      revealed: false,
      question: "",
    });

    Cookies.set("poker_room", newRoomId);
    Cookies.set("poker_role", "creator");

    setShowCreateModal(false);
    setRoomName("");
    setRoomPassword("");
    router.push(`/?room=${newRoomId}`);
  };

  const handleJoinRoom = async () => {
    if (!roomIdInput.trim()) {
      setError("Room ID is required");
      return;
    }

    const roomRef = ref(db, `rooms/${roomIdInput.trim()}`);

    try {
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError("Room not found");
        return;
      }

      const roomData = snapshot.val();
      const hasPassword = roomData.password && roomData.password.trim() !== "";

      if (hasPassword) {
        setRoomToJoin(roomIdInput.trim());
        setShowPasswordModal(true);
      } else {
        Cookies.set("poker_room", roomIdInput.trim());
        Cookies.set("poker_role", "guest");
        router.push(`/?room=${roomIdInput.trim()}`);
      }
    } catch (err) {
      console.error(err);
      setError("Error while trying to join room");
    }
  };

  const handlePasswordSubmit = async () => {
    const roomRef = ref(db, `rooms/${roomToJoin}`);

    try {
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError("Room not found");
        setShowPasswordModal(false);
        return;
      }

      const roomData = snapshot.val();

      if (roomData.password !== roomPasswordJoin.trim()) {
        setError("Incorrect password");
        return;
      }

      Cookies.set("poker_room", roomToJoin);
      Cookies.set("poker_role", "guest");
      router.push(`/?room=${roomToJoin}`);
    } catch (err) {
      console.error(err);
      setError("Failed to verify password");
    }
  };

  return (
    <Card className="px-5">
      <h3 className="font-medium text-center">Welcome to Poll App</h3>
      <div className="space-y-4 max-w-sm w-full mx-auto">
        <Button className="w-full" onClick={handleCreateRoom}>
          ➕ Create Room
        </Button>

        <p className="text-center">or</p>

        <div className="flex gap-2">
          <Input
            placeholder="Enter Room ID"
            value={roomIdInput}
            onChange={(e) => {
              setRoomIdInput(e.target.value);
              setError("");
            }}
            autoComplete="off"
          />
          <Button onClick={handleJoinRoom}>Join</Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Create Room Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Input
                  placeholder="Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  autoComplete="off"
                />
                {roomNameError && (
                  <p className="text-sm text-red-500">{roomNameError}</p>
                )}
              </div>
              <Input
                type="text"
                placeholder="Password (optional)"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setRoomName("");
                  setRoomPassword("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitCreateRoom}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Join Room Password Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Room Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={roomPasswordJoin}
                onChange={(e) => {
                  setRoomPasswordJoin(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <DialogFooter className="pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPasswordModal(false);
                  setRoomPasswordJoin("");
                  setError("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handlePasswordSubmit}>Join</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default RoomForm;
