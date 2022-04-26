import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import GameRow from './components/game-row/game-row';
import Header from './components/header/header';
import Leaderboard from './components/leaderboard/leaderboard';
import './App.scss';
import './global/style/style-variables.scss';
import { getFirestore } from 'firebase/firestore';
import { getDoc, doc, setDoc } from 'firebase/firestore';
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import firebaseConfig from './components/game/helper';
import { findDateDiff } from './components/game-row/game-row-helper';

//HELLO THERE! If you are in my code, that means you know how to access it
//through developer tools. This gives you access to a lot of things that you're
//not meant to have access to. Since I didn't really put any security features
//in place, this means you can mess with a lot of things if you mess with the code
//If you know what could cause damage, then I sincerely ask you to not change
//values in my database or cheat in the game in any way.
//This ruins the game for everyone else and also makes more work for me which
//would make me quite sad. So please do not disturb the game code or databases
//even though I didn't secure my code.
//THANK YOU SO MUCH! If you have any questions, reach out to me at ishirrao@chatham-nj.org.
//CHS Freshman Class President, Ishir Rao

//Please don't use these API keys for anything malicious that may ruin the
//Cougle experience for everyone else. I know I should've protected these
//but I simply don't have the time or knowledge to do so. Thank you for helping
//your CHS community.

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const SignIn = async (setUID: React.Dispatch<React.SetStateAction<string>>) => {
  try {
    const result = await signInWithPopup(auth, provider);

    // The signed-in user info.
    const user = result.user;
    if (user) {
      user.providerData.forEach(async profile => {
        if (profile.email && !profile.email.endsWith('@chatham-nj.org')) {
          alert('Please use an @chatham-nj.org email address. Thank you!');
          return;
        }
        const currentUID = user.uid;
        setUID(currentUID);
        const ref = doc(db, 'users', currentUID);
        const docSnap = await getDoc(ref);
        const today = new Date();
        const yesterday = new Date(today);

        yesterday.setDate(yesterday.getDate() - 1);

        //calculate missedScore on sign-in
        const previousMonday = new Date();
        const date = new Date();
        previousMonday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        var { Difference_In_Days: missedDays } = findDateDiff(
          previousMonday.setHours(0, 0, 0, 0),
          new Date().setHours(0, 0, 0, 0)
        );
        var missedScore = missedDays * 7;
        if (missedScore < 7) {
          missedScore = 0;
        }
        if (!docSnap.exists()) {
          setDoc(ref, {
            name: profile.displayName,
            week: missedScore,
            lastWeekPlayed: Math.floor(
              (Date.UTC(
                new Date().getFullYear(),
                new Date().getMonth(),
                new Date().getDate()
              ) -
                Date.UTC(new Date().getFullYear(), 0, 0)) /
                1000 /
                60 /
                60 /
                24 /
                7
            ),
            lastPlayed: yesterday.setHours(0, 0, 0, 0).toString(),
            lastLoggedIn: new Date().setHours(0, 0, 0, 0).toString(),
          });
        }
      });
    }
  } catch (error) {
    alert('signInError');
  }
};

function App() {
  const [UID, setUID] = useState('');
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [darkMode, setDark] = useState(false);
  var [isUser, setUser] = useState(false);
  const [playToday, setPlayToday] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([
    'states',
    'guessedWords',
    'selectedLetters',
    'tryCount',
    'number',
    'gameFinished',
    'animations',
    'lastWordGuessed',
  ]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (
      cookies.lastWordGuessed !== new Date().setHours(0, 0, 0, 0).toString()
    ) {
      removeCookie('guessedWords');
      removeCookie('states');
      removeCookie('selectedLetters');
      removeCookie('tryCount');
      removeCookie('number');
      removeCookie('gameFinished');
      removeCookie('animations');
      removeCookie('lastWordGuessed');
      setCookie('lastWordGuessed', new Date().setHours(0, 0, 0, 0).toString());
    }
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  return (
    <div
      id="game"
      onFocus={() => {
        document.getElementById('game-container')?.focus();
      }}
      onMouseEnter={() => {
        document.getElementById('game-container')?.focus();
      }}
      onClick={() => {
        document.getElementById('game-container')?.focus();
      }}
    >
      {onAuthStateChanged(auth, user => {
        if (user && user.email && user.email.includes('@chatham-nj.org')) {
          setLoading(false);
          setUser(true);
          setUID(user.uid);
        } else {
          setUser(false);
        }
      })}

      <Header setDark={setDark} />
      {!isUser && !UID && !loading && (
        <button
          onClick={() => {
            SignIn(setUID);
          }}
          className="signIn"
        >
          Sign In To Cougle
        </button>
      )}
      {(loading || (isUser && !UID)) && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          className="loading-spinner"
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
      {isUser && UID && !loading && (
        <GameRow
          db={db}
          uid={UID}
          setPlayToday={setPlayToday}
          playToday={playToday}
          setIsFinished={setIsFinished}
        />
      )}
      {isUser && isFinished && !loading && <Leaderboard uid={UID} db={db} />}
    </div>
    // <>
    //   <div className="renomessage"> Cougle is Under Renovations </div>
    //   <div className="renomessage"> Check it out on 4/25</div>
    // </>
  );
}
export default App;
