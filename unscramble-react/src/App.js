import './App.css';
import { ReactComponent as MenuIcon } from './Assets/Images/hamburger-menu.svg';
import { ReactComponent as BackIcon } from './Assets/Images/arrow-left.svg';
import { ReactComponent as MoreIcon } from './Assets/Images/alt-arrow-right.svg';
import { ReactComponent as HelpIcon } from './Assets/Images/help-circle.svg';

import { useEffect, useState } from 'react'
import Keypad from './Components/Keypad';

// https://dev.to/krisgardiner/build-wordle-in-react-1hkb
//https://cupofcode.blog/wordle-in-react-multiword/
//https://blog.openreplay.com/build-a-wordle-like-game-using-react/

/*
https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
*/
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

function scrumbleWord (word) {
  if (word === null ||
    word === undefined ||
    typeof (word) !== "string") {
    return "";
  }

  let splittedWord = word
    .split(/(\s+)/)
    .map(x => onlyWhiteSpace(x) ? "" : x); //clean up from different white spaces to one

  let scrumbled = splittedWord
    .map(wordPart => onlyWhiteSpace(wordPart) ? "" : shuffle(wordPart.split('')).join(''));
  return scrumbled;
};

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
        await fetch('../db.json')
      ).json();

      // set state when the data received
      var challengeTopic = getRandomTopic(data.topics);
      var topicWords = selectWordsForTopic(data.words, challengeTopic);

      // perpare challenges
      var challengeWords = topicWords.map((word, index) => {
        return {
          id: index,
          original: word,
          scrambled: scrumbleWord(word.text),
          guessed: false
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
                        {word.original.text} - {word.scrambled}

                        <div className='challenge-word__scrambled'>
                          {
                            word.scrambled.map(wordpart => <span className='challenge-word__scrambled-piece'> {
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
                  <div className='challenge__word-grid-row'>
                    {
                      state.currentChallenge.scrambled.map(wordpart => <span className='challenge__word-grid-row-piece'> {
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
                      state.currentChallenge.scrambled.map(wordpart => <span className='challenge__word-grid-row-piece'> {
                        !onlyWhiteSpace(wordpart) ?
                          wordpart
                            .split('').map((letter, index) =>
                              <span className='challenge__word-grid-row-piece-letter' key={index}></span>) :
                          <></>
                      } </span>)
                    }
                    </div>
                    </> : null}
              </div>
              <Keypad />
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
