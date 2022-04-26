import { useEffect } from "react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import {
  ANIMATIONS,
  KEYBOARD,
  KEY_STATE,
  MESSAGE,
  SETTING
} from "../../global/global";
import { gameWords } from "../../global/game-words";
import { answerWords } from "../../global/answer-words";
import { chathamWords } from "../../global/chatham-words";
import {
  findDateDiff,
  isEvent,
  isValidChar,
  removeByAttr
} from "./game-row-helper";
import { IKeyBoardEvent } from "./game-row-interface";
import { IScoreInterface } from "./scores-interface";
import { getDoc, doc, updateDoc, increment } from "@firebase/firestore";

var words = gameWords;

async function getLatestPlay(props: IScoreInterface, date = new Date()) {
  const { db, uid } = props;
  if (!uid) return;
  const previousMonday = new Date();

  previousMonday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const ref = doc(db, "users", uid);
  const docSnap = await getDoc(ref);
  const lastPlayed = docSnap.get("lastPlayed");
  const lastWeekPlayed = docSnap.get("lastWeekPlayed");
  const thisWeek = Math.floor(
    (Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    ) -
      Date.UTC(new Date().getFullYear(), 0, 3)) /
      1000 /
      60 /
      60 /
      24 /
      7
  );
  if (lastPlayed && lastWeekPlayed && lastWeekPlayed !== thisWeek) {
    var yesterday = new Date(previousMonday);
    yesterday.setDate(date.getDate() - 1);
    await updateDoc(ref, {
      week: 0,
      lastWeekPlayed: thisWeek,
      lastPlayed: yesterday.setHours(0, 0, 0, 0).toString(),
      lastLoggedIn: previousMonday.setHours(0, 0, 0, 0).toString()
    });
    /*await updateDoc(doc(db, 'data', 'leaderboard'), {
      [uid]: {
        name: docSnap.get('name'),
        week: 0,
        lastPlayed: yesterday.setHours(0, 0, 0, 0).toString(),
      },
    });*/
    return previousMonday;
  } else {
    return lastPlayed;
  }
}

async function addScore(
  props: IScoreInterface,
  tryCount: number,
  setFinish: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { db, uid } = props;
  if (!uid) return;
  const ref = doc(db, "users", uid);
  const docSnap = await getDoc(ref);
  const lastPlayed = docSnap.get("lastPlayed");
  //if already played today, don't add
  if (lastPlayed) {
    if (new Date().setHours(0, 0, 0, 0) === parseInt(lastPlayed, 10)) {
      setFinish(true);
      return;
    }

    //add new score, you just played yourself, so add score
    if (tryCount + 1 === 1) {
      alert(
        "You're either really lucky or you cheated, if you cheated don't do that again."
      );
    }
    const todayDate = new Date().toString();
    const dateoftheday = new Date(todayDate).setHours(0, 0, 0, 0);
    if (tryCount + 1 > 0) {
      await updateDoc(ref, {
        week: increment(tryCount + 1),
        lastPlayed: dateoftheday.toString(),
        lastLoggedIn: dateoftheday.toString()
      });
      /*(await updateDoc(doc(db, 'data', 'leaderboard'), {
        [uid]: {
          name: docSnap.get('name'),
          week: docSnap.get('week') + tryCount + 1,
          lastPlayed: dateoftheday.toString(),
        },
      });*/
      setFinish(true);
    }
  }
}

