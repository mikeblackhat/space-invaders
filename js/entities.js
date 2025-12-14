class Player {
    constructor() {
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.x = SCREEN_WIDTH / 2 - this.width / 2;
        this.y = SCREEN_HEIGHT - this.height - 20;
        this.color = '#0f0';
        this.shootDelay = 0;
        this.active = true;
        this.weaponType = BULLET_TYPE.NORMAL;
        this.powerUpTimer = 0;
        this.hasShield = false;
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        // Simple ship shape
        ctx.fillRect(this.x + 4, this.y, this.width - 8, this.height - 10);
        ctx.fillRect(this.x, this.y + 12, this.width, 12);
        ctx.fillRect(this.x + 18, this.y - 6, 4, 6);

        // Draw Shield
        if (this.hasShield) {
            ctx.strokeStyle = '#0000ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    update() {
        if (!this.active) return;
        // Added KeyA for Left
        if ((keys['ArrowLeft'] || keys['KeyA']) && this.x > 0) this.x -= PLAYER_SPEED;
        // Added KeyD for Right
        if ((keys['ArrowRight'] || keys['KeyD']) && this.x + this.width < SCREEN_WIDTH) this.x += PLAYER_SPEED;

        if (this.shootDelay > 0) this.shootDelay--;
        if (this.powerUpTimer > 0) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) this.weaponType = BULLET_TYPE.NORMAL;
        }
    }

    shoot() {
        if (!this.active) return;

        if (this.weaponType === BULLET_TYPE.NORMAL) {
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED, '#0f0'));
        } else if (this.weaponType === BULLET_TYPE.FAST) {
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED * 2, '#ffff00'));
        } else if (this.weaponType === BULLET_TYPE.SPREAD) {
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED, '#00ffff'));
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED, '#00ffff', -2));
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED, '#00ffff', 2));
        } else if (this.weaponType === BULLET_TYPE.TRIPLE) {
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED * 1.2, '#ff00ff'));
            bullets.push(new Bullet(this.x, this.y - 10, -BULLET_SPEED * 1.2, '#ff00ff'));
            bullets.push(new Bullet(this.x + this.width - 4, this.y - 10, -BULLET_SPEED * 1.2, '#ff00ff'));
        } else if (this.weaponType === BULLET_TYPE.FAST_SPREAD) {
            // Spread but fast
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED * 2, '#00ffff'));
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED * 2, '#00ffff', -2));
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED * 2, '#00ffff', 2));
        } else if (this.weaponType === BULLET_TYPE.FAST_TRIPLE) {
            // Triple but fast
            bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 10, -BULLET_SPEED * 2, '#ff00ff'));
            bullets.push(new Bullet(this.x, this.y - 10, -BULLET_SPEED * 2, '#ff00ff'));
            bullets.push(new Bullet(this.x + this.width - 4, this.y - 10, -BULLET_SPEED * 2, '#ff00ff'));
        }

        sounds.shoot();
        const isFast = (this.weaponType === BULLET_TYPE.FAST || this.weaponType === BULLET_TYPE.FAST_SPREAD || this.weaponType === BULLET_TYPE.FAST_TRIPLE);
        this.shootDelay = isFast ? 10 : 20;
    }

    activatePowerUp(type) {
        if (type === BULLET_TYPE.SHIELD) {
            this.hasShield = true;
            return;
        }

        // Combination Logic
        if (type === BULLET_TYPE.FAST) {
            if (this.weaponType === BULLET_TYPE.SPREAD || this.weaponType === BULLET_TYPE.FAST_SPREAD) {
                this.weaponType = BULLET_TYPE.FAST_SPREAD;
            } else if (this.weaponType === BULLET_TYPE.TRIPLE || this.weaponType === BULLET_TYPE.FAST_TRIPLE) {
                this.weaponType = BULLET_TYPE.FAST_TRIPLE;
            } else {
                this.weaponType = BULLET_TYPE.FAST;
            }
        }
        else if (type === BULLET_TYPE.SPREAD) {
            // Keep fast if we have it
            if (this.weaponType === BULLET_TYPE.FAST || this.weaponType === BULLET_TYPE.FAST_SPREAD || this.weaponType === BULLET_TYPE.FAST_TRIPLE) {
                this.weaponType = BULLET_TYPE.FAST_SPREAD;
            } else {
                this.weaponType = BULLET_TYPE.SPREAD;
            }
        }
        else if (type === BULLET_TYPE.TRIPLE) {
            // Keep fast if we have it
            if (this.weaponType === BULLET_TYPE.FAST || this.weaponType === BULLET_TYPE.FAST_SPREAD || this.weaponType === BULLET_TYPE.FAST_TRIPLE) {
                this.weaponType = BULLET_TYPE.FAST_TRIPLE;
            } else {
                this.weaponType = BULLET_TYPE.TRIPLE;
            }
        } else {
            this.weaponType = type;
        }

        this.powerUpTimer = 600; // 10 seconds refresh
    }
}

