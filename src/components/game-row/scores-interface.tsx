import { Database } from "@firebase/database";

export interface IScoreInterface {
  db: Database;
  uid: string;
  setPlayToday: React.Dispatch<React.SetStateAction<boolean>>;
  playToday: boolean;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
}
