const firebaseConfig = {
  apiKey: "AIzaSyB-WLxU1J_6kYfB4zkTiQ1NtrLv6c-Mj5I",
  authDomain: "cougle.firebaseapp.com",
  databaseURL: "https://cougle-default-rtdb.firebaseio.com",
  projectId: "cougle",
  storageBucket: "cougle.appspot.com",
  messagingSenderId: "728051216283",
  appId: "1:728051216283:web:c8ac7eebab17e51cf7bb3e",
};
export default firebaseConfig;

import { KEYBOARD } from "../../global/global";
import { IKeyBoardEvent } from "./game-interface";

export const removeByAttr = function (arr: any, attr: any, value: any) {
  var i = arr.length;
  while (i--) {
    if (
      arr[i] &&
      arr[i].hasOwnProperty(attr) &&
      arguments.length > 2 &&
      arr[i][attr] === value
    ) {
      arr.splice(i, 1);
    }
  }
  return arr;
};

export const findDateDiff = (firstDate: number, today: number) => {
  var Difference_In_Time = today - firstDate;
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  return { Difference_In_Days, today };
};

export const isEvent = (object: any): object is IKeyBoardEvent => {
  if (
    object &&
    object.key &&
    typeof object.key === "string" &&
    object.keyCode &&
    typeof object.keyCode === "number"
  ) {
    return true;
  } else {
    return false;
  }
};

export const isValidChar = (event: IKeyBoardEvent) =>
  event.keyCode <= KEYBOARD.Z_KEY &&
  event.keyCode >= KEYBOARD.A_KEY &&
  event.key.match(/^[aA-zZ]$/);
