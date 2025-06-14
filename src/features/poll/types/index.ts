export type PollOption = {
  id: string
  text: string
  votes: number
}

export type Poll = {
  question: string
  options: PollOption[]
}