class Bullet {
    constructor(x, y, dy, color, dx = 0) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.dy = dy;
        this.dx = dx;
        this.color = color;
        this.markedForDeletion = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.dy;
        this.x += this.dx;
        if (this.y < 0 || this.y > SCREEN_HEIGHT) this.markedForDeletion = true;
    }
}

class Alien {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = ALIEN_WIDTH;
        this.height = ALIEN_HEIGHT;
        this.type = type; // 0, 1, 2 for different graphics
        this.markedForDeletion = false;
        this.frame = 0; // Animation frame
    }

    draw() {
        ctx.fillStyle = '#fff';
        // Draw simple pixel art based on type
        // Just rectangles for now to keep it simple but distinguishable
        if (this.type === 0) { // Squid
            ctx.fillStyle = '#ff00ff'; // Magenta
        } else if (this.type === 1) { // Crab
            ctx.fillStyle = '#00ffff'; // Cyan
        } else { // Octopus
            ctx.fillStyle = '#ffff00'; // Yellow
        }

        const toggle = Math.floor(frames / 30) % 2 === 0;

        // Body
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
        // Arms/Legs animation
        if (toggle) {
            ctx.fillRect(this.x, this.y, 4, 8);
            ctx.fillRect(this.x + this.width - 4, this.y, 4, 8);
            ctx.fillRect(this.x + 4, this.y + this.height - 4, 4, 4);
            ctx.fillRect(this.x + this.width - 8, this.y + this.height - 4, 4, 4);
        } else {
            ctx.fillRect(this.x, this.y + 8, 4, 8);
            ctx.fillRect(this.x + this.width - 4, this.y + 8, 4, 8);
            ctx.fillRect(this.x + 2, this.y + this.height - 4, 4, 4);
            ctx.fillRect(this.x + this.width - 6, this.y + this.height - 4, 4, 4);
        }
    }

    update(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 30 + Math.random() * 20;
        this.color = color;
        this.markedForDeletion = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 50;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.life <= 0) this.markedForDeletion = true;
    }
}

class Shield {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 40;
        this.blocks = [];

        // Create grid of blocks
        const blockSize = 5;
        for (let r = 0; r < this.height / blockSize; r++) {
            for (let c = 0; c < this.width / blockSize; c++) {
                // Create arch shape
                if (r < 2 && c > 3 && c < 8) continue; // Top notch
                if (r > 5 && c > 3 && c < 8) continue; // Bottom arch

                this.blocks.push({
                    x: x + c * blockSize,
                    y: y + r * blockSize,
                    width: blockSize,
                    height: blockSize,
                    active: true
                });
            }
        }
    }

    draw() {
        ctx.fillStyle = '#0f0';
        this.blocks.forEach(b => {
            if (b.active) ctx.fillRect(b.x, b.y, b.width, b.height);
        });
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
        this.color = POWERUP_COLORS[type - 1]; // Types 1, 2, 3
        this.markedForDeletion = false;
        this.dy = 2;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y);
        ctx.lineTo(this.x + 20, this.y + 10);
        ctx.lineTo(this.x + 10, this.y + 20);
        ctx.lineTo(this.x, this.y + 10);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        let text = '';
        if (this.type === 1) text = 'F';
        else if (this.type === 2) text = 'S';
        else if (this.type === 3) text = 'T';
        else if (this.type === 4) text = 'Sh';
        ctx.fillText(text, this.x + 10, this.y + 14);
    }

    update() {
        this.y += this.dy;
        if (this.y > SCREEN_HEIGHT) this.markedForDeletion = true;
    }
}