const useGameRowHook = (props: IScoreInterface) => {
  let { db, uid, setPlayToday } = props;
  const [isFinished, setFinish] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const initialGuessedWords = Array.from(Array(SETTING.COUNT_OF_TRY), () =>
    new Array(SETTING.LENGTH_OF_WORD).fill(null)
  );
  const initialStates = Array.from(Array(SETTING.COUNT_OF_TRY), () =>
    new Array(SETTING.LENGTH_OF_WORD).fill(KEY_STATE.EMPTY)
  );
  const [guessedWords, setGuessedWords]: Array<any> = useState(
    initialGuessedWords
  );
  const [states, setStates]: any = useState(initialStates);
  const [animations, setAnimations]: any = useState(
    Array.from(Array(SETTING.COUNT_OF_TRY), () =>
      new Array(SETTING.LENGTH_OF_WORD).fill(null)
    )
  );
  const [tryStates, setTryStates] = useState(
    new Array(SETTING.COUNT_OF_TRY).fill(null)
  );
  const [number, setNumber] = useState(0);
  const [tryCount, setTryCount] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<any>([]);
  const [cookies, setCookie, removeCookie] = useCookies([
    "states",
    "guessedWords",
    "selectedLetters",
    "tryCount",
    "number",
    "gameFinished",
    "animations",
    "lastWordGuessed"
  ]);
  const todayDate = new Date().setHours(0, 0, 0, 0).toString();
  const [word, setWord]: any = useState("");

  let [index, setIndex] = useState(-1);
  const seedRandom = require("seedrandom");
  const chathamOrNot = seedRandom(todayDate)();
  let [chathamOrGeneral, setChathamOrGeneral]: [string[], any] = useState([]);

  if (index !== -1 && word !== chathamOrGeneral[index]) {
    setWord(chathamOrGeneral[index]);
  }

  useEffect(() => {
    if (!uid) return;
    async function updateAtStart() {
      if (chathamOrNot >= 0.05) {
        setIndex(Math.round(seedRandom(uid + " " + todayDate)() * 204));
        setChathamOrGeneral(answerWords);
      } else {
        setIndex(Math.round(seedRandom(uid + " " + todayDate)() * 26));
        setChathamOrGeneral(chathamWords);
      }

      //set lastPlayed to monday if needed, get lastPlayed
      const lastPlayed = await getLatestPlay(props, new Date());
      if (lastPlayed) {
        var { Difference_In_Days: missedDays } = findDateDiff(
          lastPlayed,
          new Date().setHours(0, 0, 0, 0)
        );
        const missedScore = missedDays * 7;
        if (!uid) return;
        const ref = doc(db, "users", uid);
        const docSnap = await getDoc(ref);
        const lastLoggedIn = docSnap.get("lastLoggedIn");
        const dateoftheday = new Date().setHours(0, 0, 0, 0);
        //const dateoftheday = new Date(todayDate).setHours(0, 0, 0, 0);

        if (
          !isNaN(missedScore) &&
          !isNaN(lastPlayed) &&
          lastLoggedIn !== dateoftheday.toString() &&
          missedScore >= 7
        ) {
          await updateDoc(ref, {
            week: increment(missedScore),
            lastLoggedIn: dateoftheday.toString()
          });
          // await updateDoc(doc(db, 'data', 'leaderboard'), {
          //   [uid]: {
          //     name: docSnap.get('name'),
          //     week: docSnap.get('week') + missedScore,
          //   },
          // });
        }
      }
    }
    updateAtStart();
  }, []);

  useEffect(() => {
    if (cookies.guessedWords && cookies.states && cookies.selectedLetters) {
      setGuessedWords(cookies.guessedWords);
      setStates(cookies.states);
      setSelectedLetters(cookies.selectedLetters);
      setTryCount(parseInt(cookies.tryCount, 10));
      setNumber(parseInt(cookies.number, 10));
      setAnimations(cookies.animations);
      if (parseInt(cookies.gameFinished, 10) === 1) {
        setGameFinished(true);
        setFinish(true);
      }
      if (cookies.lastWordGuessed !== todayDate) {
        removeCookie("guessedWords");
        removeCookie("states");
        removeCookie("selectedLetters");
        removeCookie("tryCount");
        removeCookie("number");
        removeCookie("gameFinished");
        removeCookie("animations");
        removeCookie("lastWordGuessed");
        setCookie("lastWordGuessed", todayDate);

        window.location.reload();
      }
    }
  }, [
    index,
    cookies.guessedWords,
    cookies.states,
    cookies.selectedLetters,
    cookies.tryCount,
    cookies.number,
    cookies.gameFinished,
    cookies.animations,
    cookies.lastWordGuessed,
    gameFinished,
    removeCookie,
    setCookie,
    todayDate
  ]);

  const splitedWord = word?.split("");

  const refreshMessage = (content: string, miniSec: number = 1000) => {
    setMessage(content);
    setTimeout(() => {
      setMessage("");
    }, miniSec);
  };

  const refreshStates = (state: string) => {
    tryStates[tryCount] = state;
    setTryStates(tryStates);
    setTimeout(() => {
      setTryStates(new Array(SETTING.COUNT_OF_TRY).fill(null));
    }, 1000);
  };

  const pressLetter = (event: IKeyBoardEvent | string) => {
    if (number < SETTING.LENGTH_OF_WORD && !gameFinished) {
      if (isEvent(event)) {
        guessedWords[tryCount][number] = event.key.toLowerCase();
      } else {
        guessedWords[tryCount][number] = event.toLowerCase();
      }
      states[tryCount][number] = KEY_STATE.TBD;
      setGuessedWords(guessedWords);
      setStates(states);
      setNumber(number + 1);
    }
  };

  const pressEnter = () => {
    if (!gameFinished) {
      if (number < SETTING.LENGTH_OF_WORD) {
        refreshMessage(MESSAGE.NOT_ENOUGH_LETTER);
        refreshStates("invalid");
      } else {
        if (words.includes(guessedWords[tryCount].join(""))) {
          var duplicate = splitedWord;
          for (var i: number = 0; i < SETTING.LENGTH_OF_WORD; i++) {
            if (guessedWords[tryCount][i] === splitedWord[i]) {
              duplicate[i] = "-";
            }
          }

          let lettersToChange = [];
          for (var i: number = 0; i < SETTING.LENGTH_OF_WORD; i++) {
            let keyState;

            if (duplicate.includes(guessedWords[tryCount][i])) {
              if (duplicate[i] === "-") {
                keyState = KEY_STATE.CORRECT;
              } else if (
                guessedWords[tryCount][i] !== -1 &&
                duplicate[
                  duplicate.findIndex(
                    (elm: string) => elm === guessedWords[tryCount][i]
                  )
                ] === "&"
              ) {
                keyState = KEY_STATE.ABSENT;
              } else {
                keyState = KEY_STATE.PRESENT;
                duplicate[
                  duplicate.findIndex(
                    (elm: string) => elm === guessedWords[tryCount][i]
                  )
                ] = "&";
              }
            } else {
              keyState = KEY_STATE.ABSENT;
            }
            if (duplicate[i] === "-") {
              keyState = KEY_STATE.CORRECT;
            }
            states[tryCount][i] = keyState;
            setStates(states);
            lettersToChange.push({
              guessedWords,
              tryCount,
              keyState,
              i
            });
          }
          setTimeout(
            (lettersToChange) => {
              lettersToChange.forEach(
                ({ guessedWords, tryCount, keyState, i }) => {
                  removeByAttr(
                    selectedLetters,
                    "letter",
                    guessedWords[tryCount][i]
                  );
                  selectedLetters.push({
                    letter: guessedWords[tryCount][i],
                    state: keyState
                  });
                }
              );

              setSelectedLetters(selectedLetters);
              setCookie("selectedLetters", JSON.stringify(selectedLetters));
            },
            2400,
            lettersToChange
          );

          if (tryCount === SETTING.COUNT_OF_TRY - 1) {
            setGameFinished(true);
          }
          animations[tryCount].fill(ANIMATIONS.SCALE_CENTER);
          setAnimations(animations);
          if (guessedWords[tryCount].join("") === word) {
            setTimeout(() => {
              refreshMessage(MESSAGE.CORRECT);
              setGameFinished(true);
              setCookie("gameFinished", 1);
              setPlayToday(true);
              addScore(props, tryCount, setFinish);
            }, 2400);
          } else {
            const nextTry = tryCount + 1;
            setTryCount(nextTry);
            setNumber(0);
            if (tryCount === SETTING.COUNT_OF_TRY - 1) {
              setTimeout(() => {
                refreshMessage(word, 3000);
                addScore(props, tryCount + 1, setFinish);
                setCookie("gameFinished", 1);
              }, 2400);
            } else {
              setCookie("tryCount", nextTry);
              setCookie("number", 0);
              setCookie("gameFinished", 0);
            }
          }

          setCookie("states", JSON.stringify(states));
          setCookie("guessedWords", JSON.stringify(guessedWords));
          setCookie("selectedLetters", JSON.stringify(selectedLetters));
          setCookie("animations", JSON.stringify(animations));
          setCookie("lastWordGuessed", todayDate);
        } else {
          refreshMessage(MESSAGE.NOT_EXIST);
          refreshStates("invalid");
        }
      }
    }
  };

  const pressBackspace = () => {
    if (number > 0 && !gameFinished) {
      states[tryCount][number - 1] = KEY_STATE.EMPTY;
      guessedWords[tryCount][number - 1] = null;
      setStates(states);
      setGuessedWords(guessedWords);
      setNumber(number - 1);
    }
  };

  const onKeyPressed = (event: IKeyBoardEvent) => {
    if (!gameFinished) {
      if (isValidChar(event)) {
        pressLetter(event);
      } else if (event.keyCode === KEYBOARD.BACKSPACE) {
        pressBackspace();
      } else if (event.keyCode === KEYBOARD.ENTER) {
        pressEnter();
      }
    } else {
      setFinish(true);
    }
  };

  return [
    {
      onKeyPressed,
      pressEnter,
      pressLetter,
      pressBackspace,
      states,
      animations,
      tryStates,
      guessedWords,
      message,
      selectedLetters,
      isFinished
    }
  ];
};
export default useGameRowHook;
