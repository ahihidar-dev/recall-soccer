const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: 5,
    dy: 2,
    speed: 5
};

const player1 = {
    x: 50,
    y: canvas.height / 2 - 25,
    width: 20,
    height: 50,
    speed: 5,
    dy: 0,
    score: 0,
    jumping: false,
    gravity: 0.5,
    jumpForce: -12
};

const player2 = {
    x: canvas.width - 70,
    y: canvas.height / 2 - 25,
    width: 20,
    height: 50,
    speed: 5,
    dy: 0,
    score: 0,
    jumping: false,
    gravity: 0.5,
    jumpForce: -12
};

// Goal posts
const goal1 = { x: 0, y: canvas.height / 2 - 50, width: 10, height: 100 };
const goal2 = { x: canvas.width - 10, y: canvas.height / 2 - 50, width: 10, height: 100 };

// Keyboard controls
const keys = {
    w: false,
    a: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Event listeners for keyboard
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Check collision between two objects
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.radius * 2 > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.radius * 2 > obj2.y;
}

// Update game state
function update() {
    // Player 1 movement
    if (keys['a']) player1.x = Math.max(0, player1.x - player1.speed);
    if (keys['d']) player1.x = Math.min(canvas.width / 2 - 50, player1.x + player1.speed);
    if (keys['w'] && !player1.jumping) {
        player1.dy = player1.jumpForce;
        player1.jumping = true;
    }

    // Player 2 movement
    if (keys['ArrowLeft']) player2.x = Math.max(canvas.width / 2 + 30, player2.x - player2.speed);
    if (keys['ArrowRight']) player2.x = Math.min(canvas.width - player2.width, player2.x + player2.speed);
    if (keys['ArrowUp'] && !player2.jumping) {
        player2.dy = player2.jumpForce;
        player2.jumping = true;
    }

    // Apply gravity to players
    [player1, player2].forEach(player => {
        player.y += player.dy;
        player.dy += player.gravity;

        // Ground collision
        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
            player.dy = 0;
            player.jumping = false;
        }
    });

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy * 0.9;
    }

    // Ball collision with players
    [player1, player2].forEach(player => {
        if (checkCollision(ball, {
            x: player.x - ball.radius,
            y: player.y - ball.radius,
            width: player.width + ball.radius * 2,
            height: player.height + ball.radius * 2
        })) {
            // Calculate angle based on where ball hits the player
            const hitPosition = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
            const angle = hitPosition * Math.PI / 4; // -45 to 45 degrees
            
            // Set new ball direction
            const direction = player === player1 ? 1 : -1;
            ball.dx = Math.cos(angle) * ball.speed * direction;
            ball.dy = Math.sin(angle) * ball.speed;
            
            // Add player's vertical velocity to the ball
            ball.dy += player.dy * 0.5;
        }
    });

    // Check for goals
    if (ball.x < 0) {
        player2.score++;
        resetBall(1);
    } else if (ball.x > canvas.width) {
        player1.score++;
        resetBall(-1);
    }

    // Update score display
    document.getElementById('player1').textContent = player1.score;
    document.getElementById('player2').textContent = player2.score;
}

// Reset ball position
function resetBall(direction) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5 * direction;
    ball.dy = (Math.random() - 0.5) * 4;
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw field
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw goals
    ctx.fillStyle = '#000';
    ctx.fillRect(goal1.x, goal1.y, goal1.width, goal1.height);
    ctx.fillRect(goal2.x, goal2.y, goal2.width, goal2.height);
    
    // Draw players
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
