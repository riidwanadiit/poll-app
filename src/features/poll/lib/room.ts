import { v4 as uuidv4 } from "uuid"

export const createRoomId = () => uuidv4().slice(0, 6)

export const storeCreatedRoom = (roomId: string) => {
  localStorage.setItem("createdRoom", roomId)
}

export const isRoomCreator = (roomId: string) => {
  return localStorage.getItem("createdRoom") === roomId
}