class UFO {
    constructor() {
        this.width = 48;
        this.height = 21;
        this.direction = Math.random() < 0.5 ? 1 : -1;
        this.x = this.direction === 1 ? -this.width : SCREEN_WIDTH;
        this.y = 45;
        this.speed = 3;
        this.markedForDeletion = false;
        sounds.ufo();
    }

    draw() {
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y + 6);
        ctx.lineTo(this.x + this.width - 8, this.y + 6);
        ctx.lineTo(this.x + this.width / 2, this.y - 4);
        ctx.fill();
        ctx.fillRect(this.x, this.y + 6, this.width, 8);
        ctx.fillRect(this.x + 10, this.y + 14, this.width - 20, 4);
    }

    update() {
        this.x += this.speed * this.direction;
        if ((this.direction === 1 && this.x > SCREEN_WIDTH) ||
            (this.direction === -1 && this.x < -this.width)) {
            this.markedForDeletion = true;
        }
    }
}

class Boss {
    constructor(level) {
        this.width = 100;
        this.height = 60;
        this.x = SCREEN_WIDTH / 2 - this.width / 2;
        this.y = 60;

        // Difficulty Scaling
        // Level 3 (First Boss): Easy. HP ~35. Speed 2.5. Slow shoot.
        // Level 6 (Second Boss): Medium. HP ~80. Speed 3.5. Medium shoot.
        // Level 9 (Third Boss): Hard. HP ~150. Speed 5. Fast shoot.

        const difficultyMultiplier = level / 3; // 1, 2, 3...

        this.hp = 20 + (Math.pow(difficultyMultiplier, 2) * 15); // Quadratic HP scaling
        this.maxHp = this.hp;

        this.speed = 2 + (difficultyMultiplier * 0.8);
        this.direction = 1;
        this.markedForDeletion = false;

        this.shootTimer = 0;
        // Shoot cooldown decreases as difficulty increases
        this.shootCooldown = Math.max(20, 50 - (difficultyMultiplier * 5));
        this.bossLevel = difficultyMultiplier; // 1, 2, 3...
    }

    draw() {
        // Body color changes with difficulty
        ctx.fillStyle = this.bossLevel >= 3 ? '#550000' : (this.bossLevel >= 2 ? '#aa0000' : '#ff0000');
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Eyes
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x + 20, this.y + 20, 15, 15);
        ctx.fillRect(this.x + this.width - 35, this.y + 20, 15, 15);
        // Mouth
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 30, this.y + 45, 40, 5);

        // HP Bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 10, this.width * (this.hp / this.maxHp), 5);
    }

    update() {
        this.x += this.speed * this.direction;
        if (this.x <= 0 || this.x + this.width >= SCREEN_WIDTH) {
            this.direction *= -1;
        }

        // Shoot logic
        this.shootTimer++;
        if (this.shootTimer > this.shootCooldown) {
            this.shootTimer = 0;

            // Pattern varies by difficulty
            if (this.bossLevel === 1) {
                // Easy: 3 simple bullets
                enemyBullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 5, '#ff0000'));
                enemyBullets.push(new Bullet(this.x, this.y + this.height, 5, '#ff0000', -1));
                enemyBullets.push(new Bullet(this.x + this.width, this.y + this.height, 5, '#ff0000', 1));
            } else if (this.bossLevel === 2) {
                // Medium: 5 bullets
                enemyBullets.push(new Bullet(this.x + this.width / 2, this.y + this.height, 6, '#ff0000'));
                enemyBullets.push(new Bullet(this.x, this.y + this.height, 5, '#ff0000', -1));
                enemyBullets.push(new Bullet(this.x + this.width, this.y + this.height, 5, '#ff0000', 1));
                enemyBullets.push(new Bullet(this.x, this.y + this.height, 6, '#ff0000', -2));
                enemyBullets.push(new Bullet(this.x + this.width, this.y + this.height, 6, '#ff0000', 2));
            } else {
                // Hard: Spray
                for (let i = 0; i < 7; i++) {
                    enemyBullets.push(new Bullet(this.x + (i * 15), this.y + this.height, 6 + Math.random() * 2, '#ff0000', (i - 3) * 0.5));
                }
            }

            sounds.shoot();
        }
    }
}
