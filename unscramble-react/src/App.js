import './App.css';
import { useEffect, useState } from 'react'
import Keyboard from './Components/Keyboard';

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


/*
Selects randomly N words from data by the given topic
*/
function getWordsForTopic (words, topic, number = 3) {
  var topicWords = selectWordsForTopic(words, topic, number);
  var wordWithScrambled = topicWords.map(word => {
    return {original: word, scrambled: scrumbleWord(word.text)}
  })

  return wordWithScrambled;
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

  const [data, setData] = useState({})

  var randomTopic = getRandomTopic(data.topics);
  var topicWords = getWordsForTopic(data.words, randomTopic);
  useEffect(() => {
    // fetch data
    const dataFetch = async () => {
      const data = await (
        await fetch('../db.json')
      ).json();

      // set state when the data received
      setData(data);
    };

    dataFetch();
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        Unscramble
      </header>

      <div className='game-topic'>
        {randomTopic !== undefined ?
          "#" + randomTopic.name : ""}
      </div>



      {topicWords !== undefined ?
        <ul id="words">
          {topicWords.map(word => <li key={word.original.id}>{word.original.text} - {word.scrambled}</li>)}
        </ul> : <></>
      }



      <Keyboard />
    </div>
  );
}

export default App;
