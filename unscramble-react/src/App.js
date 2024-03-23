import './App.css';
import { ReactComponent as MenuIcon } from './Assets/Images/hamburger-menu.svg';
import { ReactComponent as BackIcon } from './Assets/Images/arrow-left.svg';
import { ReactComponent as MoreIcon } from './Assets/Images/alt-arrow-right.svg';
import { ReactComponent as HelpIcon } from './Assets/Images/help-circle.svg';

import { useEffect, useState } from 'react'
import Keypad from './Components/Keypad';

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
  return selectedTopic;
};

function scrambleWord (word) {
  if (word === null ||
    word === undefined ||
    typeof (word) !== "string") {
    return {
      original: "",
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
    scramble: shuffle(joinedWords.toLowerCase().split('')).join(''),
    segments: [],
    splitingPoints: splitingPoints
  };

  scrambled.segments = splitWordByIndexes(scrambled.scramble, scrambled.splitingPoints);
  return scrambled;
};

function splitWordByIndexes (word, indexes) {
  if (word === null ||
    (word !== null && indexes === null)) {
    return [];
  }

  if (indexes.length <= 0) {
    return word;
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




  useEffect(() => {
    // fetch data
    const dataFetch = async () => {
      const data = await (
        await fetch('./unscramble/db.json')
      ).json();

      // set state when the data received
      var challengeTopic = getRandomTopic(data.topics);
      var topicWords = selectWordsForTopic(data.words, challengeTopic);

      // perpare challenges
      var challengeWords = topicWords.map((word, index) => {
        return {
          id: index,
          original: word,
          scrambled: scrambleWord(word.text),
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

  function openMenu (backScreen) {
    setState(currentState => ({ ...currentState, screen: "menu", backScreen: backScreen }));
  }

  function closeMenu () {
    setState(currentState => ({ ...currentState, screen: currentState.backScreen }));
  }

  function showChallenge () {
    setState(currentState => ({ ...currentState, screen: "game", currentChallenge: null }));
  }

  // keys related functions
  // execute when guess is to be submitted
  function onSubmitGuess () {
    console.log("Word is submittings");
    let currentChallenge = state.currentChallenge;
    if (currentChallenge === null) {
      console.log('Challenge unselected');
      return
    };

    let solution = currentChallenge.word;
    let currentGuess = currentChallenge.currentGuess;
    let solution_length = solution.length
    // only add guess if turn is less than 5
    // if (turn > 5) {
    //   console.log('you used all your guesses!')
    //   return
    // }

    // check word is solution_length chars
    if (currentGuess.length !== solution_length) {
      console.log(`word must be ${solution_length} chars.`)
      return
    }
  }

  function removeKey () {
    console.log("Remove key from guess");
    setState(currentState => ({
      ...currentState,
      currentChallenge: {
        ...currentState.currentChallenge,
        currentGuess: currentState.currentChallenge.currentGuess.slice(0, -1)
      }
    }));
  }

  function addKey (key) {
    console.log("Add key to guess");
    let currentChallenge = state.currentChallenge;
    if (currentChallenge === null) {
      console.log('Challenge unselected');
      return
    };

    let solution = currentChallenge.original;
    let currentGuess = currentChallenge.currentGuess;
    let solution_length = solution.text.length
    if (/^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < solution_length) {
        setState(currentState => ({
          ...currentState,
          currentChallenge: {
            ...currentState.currentChallenge,
            currentGuess: currentState.currentChallenge.currentGuess + key
          }
        }));
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
              <HelpIcon className="action action__left action__help" style={{ marginLeft: '1rem' }} />
              <span className='App-logo'>Unscramble</span>
              <MenuIcon className='action action__right' style={{ marginRight: '1rem' }} onClick={() => openMenu("game")} />
            </header>

            {
              <div className='challenge-board'>
                <div className='challenge-topic'>
                  {state.challengeTopic !== undefined && state.challengeTopic !== null ?
                    "#" + state.challengeTopic.name : ""}
                </div>


                {state.challengeWords !== undefined ?
                  <div className='challenge-words'>
                    {state.challengeWords.map(word =>
                      <div className='challenge-word'
                        key={word.original.id}
                        onClick={() => guessWord(word.id)}>
                        {word.original.text} - {word.scrambled.original}

                        <div className='challenge-word__scrambled'>
                          {
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
              <span className='action action__left' onClick={() => showChallenge()}>
                <BackIcon />
              </span>
              <span className='App-logo'>Unscramble</span>
              <span className='action action__right' onClick={() => openMenu("guess")}>
                <MenuIcon />
              </span>
            </header>

            <div className='challenge-board'>
              <div className='challenge-topic'>
                {state.challengeTopic !== undefined && state.challengeTopic !== null ?
                  "#" + state.challengeTopic.name : ""}
              </div>
              <div className='challenge__word-grid'>
                {state.currentChallenge !== null ?
                  <>
                    <div className='challenge__word-grid-row challenge-tiles'>
                      {
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
                  </> : null}
              </div>
              <Keypad
                onEnter={onSubmitGuess}
                onDelete={removeKey}
                onChar={addKey} />
            </div>

          </div>
          : null
      }

      {/* menu screen */}
      {
        state.screen === "menu" ?
          <div className='challenge-screen menu'>
            <button className='menu-action' onClick={() => showChallenge()}>Back</button>
            <button className='menu-action' onClick={() => closeMenu()}>Close</button>
          </div>
          : null
      }

    </div>
  );
}

export default App;
