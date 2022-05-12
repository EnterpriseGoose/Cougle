import { SETTING } from "../../global/global";
import Keyboard from "../keyboard/keyboard";
import Row from "../row/row";
import useGameHook from "./game-hook";
import { useEffect, useRef } from "react";
import { IGameInterface } from "./game-interface";

const GameRow = (props: IGameInterface) => {
  const { setIsFinished } = props;

  const [
    {
      onKeyPressed,
      pressEnter,
      pressLetter,
      pressBackspace,
      tryStates,
      guessedWords,
      message,
      selectedLetters,
      isFinished,
    },
  ] = useGameHook(props);
  setIsFinished(isFinished);
  const ref: any = useRef(null);
  if (ref.current) {
    ref.current.focus();
  }
  var rows: any[] = [];
  for (var i = 0; i < SETTING.COUNT_OF_TRY; i++) {
    rows.push(<Row states={tryStates[i]} letters={guessedWords[i]}></Row>);
  }
  console.log("Game is Loaded");

  return (
    <div
      onKeyDown={!isFinished ? onKeyPressed : undefined}
      tabIndex={0}
      ref={ref}
      id="game-container"
    >
      <div id="board-container">
        <div id="board">{rows}</div>
        {message ? (
          <div className="notification" id="game-notification">
            {message}
          </div>
        ) : (
          ""
        )}
      </div>
      <Keyboard
        selectedLetters={selectedLetters}
        pressVirualKeyBoard={pressLetter}
        pressEnter={pressEnter}
        pressBackspace={pressBackspace}
      />
    </div>
  );
};
export default GameRow;
