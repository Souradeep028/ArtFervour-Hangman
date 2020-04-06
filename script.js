$('#alphabet').hide();
$('.results-social').hide();
$('#moreGames').hide();

$('button').on('click', handleClick);

var hangman = {};
let hangmanObject={};

function handleClick(e) {
  let id = e.target.id,
      buttonId = $('#newGame');
  
  let action = {
    newGame: () => initialize(),
    letter:  () => processGuess(id),
    hint:    () => showHint(hangman.hintsUsed)
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
  });
}

function getWord() {
  return fetch("data.json").then(res => res.json()).then(data =>  data[Math.floor(Math.random()*data.length)]);
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
  /*
    3 kinds of spaces:
      - letters:     draw line, hide letter
      - punctuation: draw line, show punctuation
      - whitespace:  no line, just blank space
  */
  const createSpace = (el, i) => {
    let isPunct = /\W/.test(el),
        id = isPunct ? 'punct' + i : el.toLowerCase() + i,
        className = isPunct ? 'show-letter punct' : 'hide-letter',
        span = `<span id=${id} class="${className}">${el}</span>`;
    //return `<div class="col-sm-1 mx-1 guessed-right">${span}</div>`;
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
    gameOver();
  } else {
    hangman.stickIndex += 1;
  }
}

function showHint(index) {  
  hangman.hintsUsed += 1;
  
  let newHint = `<p class="hint-text badge">${index + 1}/3 - ${hangman.hints[index]}</p>`;
  $('#hintParent').append(newHint);
    
  if (hangman.hintsUsed === 3) {
    $('#hint').removeClass().addClass('btn btn-secondary disableClick');
  }
}

function checkForWin() {
  let playerWon = $('.guessed-right > .hide-letter').length === 0;
  
  if (playerWon) {
    gameOver('win');
  }
}

function gameOver(win) {

  hangman.newGame = false;
  $('#newGame').show();
  $('#moreGames').show().click(()=>window.location='https://www.artfervour.com/af-games');
  $('.results-social').show();
  $('#alphabet').hide();
  $('#question-text').hide();
  $('#hintParent').hide();
  $('.hide-letter').removeClass().addClass('show-letter');
    
  let mssg = $('#category-label'),
      won = '<span>You Won!</span>',
      lost = '<span>You Lost!</span>';
    
  mssg.empty().removeClass('badge-secondary');
    
  if (win) {
    mssg.append(won);
  } else {
    mssg.append(lost);
  }
}

/*
initialize requests /word endpoint, response object is... 
  newGame = {
    category: random category (movie, sport, celebrity, app, game, music),
    word: random element from category,
    answer: str array of word characters; letters are uppercase,
    newGame: true (enables checking guess/button clicks),
    hints: str array with 3 str hint elements,
    hintsUsed: 0 (hints used of 3),
    stickFigure: str array of stick figure id's (head, body, arms, legs),
    stickIndex: 0 (stick figure parts drawn/incorrect guesses of 6)
  }
*/