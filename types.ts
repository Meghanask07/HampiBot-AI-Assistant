
export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
}
