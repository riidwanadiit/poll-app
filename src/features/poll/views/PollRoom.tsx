"use client";

import { useRouter, useSearchParams } from "next/navigation";

import React, { useEffect } from "react";
import PokerRoom from "../components/PokerRoom";
import RoomForm from "../components/RoomForm";
import Cookies from "js-cookie";

const PollRoom = () => {
  const params = useSearchParams();
  const roomId = params.get("room");
  const router = useRouter();

  const storedRoom = Cookies.get("poker_room");

  useEffect(() => {
    if (storedRoom) {
      router.push(`/?room=${storedRoom}`);
    }
  }, [storedRoom, router]);

  return <div>{roomId ? <PokerRoom /> : <RoomForm />}</div>;
};

export default PollRoom;
