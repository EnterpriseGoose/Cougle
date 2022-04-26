import { Firestore } from '@firebase/firestore';

export interface IScoreInterface {
  db: Firestore;
  uid: string;
  setPlayToday: React.Dispatch<React.SetStateAction<boolean>>;
  playToday: boolean;
  setIsFinished: React.Dispatch<React.SetStateAction<boolean>>;
}
