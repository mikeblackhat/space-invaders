// --- Input Handling ---
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    // Added KeyW and ArrowUp for shooting
    if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && !isGameOver && document.getElementById('startScreen').classList.contains('hidden')) {
        if (!player.shootDelay) {
            player.shoot();
        }
    }
});

window.addEventListener('keyup', e => keys[e.code] = false);

document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startScreen').classList.add('hidden');
    initGame();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    initGame();
});

// Click to Shoot
// Click to Shoot
canvas.addEventListener('click', () => {
    if (!isGameOver && document.getElementById('startScreen').classList.contains('hidden')) {
        if (!player.shootDelay) {
            player.shoot();
        }
    }
});

// --- Game Logic ---
function initGame() {
    score = 0;
    level = 1;
    lives = 5;
    isGameOver = false;
    player = new Player();
    player.hasShield = false;
    bullets = [];
    enemyBullets = [];
    particles = [];
    shields = [];
    ufo = null;
    boss = null;
    alienDirection = 1;
    alienStepCooldown = Math.max(5, 60 - (level * 5));

    updateScore();
    updateLives();
    document.getElementById('levelEl').innerText = level;
    createAliens();
    createShields();
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoop();
}

function nextLevel() {
    level++;
    document.getElementById('levelEl').innerText = level;
    bullets = [];
    powerUps = [];
    enemyBullets = [];
    alienDirection = 1;
    // Speed up aliens
    alienStepCooldown = Math.max(2, 40 - (level * 4));
    // Speed up aliens
    alienStepCooldown = Math.max(2, 40 - (level * 4));

    // Boss Level?
    if (level % 3 === 0) {
        boss = new Boss(level);
    } else {
        createAliens();
    }

    // Repair shields slightly? Or new shields? Let's do new shields for simplicity
    createShields();
}

function createAliens() {
    aliens = [];
    const formation = (level - 1) % 4; // Cycles 0, 1, 2, 3

    for (let row = 0; row < ALIEN_ROWS; row++) {
        for (let col = 0; col < ALIEN_COLS; col++) {
            let shouldAdd = false;

            switch (formation) {
                case 0: // Rectangle (Level 1, 5...)
                    shouldAdd = true;
                    break;
                case 1: // Pyramid (Level 2, 6...)
                    // Center col is 5.
                    // Row 0: Only col 5 (diff 0 <= 0?) No, top is row 0.
                    // We want top to be narrow (1 alien), bottom wide (11 aliens).
                    // In a 5 row grid? 
                    // Let's make it simpler.
                    // Row 0: Col 5. (Width 1)
                    // Row 1: Col 4-6. (Width 3)
                    // Row 2: Col 3-7. (Width 5)
                    // Row 3: Col 2-8. (Width 7)
                    // Row 4: Col 1-9. (Width 9)
                    // Math.abs(col - 5) <= row
                    if (Math.abs(col - 5) <= row) shouldAdd = true;
                    break;
                case 2: // Inverted Pyramid (Level 3, 7...)
                    // Row 0: All.
                    // Row 3: Narrow.
                    // Math.abs(col - 5) <= (4 - row) + 1 ?
                    if (Math.abs(col - 5) <= (ALIEN_ROWS - 1 - row + 1)) shouldAdd = true;
                    break;
                case 3: // Checkerboard / Split (Level 4, 8...)
                    if ((row + col) % 2 === 0) shouldAdd = true;
                    break;
            }

            if (shouldAdd) {
                let type = 0;
                if (row < 1) type = 2;
                else if (row < 3) type = 1;
                else type = 0;
                const x = ALIEN_OFFSET_LEFT + col * (ALIEN_WIDTH + ALIEN_PADDING);
                const y = ALIEN_OFFSET_TOP + row * (ALIEN_HEIGHT + ALIEN_PADDING);
                aliens.push(new Alien(x, y, type));
            }
        }
    }
}

