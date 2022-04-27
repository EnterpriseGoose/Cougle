import { Database } from "firebase/database";

export interface ILeaderboard {
  readonly uid: string;
  readonly db: Database;
}
