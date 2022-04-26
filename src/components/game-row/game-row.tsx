import GameTile from '../game-tile/game-tile';
import { SETTING } from '../../global/global';
import Keyboard from '../keyboard/keyboard';
import './game-row.scss';
import useGameRowHook from './game-row-hook';
import { useRef } from 'react';
import { IScoreInterface } from './scores-interface';

const GameRow = (props: IScoreInterface) => {
  const { setIsFinished } = props;

  const [
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
      isFinished,
    },
  ] = useGameRowHook(props);
  setIsFinished(isFinished);
  const ref: any = useRef(null);
  if (ref.current) {
    ref.current.focus();
  }
  var rows = [];
  for (var i = 0; i < SETTING.COUNT_OF_TRY; i++) {
    var tile = [];
    for (var j = 0; j < SETTING.LENGTH_OF_WORD; j++) {
      tile.push(
        <GameTile
          state={states[i][j]}
          content={guessedWords[i][j]}
          animation={animations[i][j]}
        />
      );
    }
    rows.push(
      <div className="row" data-state={tryStates[i]}>
        {tile}
      </div>
    );
  }
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
          ''
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
