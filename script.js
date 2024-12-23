let canvas = document.getElementById("canvas");
const button = document.getElementById("button");
const cont = document.getElementById("cont");
let easy = document.getElementById("easy");
let medium = document.getElementById("medium");
let hard = document.getElementById("hard");
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;
const BALL_SIZE = 20;
let ballCoord;
let xSpeed;
let ySpeed;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 80;
const PADDLE_OFFSET = 20;
let leftPaddleTop = 80;
let rightPaddleTop = 40;
let leftScore = 0;
let rightScore = 0;
let maxCompSpeed = 2;
let gameOver = false;
const paddleHitSound = new Audio("sounds/paddleHit.wav");
const wallHitSound = new Audio("sounds/wallHit.wav");
const scoreSound = new Audio("sounds/score.wav");
let pauza = false;
let started =false;
let tempTimeOut = false;
let keyPressedPauza = false;
let speedTimer;

button.addEventListener ("click", function(){
this.style.display = "none";
cont.style.display = "none";
canvas.style.display = "block";
started = true;
if(easy.checked){
    maxCompSpeed = 2;
    speedTimer = 30;
}
else if(medium.checked){
    maxCompSpeed = 2.4;
    speedTimer = 20;
}
else{
    maxCompSpeed = 3;
    speedTimer = 10;
}
resetTopka();
gameLoop();

});
document.addEventListener("mousemove", function(ev){
    // Изчисляване на новата позиция на ракетата
   let newY = ev.y - canvas.offsetTop;
   if (newY < 0) newY = 0; // Горна граница
   if (newY > height - PADDLE_HEIGHT) newY = height - PADDLE_HEIGHT; // Долна граница
   rightPaddleTop = newY;
});
document.addEventListener("click", function(){
    if(gameOver){
        location.reload();
    }
});
document.addEventListener("keydown", function(e){
    if(e.code === 'Space' && started === true && tempTimeOut === false && !keyPressedPauza){
       pauza = !pauza;
       keyPressedPauza = true; // Клавишът е натиснат, задава се флагът

       if(pauza === true){
        printNaPauza();
    }
    }
});

document.addEventListener("keyup", function (e) {
    if (e.code === 'Space') {
        keyPressedPauza = false; // Флагът се изчиства, когато клавишът бъде отпуснат
    }
});
// Поставя играта на пауза, когато прозорецът загуби фокус
window.addEventListener("blur", function () {
    if (started && !gameOver) {
        pauza = true;
        printNaPauza();
    }
});