function createShields() {
    shields = [];
    const shieldCount = 4;
    const spacing = SCREEN_WIDTH / shieldCount;
    for (let i = 0; i < shieldCount; i++) {
        shields.push(new Shield(spacing * i + spacing / 2 - 30, SCREEN_HEIGHT - 150));
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateScore() {
    document.getElementById('scoreEl').innerText = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('space-invaders-highscore', highScore);
        document.getElementById('highScoreEl').innerText = highScore;
    }
}

function updateLives() {
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '♥ ';
    document.getElementById('livesEl').innerText = hearts;
}

function gameOver() {
    isGameOver = true;
    document.getElementById('finalScoreEl').innerText = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    sounds.playerDie();
}

function checkCollisions() {
    // Player Bullets hitting Aliens
    bullets.forEach(bullet => {
        aliens.forEach(alien => {
            if (!bullet.markedForDeletion && !alien.markedForDeletion &&
                bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {

                bullet.markedForDeletion = true;
                alien.markedForDeletion = true;
                createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, '#fff');
                sounds.alienDie();

                // Score based on type
                if (alien.type === 0) score += 10;
                else if (alien.type === 1) score += 20;
                else score += 30;
                updateScore();
                // Increase speed as aliens die
                alienStepCooldown *= 0.98;

                // Spawn PowerUp Chance (10%)
                if (Math.random() < 0.1) {
                    const type = Math.floor(Math.random() * 4) + 1; // 1, 2, 3 or 4
                    powerUps.push(new PowerUp(alien.x, alien.y, type));
                }
            }
        });

        // Bullet hitting UFO
        if (ufo && !bullet.markedForDeletion && !ufo.markedForDeletion &&
            bullet.x < ufo.x + ufo.width &&
            bullet.x + bullet.width > ufo.x &&
            bullet.y < ufo.y + ufo.height &&
            bullet.y + bullet.height > ufo.y) {
            bullet.markedForDeletion = true;
            ufo.markedForDeletion = true;
            createExplosion(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, '#f00');
            score += Math.floor(Math.random() * 3 + 1) * 50; // Random bonus 50, 100, 150
            updateScore();
            sounds.alienDie();
        }
    });

    // Player Bullets hitting Boss
    if (boss) {
        bullets.forEach(bullet => {
            if (!bullet.markedForDeletion && !boss.markedForDeletion &&
                bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y) {

                bullet.markedForDeletion = true;
                boss.hp--;
                createExplosion(bullet.x, bullet.y, '#fff'); // Small hits

                // Spawn PowerUp Chance on Hit (5%)
                if (Math.random() < 0.05) {
                    const type = Math.floor(Math.random() * 4) + 1;
                    powerUps.push(new PowerUp(boss.x + boss.width / 2, boss.y + boss.height, type));
                }

                if (boss.hp <= 0) {
                    boss.markedForDeletion = true;
                    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff0000');
                    score += 1000 + (level * 100);
                    updateScore();
                    sounds.alienDie();

                    // Boss drops 3 powerups!
                    powerUps.push(new PowerUp(boss.x, boss.y + boss.height, 1));
                    powerUps.push(new PowerUp(boss.x + 40, boss.y + boss.height, 2));
                    powerUps.push(new PowerUp(boss.x + 80, boss.y + boss.height, 4));
                }
            }
        });
    }

    // Bullets hitting Shields
    [...bullets, ...enemyBullets].forEach(bullet => {
        shields.forEach(shield => {
            shield.blocks.forEach(block => {
                if (block.active && !bullet.markedForDeletion &&
                    bullet.x < block.x + block.width &&
                    bullet.x + bullet.width > block.x &&
                    bullet.y < block.y + block.height &&
                    bullet.y + bullet.height > block.y) {
                    block.active = false;
                    bullet.markedForDeletion = true;
                    createExplosion(block.x, block.y, '#0f0');
                }
            });
        });
    });

    // Enemy bullets hitting Player
    enemyBullets.forEach(bullet => {
        if (!bullet.markedForDeletion && player.active &&
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            bullets.markedForDeletion = true; // wait, bullet is this not bullets. bullet is item.
            // destroy the bullet
            bullet.markedForDeletion = true;
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#0f0');

            if (player.hasShield) {
                player.hasShield = false;
                sounds.step4(); // Shield break sound
            } else {
                lives--;
                updateLives();
                sounds.playerDie();

                if (lives <= 0) {
                    player.active = false;
                    setTimeout(gameOver, 1000);
                } else {
                    // Respawn / Clear bullets to give a chance
                    enemyBullets = [];
                }
            }
        }
    });

    // Aliens Colliding with Shields or Player (Game Over condition)
    aliens.forEach(alien => {
        if (alien.y + alien.height >= player.y) {
            player.active = false;
            gameOver();
        }

        shields.forEach(shield => {
            shield.blocks.forEach(block => {
                if (block.active &&
                    alien.x < block.x + block.width &&
                    alien.x + alien.width > block.x &&
                    alien.y < block.y + block.height &&
                    alien.y + alien.height > block.y) {
                    block.active = false;
                    createExplosion(block.x, block.y, '#0f0');
                }
            });
        });
    });

    // Player collects PowerUps
    powerUps.forEach(p => {
        if (!p.markedForDeletion && !player.markedForDeletion &&
            p.x < player.x + player.width &&
            p.x + p.width > player.x &&
            p.y < player.y + player.height &&
            p.y + p.height > player.y) {
            p.markedForDeletion = true;
            player.activatePowerUp(p.type);
            sounds.step1(); // reuse sound
        }
    });
}

function gameLoop() {
    if (isGameOver) {
        // Still draw particles
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        particles.forEach(p => p.draw());
        particles.forEach(p => p.update());
        return;
    }

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Updates
    frames++;

    // UFO Spawning logic
    if (!ufo) {
        ufoTimer++;
        if (ufoTimer > 600 + Math.random() * 1000) { // Random interval
            ufo = new UFO();
            ufoTimer = 0;
        }
    } else {
        ufo.update();
        ufo.draw();
        if (ufo.markedForDeletion) ufo = null;
    }

    if (boss) {
        boss.update();
        boss.draw();

        // Boss hitting shields
        shields.forEach(shield => {
            shield.blocks.forEach(block => {
                if (block.active &&
                    boss.x < block.x + block.width &&
                    boss.x + boss.width > block.x &&
                    boss.y < block.y + block.height &&
                    boss.y + boss.height > block.y) {
                    block.active = false;
                    createExplosion(block.x, block.y, '#0f0');
                }
            });
        });

        if (boss.markedForDeletion) {
            boss = null;
            nextLevel();
        }
    }

    player.update();
    player.draw();

    powerUps.forEach(p => p.update());
    powerUps = powerUps.filter(p => !p.markedForDeletion);
    powerUps.forEach(p => p.draw());

    bullets.forEach(b => b.update());
    bullets = bullets.filter(b => !b.markedForDeletion);
    bullets.forEach(b => b.draw());

    enemyBullets.forEach(b => b.update());
    enemyBullets = enemyBullets.filter(b => !b.markedForDeletion);
    enemyBullets.forEach(b => b.draw());

    particles.forEach(p => p.update());
    particles = particles.filter(p => !p.markedForDeletion);
    particles.forEach(p => p.draw());

    shields.forEach(s => s.draw());

    // Alien Movement Logic
    alienStepTimer++;
    let moveX = 0;
    let moveY = 0;
    let hitEdge = false;

    if (alienStepTimer > alienStepCooldown) {
        alienStepTimer = 0;

        // Check edges first
        aliens.forEach(alien => {
            if ((alienDirection === 1 && alien.x + alien.width > SCREEN_WIDTH - 20) ||
                (alienDirection === -1 && alien.x < 20)) {
                hitEdge = true;
            }
        });

        if (hitEdge) {
            alienDirection *= -1;
            moveY = ALIEN_HEIGHT / 2;
        } else {
            moveX = 10 * alienDirection;
        }

        // Play movement sound
        const beat = Math.floor(Date.now() / alienStepCooldown / 10) % 4;
        if (beat === 0) sounds.step1();
        else if (beat === 1) sounds.step2();
        else if (beat === 2) sounds.step3();
        else sounds.step4();
    }

    // Alien Shooting Logic
    // Chance to shoot based on level number and number of aliens remaining
    if (Math.random() < 0.01 + (level * 0.005) && aliens.length > 0) {
        // Pick random alien
        const shooter = aliens[Math.floor(Math.random() * aliens.length)];
        // Ensure it's a bottom alien in its column (simple approximation)
        enemyBullets.push(new Bullet(shooter.x + shooter.width / 2, shooter.y + shooter.height, 4 + level, '#fff'));
    }

    aliens.forEach(alien => {
        alien.update(moveX, moveY);
        alien.draw();
    });

    aliens = aliens.filter(a => !a.markedForDeletion);

    if (aliens.length === 0 && !boss) {
        nextLevel();
    }

    checkCollisions();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Starfield background effect
function drawStars() {
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * SCREEN_WIDTH;
        const y = Math.random() * SCREEN_HEIGHT;
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#888';
        ctx.fillRect(x, y, 2, 2);
    }
}

// Initial Draw
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
drawStars();
