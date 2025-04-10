let isGameStarted = false;
let currentRound = 0;
let isRoundCleared = false;
let CARD_PER_COLUMN = 6;
let CARD_PER_ROW = 5;
let isFlipping = false;
let flippedCards = [];
let timerId;

let score = 0;

let roundTime = [20, 30, 40, 50, 60];
let roundColumn = [3, 6, 6, 6, 6];
let roundRow = [2, 2, 3, 4, 5];

const flipContainer = document.querySelector('.flip');
const cardValues = [];
const newCard = [];

let startPoint = {X: 0, Y: 0};

var timerContainer = document.querySelector(".timer")

/**
 * 게임 시작 함수
 */
function gameStart() {
    document.getElementById("score").textContent = score;
    currentRound = 0;
    gameSet(currentRound);
    isGameStarted = true;
    startTimer(roundTime[currentRound]);
}

/**
 * 게임 세팅하는 함수
 * @param {*} round 
 */
function gameSet(round) {
    CARD_PER_COLUMN = roundColumn[round];
    CARD_PER_ROW = roundRow[round];

    // 카드 및 배열 초기화
    flipContainer.innerHTML = "";
    cardValues.length = 0;
    newCard.length = 0;

    for (let i = 0; i < (CARD_PER_ROW * CARD_PER_COLUMN) / 2; i++) { // 두쌍
        cardValues.push(i);
        cardValues.push(i);
    }

    //셔플
    cardValues.sort(() => Math.random() - 0.5);

    for (let i = 0; i < CARD_PER_ROW * CARD_PER_COLUMN; i++) {
        newCard.push(createCard(cardValues[i]))
        flipContainer.appendChild(newCard[i]);
    }   

    flipContainer.style.display = 'grid';
    flipContainer.style.gridTemplateRows = `repeat(${CARD_PER_ROW}, 1fr)`;
    flipContainer.style.gridTemplateColumns = `repeat(${CARD_PER_COLUMN}, 1fr)`;
    flipContainer.style.gap = '1rem';
}

/**
 * 카드를 생성하는 함수
 * @returns Tag Card
 */
function createCard(value) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = value;
    card.currentRotate = {X: 0, Y: 0}; // 각 카드마다 개별적으로 회전 상태를 저장

    // 앞면 생성
    const front = document.createElement('div');
    front.classList.add('front');

    const frontHeading = document.createElement('h1');
    frontHeading.textContent = value;
    front.appendChild(frontHeading); // 앞면에 제목 추가

    // 뒷면 생성
    const back = document.createElement('div');
    back.classList.add('back');

    const backHeading = document.createElement('h1');
    backHeading.textContent = '뒷면';
    back.appendChild(backHeading); // 뒷면에 제목 추가

    // 앞면과 뒷면을 카드에 추가
    card.appendChild(front);
    card.appendChild(back);

    rotateCard(card);
    
    return card;
}

/**
 * 드래그 계산
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
const calculateRotation = (start, end) => {
    const tmpX = end.X - start.X;
    const tmpY = end.Y - start.Y;

    if (Math.abs(tmpX) >= Math.abs(tmpY)) {
        return {X: 0, Y: tmpX > 0 ? 180 : -180};
    }
    else {
        return {X: tmpY > 0 ? 180 : -180, Y: 0};
    }
}

/**
 * 드래그 마우스 이벤트 생성 함수
 * @param {*} selectedCard 
 */
function rotateCard(selectedCard) {
    selectedCard.addEventListener('mousedown', (e) => {
        startPoint = {X: e.pageX, Y: e.pageY};
    });

    selectedCard.addEventListener('mouseup', (e) => {
        const endPoint = {X: e.pageX, Y: e.pageY};
        const rotation = calculateRotation(startPoint, endPoint);

        if (isFlipping || selectedCard.classList.contains('flipped')) {
            return;
        }

        selectedCard.currentRotate.X += rotation.X;
        selectedCard.currentRotate.Y += rotation.Y;
        
        flipCard(selectedCard);
    });
}

/**
 * 모든 카드가 뒤집혀져 있는지 확인하는 함수
 */
function checkRoundClear() {
    let allFlipped = document.querySelectorAll('.card.flipped').length === CARD_PER_ROW * CARD_PER_COLUMN;
    if (allFlipped) {
        if (timerId) clearInterval(timerId); // 기존 타이머 정리
        setTimeout(nextRound, 1000);
    }
}

/**
 * 회전 후 같은지 판별 하는 함수
 * @param {card} selectedCard 
 * @returns 
 */
function flipCard(selectedCard) {
    if (!isGameStarted || isFlipping || selectedCard.classList.contains('flipped')) {
        return;
    }
    
    selectedCard.classList.add('flipped');
    flippedCards.push(selectedCard);
    selectedCard.style.transform = `rotateX(${selectedCard.currentRotate.X}deg) rotateY(${selectedCard.currentRotate.Y}deg)`;

    if (flippedCards.length === 2) {
        isFlipping = true;

        let [firstCard, secondCard] = flippedCards;
        if (firstCard.dataset.value === secondCard.dataset.value) {
            score += 55;
            document.getElementById("score").textContent = score;
            flippedCards = [];
            isFlipping = false;
            checkRoundClear();
        } else {
            setTimeout(() => { //  초 후 제거
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                firstCard.currentRotate = {X: 0, Y: 0};
                secondCard.currentRotate = {X: 0, Y: 0};
                flippedCards = [];
                isFlipping = false;
                firstCard.style.transform = `rotateX(${selectedCard.currentRotate.X}deg) rotateY(${selectedCard.currentRotate.Y}deg)`;
                secondCard.style.transform = `rotateX(${selectedCard.currentRotate.X}deg) rotateY(${selectedCard.currentRotate.Y}deg)`;
            }, 1000);
        }
    }
}

/**
 * 타이머 시작 함수
 */
function startTimer(sec) {
    var num = 360;

    timerId = setInterval(() => {
        sec--;

        timerContainer.style.setProperty("--timerA", num + "deg")
        timerContainer.style.background = ` conic-gradient(#E1E2E7 var(--timerA) ,#E1E2E7 0deg ,#293047 0deg,#293047 360deg)`
        num = num - (num / sec);

        document.getElementById('timerDisplay').textContent = sec - 1 + "Sec";

        if (sec <= 0) {
            clearInterval(timerId);
            isGameStarted = false;
            document.getElementById('timerDisplay').textContent = "end";
        }
    }, 1000);
}

/**
 * 다음 라운드로 이동하는 함수
 */
function nextRound() {
    score += 550;
    document.getElementById("score").textContent = score;
    currentRound++;
    
    if (currentRound < roundColumn.length) {
        gameSet(currentRound);
        startTimer(roundTime[currentRound]);
    } else {
        alert("🎉 Congratulations!");
        isGameStarted = false;
    }
}

gameStart();