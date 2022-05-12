import { Database } from "@firebase/database";

export interface IGameInterface {
  db: Database;
  uid: string;
  setPlayToday: React.Dispatch<React.SetStateAction<boolean>>;
  playToday: boolean;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IKeyBoardEvent {
  readonly key: string;
  readonly keyCode: number;
}
