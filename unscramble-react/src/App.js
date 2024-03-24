import './App.css';
import { ReactComponent as MenuIcon } from './Assets/Images/hamburger-menu.svg';
import { ReactComponent as BackIcon } from './Assets/Images/arrow-left.svg';
import { ReactComponent as MoreIcon } from './Assets/Images/alt-arrow-right.svg';
import { ReactComponent as HelpIcon } from './Assets/Images/help-circle.svg';
import { ReactComponent as SuccessIcon } from './Assets/Images/success-tick.svg';
import { ReactComponent as FailIcon } from './Assets/Images/multiply-cross.svg';
import { ReactComponent as DefaultStateIcon } from './Assets/Images/square.svg';
import winingImage from './Assets/Gifs/winning-owl.gif'
import losingImage from './Assets/Gifs/angry-dog.gif'

import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useTranslation } from 'react-i18next';

import { useEffect, useState } from 'react';
import Keypad from './Components/Keypad';

const locales = {
  en: { title: 'English' },
  it: { title: 'Italiano' },
};

const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const onlyWhiteSpace = text => text.trim().length === 0;

/*
Selects randomly N words from data by the given topic
*/
function selectWordsForTopic (words, topic, number = 3) {
  if (words === null ||
    words === undefined ||
    topic === null) {
    return [];
  }

  var topicRelatedWords = words
    .filter((word) => word.topics.includes(topic.id))
    .slice(0, number);
  return shuffle(topicRelatedWords);
};

function getRandomTopic (topics) {
  if (topics === null ||
    topics === undefined ||
    !Array.isArray(topics)) {
    return {};
  }

  let selectedTopic = topics[Math.floor(Math.random() * topics.length)];
  //retrieve it's related parent
  if (selectedTopic.parent !== null) {
    let parentTopic = topics.filter(x => x.id === selectedTopic.parent)[0];
    selectedTopic.parent = parentTopic;
  }
  return selectedTopic;
};

function scrambleWord (word) {
  if (word === null ||
    word === undefined ||
    typeof (word) !== "string") {
    return {
      original: "",
      segmentsOfOriginal: [],
      scramble: "",
      segments: [],
      splitingPoints: []
    };
  }

  let splittedWord = word
    .split(/(\s+)/)
    .map(x => onlyWhiteSpace(x) ? "" : x); //clean up from different white spaces to one

  let splitingPoints = [];
  for (let i = 0; i < splittedWord.length; i++) {
    let wordPart = splittedWord[i];
    if (onlyWhiteSpace(wordPart)) {
      let index = splittedWord[i - 1].length;
      splitingPoints.push(index);
    }
  }

  let joinedWords = splittedWord.join('');
  let scrambled = {
    original: joinedWords,
    segmentsOfOriginal: [],
    scramble: shuffle(joinedWords.toLowerCase().split('')).join(''),
    segments: [],
    splitingPoints: splitingPoints
  };

  scrambled.segmentsOfOriginal = splitWordByIndexes(scrambled.original, scrambled.splitingPoints);
  scrambled.segments = splitWordByIndexes(scrambled.scramble, scrambled.splitingPoints);
  return scrambled;
};

function splitWordByIndexes (word, indexes) {
  if (word === null ||
    (word !== null && indexes === null)) {
    return [];
  }

  if (indexes.length <= 0) {
    return [word];
  }

  indexes = [0, ...indexes];
  let segments = [];
  for (let i = 0; i < indexes.length; i++) {
    let startSegmentIndex = indexes[i];
    if ((i + 1) < indexes.length) {
      let endSegmentIndex = indexes[i + 1];
      segments.push(word.substring(startSegmentIndex, endSegmentIndex))
    }
    else {
      segments.push(word.substring(startSegmentIndex));
    }
  }
  return segments;
}

