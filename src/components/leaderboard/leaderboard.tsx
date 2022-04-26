import {
  collection,
  Firestore,
  getDocs,
  orderBy,
  query,
  where,
} from '@firebase/firestore';
import { useEffect, useState } from 'react';
import { ILeaderboard } from './leaderboard-interface';
import './leaderboard.scss';

async function updatePlayersFromObject(
  playersData: Object,
  setPlayers: any,
  uid: string
) {
  const playersList: {
    name: string;
    score: string;
    currentUser: boolean;
  }[] = Array.from(
    Object.entries(playersData || {}).filter(
      ([id, doc]) =>
        doc.lastPlayed === new Date().setHours(0, 0, 0, 0).toString()
    ),
    ([id, doc]) => {
      return {
        name: doc.name,
        score: doc.week,
        currentUser: id === uid,
      };
    }
  );

  setPlayers(playersList);
}

async function updatePlayers(db: Firestore, uid: string, setPlayers: any) {
  //const docSnap = await getDoc(doc(db, 'data', 'leaderboard'));
  //updatePlayersFromObject(docSnap.data() || {}, setPlayers, uid);
  const docsSnap = await getDocs(
    query(
      collection(db, 'users'),
      where('lastPlayed', '==', new Date().setHours(0, 0, 0, 0).toString()),
      orderBy('week')
    )
  );
  const docsData = Object.fromEntries(
    Array.from(docsSnap.docs, docSnap => [docSnap.id, docSnap.data()])
  );
  updatePlayersFromObject(docsData || {}, setPlayers, uid);
}

const Leaderboard = (props: ILeaderboard) => {
  const { uid, db } = props;
  const [players, setPlayers]: [
    { name: string; score: string; currentUser: boolean }[],
    React.Dispatch<React.SetStateAction<never[]>>
  ] = useState([]);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      updatePlayers(db, uid, setPlayers);
    }, 1000);

    //onSnapshot(doc(db, 'data', 'leaderboard'), docSnap => {
    //  updatePlayersFromObject(docSnap.data() || {}, setPlayers, uid);
    //});
  }, []);

  let position = 0;
  let score = 0;

  return (
    <div className="leaderboard">
      <div className="leaderboard-title">
        <p>Leaderboard</p>
        <div
          onClick={() => {
            if (cooldown + 5000 < new Date().getTime()) {
              updatePlayers(db, uid, setPlayers);
              document
                .getElementsByClassName('refresh-button')[0]
                .animate(
                  [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }],
                  { duration: 1000, iterations: 1, easing: 'ease-in-out' }
                );
              setCooldown(new Date().getTime());
            } else {
              document
                .getElementsByClassName('refresh-button')[0]
                .animate(
                  [
                    { transform: 'translateX(0px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(0px)' },
                  ],
                  {
                    duration: 750,
                    iterations: 1,
                    easing: 'ease-in-out',
                  }
                );
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
            className="refresh-button"
          >
            <g>
              <path
                d="M50 18A32 32 0 1 0 82 50.00000000000001"
                fill="none"
                stroke="#e6e6e6"
                stroke-width="14"
              ></path>
              <path d="M49 -2L49 38L69 18L49 -2" fill="#e6e6e6"></path>
            </g>
          </svg>
        </div>
      </div>
      <div className="leaderboard-column-titles">
        <div>Place</div>
        <div>Name</div>
        <div>Score</div>
      </div>
      {players.length > 0 &&
        players.map(player => {
          let positionClass = '';
          if (position < 4) {
            positionClass += 'top3 ';
          }
          if (parseInt(player.score, 10) === score) {
            positionClass += `position-${position}`;
          }
          if (parseInt(player.score, 10) > score) {
            position++;
            score = parseInt(player.score, 10);
            if (!(position > 3)) {
              positionClass += `position-${position}`;
            }
          }
          return (
            <div
              className={`leaderboard-spot ${
                player.currentUser ? 'current-user' : ''
              } ${positionClass}`}
            >
              <div>{position}</div>
              <div className="leaderboard-name">{player.name}</div>
              <div>{player.score}</div>
            </div>
          );
        })}
      {players.length === 0 && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          className="leaderboard-loading-spinner"
        >
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke-dasharray="164.93361431346415 56.97787143782138"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              repeatCount="indefinite"
              dur="2s"
              values="0 50 50;360 50 50"
              keyTimes="0;1"
            ></animateTransform>
          </circle>
        </svg>
      )}
    </div>
  );
};

export default Leaderboard;
