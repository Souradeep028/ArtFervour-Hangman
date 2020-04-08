$('#alphabet').hide();
$('.results-social').hide();
$('#moreGames').hide();

$('button').on('click', handleClick);

var hangman = {};
let hangmanObject = {};
let quesIndex = 0;
let scoreCounter = 0;
let questionCounter = 0;

function handleClick(e) {
  let id = e.target.id,
    buttonId = $('#newGame');

  let action = {
    newGame: () => initialize(),
    letter: () => processGuess(id),
    hint: () => showHint(hangman.hintsUsed)
  };

  if (hangman.newGame) {
    id.length > 1 ? action[id]() : action.letter();
  } else {
    id === 'newGame' ? action.newGame() : shakeButton(buttonId);
  }
}

function shakeButton(id) {
  id.addClass('shake');
  setTimeout(() => id.removeClass('shake'), 200);
}

function initialize() {
  resetGame().then(newGame => {
    hangman = newGame;
    updateCategory(hangman.question)
    appendSpaces();
    $('#quesNum').text(`Question : ${quesIndex} `);
    $('#scoreCount').text(`Score : ${scoreCounter}`);
  });
}

async function getWord() {
  questionCounter = fetch("data.json").then((res) => res.json()).then(data => questionCounter = data.length);
  return fetch("data.json")
    .then((res) => res.json())
    .then((data) => data[quesIndex++]);
}

function resetGame() {
  //reset text, stick figure, button styles
  $('#newGame').hide();
  $('#moreGames').hide();
  $('.results-social').hide();
  $('#alphabet').show();
  $('#question-text').show();
  $('#hintParent').show();
  $('.guessed-right').text('');
  $('#word-letters').empty();
  $('svg > circle, line').removeClass().addClass('hide-hangman');
  $('#category-label').removeClass().addClass('badge').text('Loading...');
  $('#hintParent').empty();
  $('.btn').removeClass().addClass('btn btn-primary');
  $('.letter').removeClass().addClass('btn btn-primary');
  $('#hint').removeClass().addClass('btn btn-info');
  //request new word
  return new Promise(resolve => resolve(getWord()))
}

function updateCategory(val) {
  let category = `${val}`;
  $('#category-label').text('');
  $('#question-text').text('').append(category);
}

function appendSpaces() {
  const createSpace = (el, i) => {
    let isPunct = /\W/.test(el),
      id = isPunct ? 'punct' + i : el.toLowerCase() + i,
      className = isPunct ? 'show-letter punct' : 'hide-letter',
      span = `<span id=${id} class="${className}">${el}</span>`;
    return `<div class="guessed-right">${span}</div>`;
  };

  $('#word-letters').append(hangman.answer.map((el, i) => {
    return /\s/.test(el) ? '&emsp;' : createSpace(el, i);
  }));
}

function processGuess(id) {
  let guessLetter = $('#' + id),
    letterInWord = hangman.answer.includes(id);

  guessLetter.removeClass().addClass('btn btn-secondary letter disableClick');

  letterInWord ? showLetter(id) : addToHangman();
}

function showLetter(id) {
  for (let i = 0; i < hangman.answer.length; i++) {
    if (id === hangman.answer[i]) {
      $('#' + id.toLowerCase() + i).removeClass().addClass('show-letter');
    }
  }
  checkForWin();
}

function addToHangman() {
  let lastIncorrect = hangman.stickIndex === 5,
    stickPart = hangman.stickFigure[hangman.stickIndex];

  $('#' + stickPart).removeClass('hide-hangman').addClass('show-hangman');

  if (lastIncorrect) {
    $('.hide-letter').removeClass().addClass('show-letter');
    $('.btn').removeClass().addClass('btn btn-secondary disableClick');
    if (quesIndex < questionCounter) {
      setTimeout(() => initialize(), 2600);
    }
    else gameOver();
  }
  else {
    hangman.stickIndex += 1;
  }
}

function showHint(index) {
  hangman.hintsUsed += 1;

  let newHint = `<p><span>${index + 1}/2 - </span>${hangman.hints[index]}</p>`;
  $('#hintParent').append(newHint);

  if (hangman.hintsUsed === 2) {
    $('#hint').removeClass().addClass('btn btn-secondary disableClick');
  }
}

function checkForWin() {
  let playerWon = $('.guessed-right > .hide-letter').length === 0;

  if (playerWon) {
    ++scoreCounter;
    $('.btn').removeClass().addClass('btn btn-secondary disableClick');
    if (quesIndex < questionCounter) {
      setTimeout(() => initialize(), 2600);
    }
    else gameOver('win');
  }
}
function gameOver(win) {
  hangman.newGame = false;
  $('.btn').removeClass().addClass('btn btn-primary').re;
  $('#newGame').show().text('New Game').unbind().click(() => { quesIndex = 0; scoreCounter = 0; initialize() });
  $('#moreGames').show().click(() => window.location = 'https://www.artfervour.com/af-games');
  $('.results-social').show();
  $('#alphabet').hide();
  $('#question-text').hide();
  $('#hintParent').hide();
  // $('.hide-letter').removeClass().addClass('show-letter');

  let mssg = $('#category-label'),
    won = `<span><br><br>Your Score : ${scoreCounter}/${questionCounter}</span>`,
    lost = `<span><br><br>Your Score : ${scoreCounter}/${questionCounter}</span>`;

  mssg.empty().removeClass('badge-secondary');

  if (win) {
    mssg.append(won);
  } else {
    mssg.append(lost);
  }
}