function App () {

  const { t, i18n } = useTranslation();
  // possible game screens:
  //  game --> starting screen
  //  guess --> guessing word
  //  menu --> hamburger menu expanded
  //  help --> game details screen
  const [state, setState] = useState(
    {
      screen: "game",
      backScreen: "game",
      data: {},
      showGameMenu: false,
      currentChallenge: null,
      challengeWords: [],
      challengeTopic: null
    });

  const [game, setGame] = useState(
    {
      completed: false,
      win: true,
    });

  const currentCulture = i18n.resolvedLanguage;


  useEffect(() => {
    // fetch data
    const dataFetch = async () => {
      const data = await (
        await fetch('/unscramble/db.json')
      ).json();

      // set state when the data received
      var challengeTopic = getRandomTopic(data.topics);
      var topicWords = selectWordsForTopic(data.words, challengeTopic);

      // perpare challenges
      var challengeWords = topicWords.map((word, index) => {
        return {
          id: index,
          original: word,
          scrambled: scrambleWord(word.text[currentCulture]),
          guessState: "",
          currentGuess: "",
          maxGuesses: 3,
          triedGuesses: 0
        }
      })

      setState(currentState => ({
        ...currentState,
        data: data,
        challengeTopic: challengeTopic,
        challengeWords: challengeWords
      }));
    };

    dataFetch();
  }, []);

  // on state change we check if game is completed
  useEffect(() => {
    let numberOfChallenges = state.challengeWords.length;
    let statefulChallenges = state.challengeWords.filter(x => x.guessState !== "");
    if (numberOfChallenges > 0 && statefulChallenges.length === numberOfChallenges) {
      setGame({
        completed: true,
        win: statefulChallenges.filter(x => x.guessState === "success").length === numberOfChallenges
      })
    }
  }, [state]);

  function guessWord (wordId) {
    setState(currentState => {
      let newState = { ...currentState, screen: "guess" }
      let selectedChallenge = currentState.challengeWords.filter(x => x.id === wordId);
      if (selectedChallenge.length === 1) {
        newState.currentChallenge = selectedChallenge[0];
      };
      return newState;
    });
  }

  function newGame () {
    window.location.reload(false); // reload/refresh page
  }

  function openMenu (backScreen) {
    setState(currentState => ({ ...currentState, screen: "menu", backScreen: backScreen }));
  }

  function closeMenu () {
    setState(currentState => ({ ...currentState, screen: currentState.backScreen }));
  }

  function showCurrentGame () {
    setState(currentState => ({ ...currentState, screen: "game", currentChallenge: null }));
  }

  function showScreen (screen) {
    switch (screen) {
      case 'game':
      case 'guess':
      case 'menu':
      case 'help':
        break;
      default:
        screen = "game";
        break;
    }
    setState(currentState => ({ ...currentState, screen: screen }));
  }

  // keys related functions
  // execute when guess is to be submitted
  function onSubmitGuess () {
    let currentChallenge = state.currentChallenge;
    if (currentChallenge === null) {
      console.log('Unselected challenge');
      return;
    };

    let solution = currentChallenge.scrambled.original.toLowerCase();
    let currentGuess = currentChallenge.currentGuess;
    let solution_length = solution.length

    // check that number of remaining attemps are valid
    if (currentChallenge.triedGuesses >= currentChallenge.maxGuesses) {
      let errorMessage = t("screens.guess.guessLimitRiched");
      toast.error(errorMessage, {
        position: "top-center", autoClose: 1500, hideProgressBar: true,
        closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined
      });
      return;
    }

    // check word is solution_length chars
    if (currentGuess.length !== solution_length) {
      let errorMessage = t("screens.guess.guessShortenThenWord");
      toast.error(errorMessage, {
        position: "top-center", autoClose: 1500, hideProgressBar: true,
        closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined
      });
      return;
    }

    if (currentGuess.toLowerCase() !== solution) {
      let errorMessage = t("screens.guess.wrongGuess");
      toast.error(errorMessage, {
        position: "top-center", autoClose: 1500, hideProgressBar: true,
        closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined
      });

      setState(currentState => {
        let newState = {
          ...currentState,
          currentChallenge: {
            ...currentState.currentChallenge,
            currentGuess: "",
            triedGuesses: currentState.currentChallenge.triedGuesses + 1
          }
        }

        if (newState.currentChallenge.triedGuesses === newState.currentChallenge.maxGuesses) {
          newState.currentChallenge.guessState = "fail";
          newState.currentChallenge.guessWord = "";
          //replace word with current state
          let newChallengeStates = [];
          newState.challengeWords.forEach(wordData => {
            if (wordData.id === newState.currentChallenge.id) {
              newChallengeStates.push(newState.currentChallenge);
            }
            else {
              newChallengeStates.push(wordData);
            }
          })

          newState.challengeWords = newChallengeStates;
          newState.screen = "game";
        }
        return newState;
      })
    }
    else {
      // word guessed
      setState(currentState => {
        let newState = {
          ...currentState,
          currentChallenge: {
            ...currentState.currentChallenge,
            triedGuesses: currentState.currentChallenge.triedGuesses + 1,
            guessState: "success",
            guessWord: "",
            screen: "game"
          }
        }

        //replace word with current state
        let newChallengeStates = [];
        newState.challengeWords.forEach(wordData => {
          if (wordData.id === newState.currentChallenge.id) {
            newChallengeStates.push(newState.currentChallenge);
          }
          else {
            newChallengeStates.push(wordData);
          }
        })

        newState.challengeWords = newChallengeStates;

        return newState;
      })
    }
  }

  function removeKey () {
    setState(currentState => ({
      ...currentState,
      currentChallenge: {
        ...currentState.currentChallenge,
        currentGuess: currentState.currentChallenge.currentGuess.slice(0, -1)
      }
    }));
  }

  function addKey (key) {
    let currentChallenge = state.currentChallenge;
    if (currentChallenge === null) {
      console.log('Challenge unselected');
      return
    };

    let solution = currentChallenge.scrambled.original;
    let currentGuess = currentChallenge.currentGuess;
    let solution_length = solution.length
    if (/^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < solution_length) {
        setState(currentState => {
          var newState = {
            ...currentState,
          }

          if (newState.currentChallenge.currentGuess.length < newState.currentChallenge.scrambled.original.length) {
            newState.currentChallenge.currentGuess = newState.currentChallenge.currentGuess + key;
          }

          return newState;
        });
      }
    }
  }


  return (
    <div className="App">

      {/* game screen */}
      {
        state.screen === "game" ?
          <div className='challenge-screen'>
            <header className="App-header">
              <HelpIcon className="action action__left action__help" style={{ marginLeft: '1rem' }} onClick={() => showScreen("help")} />
              <span className='App-logo'>Unscramble</span>
              <MenuIcon className='action action__right' style={{ marginRight: '1rem' }} onClick={() => openMenu("game")} />
            </header>

            {
              game.completed === true ?
                <div className='game-report'>
                  <h1 className='game-report__title'>{game.win ? t("screens.game.matchWon") : t("screens.game.matchLost")}</h1>
                  <img className="game-report__picture" src={game.win ? winingImage : losingImage} alt="match state" />
                  <p className='game-report__description'>{game.win ? t("screens.game.matchWonDescription") : t("screens.game.matchLostDescription")}</p>
                </div> :
                <div className='challenge-board'>
                  <div className='challenge-topic'>
                    {state.challengeTopic !== undefined && state.challengeTopic !== null ?
                      "#" + (state.challengeTopic.parent !== null ? state.challengeTopic.parent.name[currentCulture] + " / ": "") + state.challengeTopic.name[currentCulture] : ""}
                  </div>


                  {state.challengeWords !== undefined ?
                    <div className='challenge-words'>
                      {state.challengeWords.map(word =>
                        <div className='challenge-word'
                          key={word.original.id}
                          onClick={() => guessWord(word.id)}>
                          {
                            word.guessState === "success" ?
                              <SuccessIcon className="challenge-state success" />
                              : word.guessState === "fail" ?
                                <FailIcon className="challenge-state fail" />
                                : <DefaultStateIcon className="challenge-state" />
                          }

                          <div className='challenge-word__scrambled'>
                            {
                              word.guessState === "success" ?
                                word.scrambled.segmentsOfOriginal
                                  .map(wordpart => <span className='challenge-word__scrambled-piece'> {
                                    !onlyWhiteSpace(wordpart) ?
                                      wordpart
                                        .split('').map((letter, index) =>
                                          <span className='challenge-word__scrambled-piece-letter' key={index}>{letter}</span>) :
                                      <></>
                                  } </span>)
                                :
                                word.scrambled.segments
                                  .map(wordpart => <span className='challenge-word__scrambled-piece'> {
                                    !onlyWhiteSpace(wordpart) ?
                                      wordpart
                                        .split('').map((letter, index) =>
                                          <span className='challenge-word__scrambled-piece-letter' key={index}>{letter}</span>) :
                                      <></>
                                  } </span>)

                            }
                          </div>
                          <MoreIcon />

                        </div>)}
                    </div> : null
                  }
                </div>
            }
          </div>
          : null
      }

      {/* guess screen */}
      {
        state.screen === "guess" ?
          <div className='challenge-screen'>
            <header className="App-header">
              <span className='action action__left' onClick={() => showCurrentGame()}>
                <BackIcon />
              </span>
              <span className='App-logo'>Unscramble</span>
              <span className='action action__right' onClick={() => openMenu("guess")}>
                <MenuIcon />
              </span>
            </header>

            <div className='challenge-board'>
              <div className='challenge-info'>
                <div className={
                  'challenge-topic ' +
                  (state.currentChallenge.guessState !== "" ? ("challenge-topic--" + state.currentChallenge.guessState) : "")}
                  style={{ marginBottom: '1.75rem' }}>
                  {state.challengeTopic !== undefined && state.challengeTopic !== null ?
                    <span>
                      {"#" + (state.challengeTopic.parent !== null ? state.challengeTopic.parent.name[currentCulture] + " / ": "") + state.challengeTopic.name[currentCulture]}
                    </span>
                    : ""}
                </div>
                {state.currentChallenge !== null ?
                  <>
                    <div className='challenge__word-grid-row challenge-tiles' style={{ marginBottom: '1.75rem' }}>
                      {
                        state.currentChallenge.guessState !== "" ?
                          state.currentChallenge.scrambled.segmentsOfOriginal
                            .map(wordpart => <span className='challenge__word-grid-row-piece'> {
                              !onlyWhiteSpace(wordpart) ?
                                wordpart
                                  .split('').map((letter, index) =>
                                    <span className='challenge__word-grid-row-piece-letter populated' key={index}>{letter}</span>) :
                                <></>
                            } </span>)
                          :
                          state.currentChallenge.scrambled.segments
                            .map(wordpart => <span className='challenge__word-grid-row-piece'> {
                              !onlyWhiteSpace(wordpart) ?
                                wordpart
                                  .split('').map((letter, index) =>
                                    <span className='challenge__word-grid-row-piece-letter' key={index}>{letter}</span>) :
                                <></>
                            } </span>)
                      }
                    </div>
                    <div className='challenge-info__attempts'>
                      {
                        state.currentChallenge.guessState === "" ?
                          t("screens.guess.remainingAttempts") + " " + (state.currentChallenge.maxGuesses - state.currentChallenge.triedGuesses) + " / " + state.currentChallenge.maxGuesses : ""
                      }
                    </div>
                  </> : null}
              </div>

              {state.currentChallenge !== null && state.currentChallenge.guessState === "" ?
                <>
                  <div className='challenge__word-grid'>
                    <div className='challenge__word-grid-row guess-tiles'>
                      {
                        state.currentChallenge.scrambled.segments
                          .map((wordpart, partIndex) => <span className='challenge__word-grid-row-piece'> {
                            !onlyWhiteSpace(wordpart) ?
                              wordpart
                                .split('').map((letter, letterIndex) => {

                                  let baseIndex = partIndex < 1 ? 0 : state.currentChallenge.scrambled.segments
                                    .filter((x, index) => index < partIndex)
                                    .map(x => x.length)
                                    .reduce((accumulator, currentValue) => {
                                      return accumulator + currentValue
                                    }, 0);
                                  let currentGuessIndex = baseIndex + letterIndex;
                                  return <span className={"challenge__word-grid-row-piece-letter " + (state.currentChallenge.currentGuess[currentGuessIndex] !== undefined ? 'populated' : '')}
                                    key={letterIndex}>
                                    {state.currentChallenge.currentGuess[currentGuessIndex]}
                                  </span>;
                                }
                                ) :
                              <></>
                          } </span>)
                      }
                    </div>
                  </div>
                  <Keypad
                    onEnter={onSubmitGuess}
                    onDelete={removeKey}
                    onChar={addKey} />
                </>
                : null}
            </div>

          </div>
          : null
      }

      {/* menu screen */}
      {
        state.screen === "menu" ?
          <>
            <ul className='app-cultures'>
              {Object.keys(locales).map((locale) => (
                <li className={"app-cultures__culture " + (i18n.resolvedLanguage === locale ? 'active' : '')} key={locale}><span onClick={() => i18n.changeLanguage(locale)}>
                  {locales[locale].title}
                </span></li>
              ))}
            </ul>

            <div className='challenge-screen menu'>
              <button className='menu-action' onClick={() => newGame()}>{t("screens.menu.newGame")}</button>
              <button className='menu-action' onClick={() => closeMenu()}>{t("screens.menu.close")}</button>
            </div>
          </>
          : null
      }

      {/* help screen */}
      {
        state.screen === "help" ?
          <div className='challenge-screen'>
            <header className="App-header">
              <BackIcon className="action action__left" onClick={() => showScreen("game")} />
              <span className='App-logo'>Unscramble</span>
              <MenuIcon className='action action__right' style={{ visibility: 'hidden' }} />
            </header>

            <div className='game-help'>
              <h1 className='game-help__title'>{t("screens.help.title")}</h1>
              <h3 className='game-help__subtitle'>{t("screens.help.subtitle")}</h3>
              <p className='game-help__description'>{t("screens.help.description")}</p>
            </div>
          </div>
          : null
      }

      <ToastContainer />
    </div>
  );
}

export default App;