function drawOsnovaTopkaHilkiScore(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#777";// Средна линия
    ctx.fillRect(width /2 ,0, 4, height);

    ctx.fillStyle = "white";
    ctx.fillRect(ballCoord.x, ballCoord.y, BALL_SIZE, BALL_SIZE);

    ctx.fillRect(PADDLE_OFFSET, leftPaddleTop, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(width - PADDLE_OFFSET- PADDLE_WIDTH, rightPaddleTop, PADDLE_WIDTH, PADDLE_HEIGHT);
    // Draw scores
    ctx.font = "30px monospace";
    ctx.textAlign = "left";
    ctx.fillText(leftScore.toString(), width/2 - 50, 50);
    ctx.textAlign = "right";
    ctx.fillText(rightScore.toString(), width/2 + 50 , 50);
}
function updateTopkaCoordHilka(){
    ballCoord.x = ballCoord.x + xSpeed;
    ballCoord.y = ballCoord.y + ySpeed;
    dvizhiHilkata();
}
function checkCollision(){
    // Правя обекти topka i leftHilka
    let topka = {
        top: ballCoord.y,
        left: ballCoord.x,
        right: ballCoord.x + BALL_SIZE,
        bottom: ballCoord.y + BALL_SIZE
    };
    let leftHilka = {top: leftPaddleTop, left: PADDLE_OFFSET, right: PADDLE_OFFSET + PADDLE_WIDTH, bottom: leftPaddleTop + PADDLE_HEIGHT};
    let rightHilka = {top: rightPaddleTop, left: width - PADDLE_OFFSET - PADDLE_WIDTH, right: width - PADDLE_OFFSET, bottom: rightPaddleTop + PADDLE_HEIGHT};
    
    if (imaHilkaDopir(topka,leftHilka)){
        paddleHitSound.currentTime = 0;
        paddleHitSound.play(); // Пускане на звук за удар с ракета

        //Ako ima dopir лява hilka topka
        let distFromTop = topka.top - leftHilka.top;
        let distFromBot = leftHilka.bottom - topka.bottom;;
        cambiaYspeed(distFromTop, distFromBot);

        xSpeed = Math.abs(xSpeed);
    }
    if (imaHilkaDopir(topka, rightHilka)){
        paddleHitSound.currentTime = 0;
        paddleHitSound.play(); // Пускане на звук за удар с ракета

        //Ako ima dopir dyasna hilka topka
        let distFromTop = topka.top - rightHilka.top;
        let distFromBot = rightHilka.bottom - topka.bottom;
        cambiaYspeed(distFromTop, distFromBot);
        xSpeed = -Math.abs(xSpeed);
    }
    if (topka.left < PADDLE_OFFSET/2){
        tempTimeOut = true;
        scoreSound.currentTime = 0;
        scoreSound.play(); // Звук за отбелязване
        rightScore ++;
        malkaPauza();
        
    }
    if (topka.right > width - PADDLE_OFFSET/2){
        tempTimeOut = true;
        scoreSound.currentTime = 0;
        scoreSound.play(); // Звук за отбелязване
        leftScore ++;
        
        malkaPauza();
    }
    if(leftScore > 9 || rightScore > 9){
        gameOver = true
        canvas.style.cursor = "default";
    }
    // Топката да отскача при допир със стената
    /* if(topka.left < 0 || topka.right > width){
        xSpeed = - xSpeed;
    } */
    if(topka.top < 0 || topka.bottom > height){
        wallHitSound.currentTime = 0;
        wallHitSound.play(); // Пускане на звук за удар със стената
        ySpeed = - ySpeed;
    }
    function malkaPauza(){
    
    pauza = true; //Това спира основния таймер.
    // целта е да начертая топката на ръба в ляво или на ръба вдясно.
    // Проверявам дали топката се намира в лявата половина или в дясната половина.
    if(ballCoord.x < width/2){
        ballCoord.x = 0;
        }
    else{ballCoord.x = width-BALL_SIZE;}
    drawOsnovaTopkaHilkiScore();
        
    setTimeout(() => {
    resetTopka();  
    }, 1500);
        
    }
}
function imaHilkaDopir(topka, hilka){
    return (topka.left < hilka.right && 
        topka.right > hilka.left &&
        topka.top < hilka.bottom &&
        topka.bottom > hilka.top);
}
function cambiaYspeed(gornaDist, dolnaDist){
    if(gornaDist < 10 ){
        ySpeed = ySpeed - 0.5;
    }
    else if(dolnaDist < 10){
        ySpeed = ySpeed + 0.5
    }
}

function resetTopka(){
            if (document.hasFocus()){
                pauza = false; //Това е заради изчакването след пропускане на топката Спира gameLoop
            }
            else{
                pauza = true;
            }
            
            tempTimeOut = false; //Свършило е изчакването  и може да работи ПАУЗАТА.
            if(leftPaddleTop < height/2){
                ballCoord = {x: PADDLE_OFFSET, y: height - BALL_SIZE};
                xSpeed = 4;
                ySpeed = -1.5;}
            else{ballCoord = {x: PADDLE_OFFSET, y: BALL_SIZE};
                xSpeed = 4;
                ySpeed = 1.5;}
        
        
}
function dvizhiHilkata(){
    if(ballCoord.y < leftPaddleTop){
        leftPaddleTop = leftPaddleTop - maxCompSpeed;
    }
    else if((ballCoord.y + BALL_SIZE) > (leftPaddleTop + PADDLE_HEIGHT)){
        leftPaddleTop = leftPaddleTop + maxCompSpeed;
    }
}
function napishiKrai(){
    ctx.fillStyle = "rgb(210, 40, 60)";
    ctx.font = "bold 3rem Arial";
    ctx.textAlign = "center";
    ctx.fillText("G A M E  O V E R !",width/2, height /2);
    ctx.fillStyle = "rgb(253, 247, 96)";
    ctx.font = "1rem Arial";
    ctx.fillText("Kлик или 'Пауза' за нова игра.", width/2, height /1.4);
}
function printNaPauza(){
    if(gameOver === false){
        ctx.textAlign = "center";
        ctx.font = "bold 2.4rem Arial";
        ctx.fillStyle = "#999";
        ctx.fillText("На пауза!", width/2, 90 );
    }
    else{
        location.reload();
    }
        
}

function gameLoop(){
    if (!pauza){   
        drawOsnovaTopkaHilkiScore();
        updateTopkaCoordHilka();
        checkCollision();
        if (gameOver){
            drawOsnovaTopkaHilkiScore();
            napishiKrai();
        }
        else{
            setTimeout(gameLoop, speedTimer);
        }
    }
    else{
        setTimeout(gameLoop, 20);
    }   
}



