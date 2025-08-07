// ===== 렌더링 함수들 =====
    drawPlayer() {
        const ctx = this.ctx;
        
        // 우주선 본체 (단순한 삼각형)
        ctx.fillStyle = this.player.color;
        ctx.beginPath();
        ctx.moveTo(this.player.x + this.player.width/2, this.player.y);
        ctx.lineTo(this.player.x, this.player.y + this.player.height);
        ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        ctx.closePath();
        ctx.fill();
        
        // 포탑들
        ctx.fillStyle = '#88aacc';
        this.player.turrets.forEach(turret => {
            ctx.fillRect(this.player.x + turret.x + this.player.width/2 - 3*this.gameScale, 
                        this.player.y + turret.y + this.player.height/2 - 3*this.gameScale, 
                        6*this.gameScale, 6*this.gameScale);
        });
        
        // 드론들
        this.drones.forEach(drone => {
            ctx.fillStyle = drone.color;
            const droneX = this.player.x + this.player.width/2 + drone.offsetX;
            const droneY = this.player.y + this.player.height/2 + drone.offsetY;
            ctx.beginPath();
            ctx.arc(droneX, droneY, 8 * this.gameScale, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawBullets() {
        const ctx = this.ctx;
        
        // 플레이어 총알
        ctx.fillStyle = '#ffee88';
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // 포탑 총알
        this.turretBullets.forEach(bullet => {
            ctx.fillStyle = bullet.color || '#88ff88';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // 적 총알
        this.enemyBullets.forEach(bullet => {
            ctx.fillStyle = bullet.color || '#ff8888';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // 기뢰
        this.mines.forEach(mine => {
            ctx.fillStyle = mine.color;
            ctx.beginPath();
            ctx.arc(mine.x, mine.y, mine.width/2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            
            if (enemy.type === 'cruiser' || enemy.type === 'carrier' || enemy.type === 'boss') {
                // 대형 적 (직사각형)
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // 보스 실드
                if (enemy.shieldHp > 0) {
                    ctx.strokeStyle = '#8888ff';
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = enemy.shieldHp / enemy.maxShieldHp;
                    ctx.strokeRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
                    ctx.globalAlpha = 1;
                }
            } else {
                // 일반 적 (원형)
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 체력바
            if (enemy.hp < enemy.maxHp) {
                const barWidth = enemy.width;
                const barHeight = 4 * this.gameScale;
                const healthRatio = enemy.hp / enemy.maxHp;
                
                ctx.fillStyle = '#663333';
                ctx.fillRect(enemy.x, enemy.y - barHeight - 2, barWidth, barHeight);
                
                ctx.fillStyle = '#88ff88';
                ctx.fillRect(enemy.x, enemy.y - barHeight - 2, barWidth * healthRatio, barHeight);
            }
        });
        
        // 미니 파이터
        ctx.fillStyle = '#aa6644';
        this.miniFighters.forEach(fighter => {
            ctx.beginPath();
            ctx.arc(fighter.x + fighter.width/2, fighter.y + fighter.height/2, fighter.width/2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawExplosions() {
        const ctx = this.ctx;
        this.explosions.forEach(explosion => {
            const alpha = explosion.life / explosion.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = explosion.color;
            ctx.fillRect(explosion.x - 2, explosion.y - 2, 4 * this.gameScale, 4 * this.gameScale);
        });
        ctx.globalAlpha = 1;
    }
    
    drawStars() {
        const ctx = this.ctx;
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
    
    // ===== 게임 상태 관리 =====
    showGameOver() {
        document.getElementById('finalScore').textContent = this.gameState.score;
        document.getElementById('gameOverModal').style.display = 'block';
        this.gameState.inGame = false;
        this.gameLoopRunning = false;
    }
    
    showStageClear() {
        const destination = DESTINATIONS[this.gameState.selectedDestination];
        let goldReward = Math.floor(this.gameState.score * 0.1 * destination.goldMultiplier);
        let diamondReward = 0;
        
        this.gameState.selectedCargos.forEach(cargoKey => {
            const cargo = CARGO_TYPES[cargoKey];
            diamondReward += cargo.reward * destination.diamondMultiplier;
        });
        
        this.gameState.gold += goldReward;
        this.gameState.diamonds += Math.floor(diamondReward);
        
        document.getElementById('rewardGold').textContent = goldReward;
        document.getElementById('rewardDiamonds').textContent = Math.floor(diamondReward);
        document.getElementById('stageClearModal').style.display = 'block';
        
        this.gameState.inGame = false;
        this.gameLoopRunning = false;
    }
    
    returnToPrep() {
        this.gameState.inGame = false;
        this.gameState.gameOver = false;
        this.gameState.stageComplete = false;
        this.gameLoopRunning = false;
        
        this.gameState.selectedDestination = null;
        this.gameState.selectedCargos = [];
        this.gameState.damageLevel = 1;
        this.gameState.speedLevel = 1;
        this.gameState.turretCount = 1;
        this.gameState.score = 0;
        this.gameState.stage = 1;
        
        document.querySelectorAll('.card, .cargo-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('selectedCargoCount').textContent = '0';
        document.getElementById('destinationInfo').style.display = 'none';
        this.updateStartButton();
        this.updatePrepUI();
        this.updateCargoSlotDisplay();
        
        document.getElementById('prepScreen').style.display = 'block';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverModal').style.display = 'none';
        document.getElementById('stageClearModal').style.display = 'none';
    }
    
    // ===== 이벤트 리스너 =====
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            this.gameState.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.gameState.keys[e.key.toLowerCase()] = false;
        });

        // 터치 이벤트
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.audioContext) this.initAudio();
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.touchTarget.x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
            this.touchTarget.y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
            this.touchTarget.active = true;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.touchTarget.x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
            this.touchTarget.y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchTarget.active = false;
        });

        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.audioContext) this.initAudio();
            
            const rect = this.canvas.getBoundingClientRect();
            this.touchTarget.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.touchTarget.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.touchTarget.active = true;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.touchTarget.active) {
                const rect = this.canvas.getBoundingClientRect();
                this.touchTarget.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                this.touchTarget.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.touchTarget.active = false;
        });

        // 창 크기 변경 이벤트
        window.addEventListener('resize', () => {
            if (this.gameState.inGame) {
                this.resizeCanvas();
            }
        });
    }
    
    // ===== 메인 게임 루프 =====
    gameLoop() {
        if (!this.gameState.inGame || this.gameState.gameOver || this.gameState.stageComplete) {
            this.gameLoopRunning = false;
            return;
        }

        // 화면 클리어 (어두운 배경)
        this.ctx.fillStyle = 'rgba(0, 0, 17, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 배경 별들 그리기
        this.drawStars();

        // 자동 사격
        this.autoShootTimer++;
        if (this.autoShootTimer > GAME_CONFIG.AUTO_SHOOT_INTERVAL) {
            this.shoot();
            this.autoShootTimer = 0;
        }

        // 적 생성
        this.spawnEnemy();
        
        // 기뢰 생성
        this.spawnMine();
        
        // 드론 생성
        this.spawnDrone();

        // 업데이트
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateTurrets();
        this.updateMines();
        this.updateDrones();
        this.updateExplosions();
        this.updateTimer();
        this.updateStars();
        this.checkBulletCollisions();

        // 렌더링
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawExplosions();

        // UI 업데이트
        this.updateUI();

        // 다음 프레임 요청
        if (this.gameLoopRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// 게임 매니저 인스턴스 생성
const gameManager = new GameManager();

// 전역에서 접근 가능하도록 설정
window.gameManager = gameManager;
    upgradeDamage() {
        const cost = 50 + (this.gameState.damageLevel - 1) * 25;
        if (this.gameState.gold >= cost) {
            this.gameState.gold -= cost;
            this.gameState.damageLevel++;
            this.player.turrets.forEach(turret => {
                turret.damage = this.gameState.damageLevel;
            });
            this.playSound(400, 0.2);
            this.updateUI();
        }
    }
    
    upgradeSpeed() {
        const cost = 75 + (this.gameState.speedLevel - 1) * 25;
        if (this.gameState.gold >= cost) {
            this.gameState.gold -= cost;
            this.gameState.speedLevel++;
            this.player.speed = this.player.speed * 1.1;
            this.playSound(400, 0.2);
            this.updateUI();
        }
    }
    
    addTurret() {
        const maxTurrets = this.getMaxTurretCount();
        if (this.gameState.gold >= 100 && this.player.turrets.length < maxTurrets) {
            this.gameState.gold -= 100;
            this.gameState.turretCount++;
            
            const positions = [
                { x: 0, y: -15 }, { x: -20, y: -10 }, { x: 20, y: -10 },
                { x: -30, y: 0 }, { x: 30, y: 0 }, { x: -40, y: 10 }, { x: 40, y: 10 }
            ];
            
            if (this.player.turrets.length < positions.length) {
                this.player.turrets.push({
                    x: positions[this.player.turrets.length].x * this.gameScale,
                    y: positions[this.player.turrets.length].y * this.gameScale,
                    lastShot: 0,
                    damage: this.gameState.damageLevel
                });
            }
            
            this.playSound(500, 0.2);
            this.updateUI();
        }
    }
    
    // ===== 업데이트 함수들 =====
    updatePlayer() {
        if (this.touchTarget.active) {
            const dx = this.touchTarget.x - (this.player.x + this.player.width / 2);
            const dy = this.touchTarget.y - (this.player.y + this.player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                const moveSpeed = Math.min(this.player.speed, distance * 0.1);
                const moveX = (dx / distance) * moveSpeed;
                const moveY = (dy / distance) * moveSpeed;
                
                this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x + moveX));
                this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y + moveY));
            }
        }
        
        if (this.gameState.keys['a'] || this.gameState.keys['arrowleft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.gameState.keys['d'] || this.gameState.keys['arrowright']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        if (this.gameState.keys['w'] || this.gameState.keys['arrowup']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.gameState.keys['s'] || this.gameState.keys['arrowdown']) {
            this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + this.player.speed);
        }
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
        
        this.turretBullets = this.turretBullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            return bullet.x > -50 && bullet.x < this.canvas.width + 50 && 
                   bullet.y > -50 && bullet.y < this.canvas.height + 50;
        });
        
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            if (this.checkCollision(bullet, this.player)) {
                this.createExplosion(bullet.x, bullet.y);
                this.playSound(200, 0.2);
                this.gameState.lives--;
                if (this.gameState.lives <= 0) {
                    this.gameState.gameOver = true;
                    this.showGameOver();
                }
                return false;
            }
            
            return bullet.x > -50 && bullet.x < this.canvas.width + 50 && 
                   bullet.y > -50 && bullet.y < this.canvas.height + 50;
        });
    }
    
    updateEnemies() {
        const now = Date.now();
        
        this.enemies = this.enemies.filter(enemy => {
            // 플레이어를 향해 이동
            const dx = this.player.x + this.player.width/2 - (enemy.x + enemy.width/2);
            const dy = this.player.y + this.player.height/2 - (enemy.y + enemy.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // 특수 적 행동
            if (enemy.canShoot && now - enemy.lastShot > enemy.shootInterval) {
                if (enemy.multiShot) {
                    // 보스 다중 발사
                    for (let i = -2; i <= 2; i++) {
                        const angle = Math.atan2(dy, dx) + (i * Math.PI / 12);
                        this.enemyBullets.push({
                            x: enemy.x + enemy.width / 2,
                            y: enemy.y + enemy.height,
                            width: 6 * this.gameScale,
                            height: 6 * this.gameScale,
                            vx: Math.cos(angle) * 4 * this.gameScale,
                            vy: Math.sin(angle) * 4 * this.gameScale,
                            color: '#ff6666'
                        });
                    }
                } else {
                    // 일반 발사
                    this.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 5 * this.gameScale,
                        height: 5 * this.gameScale,
                        vx: (dx / distance) * 3 * this.gameScale,
                        vy: (dy / distance) * 3 * this.gameScale,
                        color: '#ff4444'
                    });
                }
                enemy.lastShot = now;
                this.playSound(250, 0.1);
            }
            
            // 항공모함 미니 파이터 생성
            if (enemy.spawnFighters && now - enemy.lastFighterSpawn > enemy.fighterInterval) {
                this.spawnMiniFighter(enemy.x + enemy.width / 2, enemy.y + enemy.height);
                enemy.lastFighterSpawn = now;
            }
            
            // 플레이어와 충돌 체크
            if (this.checkCollision(enemy, this.player)) {
                this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                this.playSound(200, 0.2);
                this.gameState.lives--;
                if (this.gameState.lives <= 0) {
                    this.gameState.gameOver = true;
                    this.showGameOver();
                }
                return false;
            }
            
            return enemy.x > -200 && enemy.x < this.canvas.width + 200 && 
                   enemy.y > -200 && enemy.y < this.canvas.height + 200;
        });
        
        // 미니 파이터 업데이트
        this.miniFighters = this.miniFighters.filter(fighter => {
            const dx = this.player.x + this.player.width/2 - (fighter.x + fighter.width/2);
            const dy = this.player.y + this.player.height/2 - (fighter.y + fighter.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                fighter.x += (dx / distance) * fighter.speed;
                fighter.y += (dy / distance) * fighter.speed;
            }
            
            if (this.checkCollision(fighter, this.player)) {
                this.createExplosion(fighter.x + fighter.width/2, fighter.y + fighter.height/2);
                this.playSound(200, 0.2);
                this.gameState.lives--;
                if (this.gameState.lives <= 0) {
                    this.gameState.gameOver = true;
                    this.showGameOver();
                }
                return false;
            }
            
            return fighter.x > -50 && fighter.x < this.canvas.width + 50 && 
                   fighter.y > -50 && fighter.y < this.canvas.height + 50;
        });
    }
    
    updateTurrets() {
        const now = Date.now();
        const fireRateBonus = this.getFireRateBonus();
        const baseInterval = GAME_CONFIG.BASE_TURRET_INTERVAL / (1 + fireRateBonus / 100);
        
        this.player.turrets.forEach(turret => {
            if (now - turret.lastShot > baseInterval && this.enemies.length > 0) {
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                this.enemies.forEach(enemy => {
                    const dx = enemy.x + enemy.width/2 - (this.player.x + turret.x + this.player.width/2);
                    const dy = enemy.y + enemy.height/2 - (this.player.y + turret.y + this.player.height/2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });
                
                if (closestEnemy && closestDistance < 300 * this.gameScale) {
                    const dx = closestEnemy.x + closestEnemy.width/2 - (this.player.x + turret.x + this.player.width/2);
                    const dy = closestEnemy.y + closestEnemy.height/2 - (this.player.y + turret.y + this.player.height/2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const bulletSpeed = 8 * this.gameScale;
                    const vx = (dx / distance) * bulletSpeed;
                    const vy = (dy / distance) * bulletSpeed;
                    
                    this.turretBullets.push({
                        x: this.player.x + turret.x + this.player.width/2,
                        y: this.player.y + turret.y + this.player.height/2,
                        width: 3 * this.gameScale,
                        height: 3 * this.gameScale,
                        vx: vx,
                        vy: vy,
                        damage: turret.damage,
                        color: '#88ff88'
                    });
                    
                    turret.lastShot = now;
                    this.playSound(600, 0.08);
                }
            }
        });
    }
    
    updateMines() {
        const now = Date.now();
        this.mines = this.mines.filter(mine => {
            mine.y += mine.speed;
            
            // 수명 체크
            if (now - mine.spawnTime > mine.lifetime) {
                return false;
            }
            
            // 적과 충돌 체크
            let hit = false;
            this.enemies.forEach((enemy, index) => {
                if (this.checkCollision(mine, enemy)) {
                    enemy.hp -= mine.damage;
                    if (enemy.hp <= 0) {
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        this.gameState.score += enemy.goldValue;
                        this.gameState.gold += enemy.goldValue;
                        this.enemies.splice(index, 1);
                        this.playSound(300, 0.15);
                    }
                    this.createExplosion(mine.x, mine.y);
                    hit = true;
                }
            });
            
            return !hit && mine.y < this.canvas.height + 50;
        });
    }
    
    updateDrones() {
        const now = Date.now();
        this.drones = this.drones.filter(drone => {
            // 수명 체크
            if (now - drone.spawnTime > drone.lifetime) {
                return false;
            }
            
            // 자동 사격
            if (now - drone.lastShot > 500 && this.enemies.length > 0) {
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                const droneX = this.player.x + this.player.width/2 + drone.offsetX;
                const droneY = this.player.y + this.player.height/2 + drone.offsetY;
                
                this.enemies.forEach(enemy => {
                    const dx = enemy.x + enemy.width/2 - droneX;
                    const dy = enemy.y + enemy.height/2 - droneY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });
                
                if (closestEnemy && closestDistance < 400 * this.gameScale) {
                    const dx = closestEnemy.x + closestEnemy.width/2 - droneX;
                    const dy = closestEnemy.y + closestEnemy.height/2 - droneY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    this.turretBullets.push({
                        x: droneX,
                        y: droneY,
                        width: 4 * this.gameScale,
                        height: 4 * this.gameScale,
                        vx: (dx / distance) * 10 * this.gameScale,
                        vy: (dy / distance) * 10 * this.gameScale,
                        damage: drone.damage,
                        color: '#00aaff'
                    });
                    
                    drone.lastShot = now;
                    this.playSound(700, 0.08);
                }
            }
            
            return true;
        });
    }
    
    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.x += explosion.vx;
            explosion.y += explosion.vy;
            explosion.life--;
            return explosion.life > 0;
        });
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height + 5) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    updateTimer() {
        const now = Date.now();
        if (now - this.gameState.lastTimerUpdate > 1000) {
            this.gameState.stageTimer--;
            this.gameState.lastTimerUpdate = now;
            
            // 스테이지 증가
            this.stageTimer += 1000;
            if (this.stageTimer >= GAME_CONFIG.STAGE_CHANGE_INTERVAL) {
                this.gameState.stage++;
                this.stageTimer = 0;
                this.playSound(1000, 0.3);
            }
            
            if (this.gameState.stageTimer <= 0) {
                this.gameState.stageComplete = true;
                this.showStageClear();
            }
        }
    }
    
    checkBulletCollisions() {
        // 플레이어 총알과 적의 충돌
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    
                    // 보스 실드 처리
                    if (enemy.shieldHp > 0) {
                        enemy.shieldHp -= 1;
                    } else {
                        enemy.hp -= 1;
                    }
                    
                    if (enemy.hp <= 0) {
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        this.gameState.score += enemy.goldValue;
                        this.gameState.gold += enemy.goldValue;
                        this.enemies.splice(enemyIndex, 1);
                        this.playSound(300, 0.15);
                    }
                }
            });
            
            this.miniFighters.forEach((fighter, fighterIndex) => {
                if (this.checkCollision(bullet, fighter)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.createExplosion(fighter.x + fighter.width/2, fighter.y + fighter.height/2);
                    this.gameState.score += fighter.goldValue;
                    this.gameState.gold += fighter.goldValue;
                    this.miniFighters.splice(fighterIndex, 1);
                    this.playSound(300, 0.15);
                }
            });
        });

        // 포탑 총알과 적의 충돌
        this.turretBullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    this.turretBullets.splice(bulletIndex, 1);
                    
                    if (enemy.shieldHp > 0) {
                        enemy.shieldHp -= bullet.damage;
                    } else {
                        enemy.hp -= bullet.damage;
                    }
                    
                    if (enemy.hp <= 0) {
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        this.gameState.score += enemy.goldValue;
                        this.gameState.gold += enemy.goldValue;
                        this.enemies.splice(enemyIndex, 1);
                        this.playSound(300, 0.15);
                    }
                }
            });
            
            this.miniFighters.forEach((fighter, fighterIndex) => {
                if (this.checkCollision(bullet, fighter)) {
                    this.turretBullets.splice(bulletIndex, 1);
                    this.createExplosion(fighter.x + fighter.width/2, fighter.y + fighter.height/2);
                    this.gameState.score += fighter.goldValue;
                    this.gameState.gold += fighter.goldValue;
                    this.miniFighters.splice(fighterIndex, 1);
                    this.playSound(300, 0.15);
                }
            });
        });
    }// ===== 게임 데이터 정의 (최상단) =====
const GAME_CONFIG = {
    INITIAL_GOLD: 100,
    INITIAL_DIAMONDS: 0,
    INITIAL_LIVES: 3,
    BASE_SHIP_SPEED: 4,
    BASE_BULLET_SPEED: 7,
    BASE_TURRET_INTERVAL: 250,
    AUTO_SHOOT_INTERVAL: 15,
    MINE_SPAWN_INTERVAL: 3000,
    DRONE_DURATION: 5000,
    STAGE_CHANGE_INTERVAL: 30000
};

const DESTINATIONS = {
    nearby: { 
        name: '🌍 근거리 행성', 
        description: '안전하지만 보상이 적습니다.',
        time: 120, 
        difficulty: 1, 
        goldMultiplier: 1, 
        diamondMultiplier: 1,
        details: '⭐ 위험도: 낮음 | 적 속도: 보통 | 적 체력: 1'
    },
    medium: { 
        name: '🪐 중거리 행성',
        description: '적당한 위험과 보상입니다.',
        time: 150, 
        difficulty: 1.5, 
        goldMultiplier: 1.2, 
        diamondMultiplier: 1.2,
        details: '⭐⭐ 위험도: 중간 | 적 속도: 빠름 | 적 체력: 1-2'
    },
    far: { 
        name: '🌌 원거리 행성',
        description: '위험하지만 보상이 좋습니다.',
        time: 180, 
        difficulty: 2, 
        goldMultiplier: 1.5, 
        diamondMultiplier: 1.5,
        details: '⭐⭐⭐ 위험도: 높음 | 적 속도: 매우 빠름 | 적 체력: 2-3'
    },
    dangerous: { 
        name: '⚠️ 위험 지역',
        description: '매우 위험하지만 최고의 보상!',
        time: 210, 
        difficulty: 3, 
        goldMultiplier: 2, 
        diamondMultiplier: 2,
        details: '⭐⭐⭐⭐ 위험도: 매우 높음 | 적 속도: 극한 | 적 체력: 3-5'
    }
};

const CARGO_TYPES = {
    military: { name: '군사 물자', damageBonus: 0.5, enemySpawnRate: 1.3, reward: 15 },
    medical: { name: '의료 용품', bonusLife: 1, speedPenalty: 0.1, reward: 10 },
    energy: { name: '에너지 셀', fireRateBonus: 0.3, reward: 12 },
    luxury: { name: '고급품', diamondBonus: 1, speedPenalty: 0.2, reward: 25 }
};

const ENEMY_TYPES = {
    normal: { color: '#cc6633', hp: 1, speed: 1, size: 1, goldValue: 5 },
    strong: { color: '#cc3333', hp: 2, speed: 0.8, size: 1.2, goldValue: 12 },
    fast: { color: '#cc33cc', hp: 1, speed: 2, size: 0.8, goldValue: 8 },
    cruiser: { 
        color: '#886644', hp: 20, speed: 0.4, size: 3, goldValue: 50,
        width: 120, height: 60, canShoot: true, shootInterval: 2000
    },
    carrier: { 
        color: '#665544', hp: 40, speed: 0.3, size: 4, goldValue: 100,
        width: 160, height: 80, canShoot: true, shootInterval: 1500,
        spawnFighters: true, fighterInterval: 3000
    },
    boss: { 
        color: '#443333', hp: 100, speed: 0.2, size: 5, goldValue: 500,
        width: 200, height: 120, canShoot: true, shootInterval: 800,
        multiShot: true, shieldHp: 50
    }
};

class GameManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameScale = 1;
        this.touchTarget = { x: 0, y: 0, active: false };
        this.autoShootTimer = 0;
        this.stageTimer = 0;
        
        this.gameState = {
            score: 0,
            gold: GAME_CONFIG.INITIAL_GOLD,
            diamonds: GAME_CONFIG.INITIAL_DIAMONDS,
            lives: GAME_CONFIG.INITIAL_LIVES,
            stage: 1,
            inGame: false,
            gameOver: false,
            stageComplete: false,
            stageTimer: 120,
            lastTimerUpdate: 0,
            keys: {},
            lastEnemySpawn: 0,
            damageLevel: 1,
            speedLevel: 1,
            turretCount: 1,
            shipSpeedLevel: 1,
            maxTurretLevel: 1,
            cargoCapacityLevel: 1,
            fireRateLevel: 1,
            mineLevel: 0,
            droneLevel: 0,
            selectedDestination: null,
            selectedCargos: [],
            lastMineSpawn: 0,
            lastDroneSpawn: 0
        };
        
        this.player = {
            x: 400,
            y: 500,
            width: 40,
            height: 40,
            speed: 4,
            color: '#6688aa',
            turrets: []
        };
        
        this.bullets = [];
        this.turretBullets = [];
        this.enemies = [];
        this.explosions = [];
        this.stars = [];
        this.enemyBullets = [];
        this.miniFighters = [];
        this.mines = [];
        this.drones = [];
        
        this.gameLoopRunning = false;
        this.audioContext = null;
        
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                       (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updatePrepUI();
        this.updateCargoSlotDisplay();
        this.resizeCanvas();
    }
    
    // ===== 기본 함수들 =====
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('오디오 초기화 실패:', e);
        }
    }
    
    playSound(frequency, duration) {
        if (!this.audioContext) return;
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('사운드 재생 실패:', e);
        }
    }
    
    resizeCanvas() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let canvasWidth, canvasHeight;
        
        if (this.isMobile) {
            canvasWidth = Math.min(windowWidth - 20, 700);
            canvasHeight = Math.min(windowHeight - 200, 500);
        } else {
            canvasWidth = Math.min(windowWidth - 40, 800);
            canvasHeight = Math.min(windowHeight - 300, 600);
        }
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.gameScale = canvasWidth / 800;
        
        this.player.width = 40 * this.gameScale;
        this.player.height = 40 * this.gameScale;
        this.player.speed = 4 * this.gameScale;
        
        this.player.x = canvasWidth / 2 - this.player.width / 2;
        this.player.y = canvasHeight - this.player.height - 50;
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // ===== 영구 업그레이드 함수들 =====
    getMaxCargoSlots() { 
        return 2 + (this.gameState.cargoCapacityLevel - 1); 
    }
    
    getMaxTurretCount() { 
        return 3 + (this.gameState.maxTurretLevel - 1) * 2; 
    }
    
    getShipSpeedBonus() { 
        return (this.gameState.shipSpeedLevel - 1) * 15; 
    }
    
    getFireRateBonus() { 
        return (this.gameState.fireRateLevel - 1) * 20; 
    }
    
    getMineCount() { 
        return this.gameState.mineLevel * 2; 
    }
    
    getDroneTime() { 
        return this.gameState.droneLevel * 5; 
    }
    
    upgradeShipSpeed() {
        const cost = 5 + (this.gameState.shipSpeedLevel - 1) * 3;
        if (this.gameState.diamonds >= cost) {
            this.gameState.diamonds -= cost;
            this.gameState.shipSpeedLevel++;
            this.playSound(600, 0.3);
            this.updatePrepUI();
        }
    }
    
    upgradeMaxTurrets() {
        const cost = 8 + (this.gameState.maxTurretLevel - 1) * 5;
        if (this.gameState.diamonds >= cost) {
            this.gameState.diamonds -= cost;
            this.gameState.maxTurretLevel++;
            this.playSound(600, 0.3);
            this.updatePrepUI();
        }
    }
    
    upgradeCargoCapacity() {
        const cost = 10 + (this.gameState.cargoCapacityLevel - 1) * 7;
        if (this.gameState.diamonds >= cost) {
            this.gameState.diamonds -= cost;
            this.gameState.cargoCapacityLevel++;
            this.playSound(600, 0.3);
            this.updatePrepUI();
            this.updateCargoSlotDisplay();
        }
    }
    
    upgradeFireRate() {
        const cost = 6 + (this.gameState.fireRateLevel - 1) * 4;
        if (this.gameState.diamonds >= cost) {
            this.gameState.diamonds -= cost;
            this.gameState.fireRateLevel++;
            this.playSound(600, 0.3);
            this.updatePrepUI();
        }
    }
    
    upgradeMines() {
        const cost = 12 + this.gameState.mineLevel * 8;
        if (this.gameState.diamonds >= cost) {
            this.gameState.diamonds -= cost;
            this.gameState.mineLevel++;
            this.playSound(600, 0.3);
            this.updatePrepUI();
        }
    }
    
    upgradeDrones() {
        const cost = 15 + this.gameState.droneLevel * 10;
        if (this.gameState.diamonds >= cost) {
            this.gameState.diamonds -= cost;
            this.gameState.droneLevel++;
            this.playSound(600, 0.3);
            this.updatePrepUI();
        }
    }
    
    // ===== UI 관련 함수들 =====
    selectDestination(destKey) {
        this.gameState.selectedDestination = destKey;
        document.querySelectorAll('[data-destination]').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-destination="${destKey}"]`).classList.add('selected');
        
        const dest = DESTINATIONS[destKey];
        document.getElementById('destinationInfo').style.display = 'block';
        document.getElementById('selectedDestName').textContent = dest.name;
        document.getElementById('selectedDestDesc').textContent = dest.description;
        document.getElementById('selectedDestDetails').textContent = dest.details;
        
        this.updateStartButton();
    }
    
    selectCargo(cargoKey) {
        const maxSlots = this.getMaxCargoSlots();
        const currentIndex = this.gameState.selectedCargos.indexOf(cargoKey);
        
        if (currentIndex !== -1) {
            this.gameState.selectedCargos.splice(currentIndex, 1);
            document.querySelector(`[data-cargo="${cargoKey}"]`).classList.remove('selected');
        } else {
            if (this.gameState.selectedCargos.length < maxSlots) {
                this.gameState.selectedCargos.push(cargoKey);
                document.querySelector(`[data-cargo="${cargoKey}"]`).classList.add('selected');
            }
        }
        
        document.getElementById('selectedCargoCount').textContent = this.gameState.selectedCargos.length;
        this.updateStartButton();
    }
    
    updateStartButton() {
        const canStart = this.gameState.selectedDestination && this.gameState.selectedCargos.length > 0;
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = !canStart;
        
        if (canStart) {
            startBtn.style.boxShadow = '0 0 20px rgba(100, 200, 100, 0.5)';
        } else {
            startBtn.style.boxShadow = 'none';
        }
    }
    
    updateCargoSlotDisplay() {
        const maxSlots = this.getMaxCargoSlots();
        document.getElementById('selectedCargoCount').textContent = this.gameState.selectedCargos.length;
        document.getElementById('maxCargoSlots').textContent = maxSlots;
        document.getElementById('maxCargoDisplay').textContent = maxSlots;
    }
    
    updatePrepUI() {
        document.getElementById('prepGold').textContent = this.gameState.gold;
        document.getElementById('prepDiamonds').textContent = this.gameState.diamonds;
        
        document.getElementById('shipSpeedLevel').textContent = this.gameState.shipSpeedLevel;
        document.getElementById('speedBonus').textContent = this.getShipSpeedBonus();
        document.getElementById('maxTurretLevel').textContent = this.gameState.maxTurretLevel;
        document.getElementById('maxTurrets').textContent = this.getMaxTurretCount();
        document.getElementById('cargoCapacityLevel').textContent = this.gameState.cargoCapacityLevel;
        document.getElementById('cargoSlotBonus').textContent = this.getMaxCargoSlots() - 2;
        document.getElementById('fireRateLevel').textContent = this.gameState.fireRateLevel;
        document.getElementById('fireRateBonus').textContent = this.getFireRateBonus();
        document.getElementById('mineLevel').textContent = this.gameState.mineLevel;
        document.getElementById('mineCount').textContent = this.getMineCount();
        document.getElementById('droneLevel').textContent = this.gameState.droneLevel;
        document.getElementById('droneTime').textContent = this.getDroneTime();
        
        const speedCost = 5 + (this.gameState.shipSpeedLevel - 1) * 3;
        const turretCost = 8 + (this.gameState.maxTurretLevel - 1) * 5;
        const cargoCost = 10 + (this.gameState.cargoCapacityLevel - 1) * 7;
        const fireRateCost = 6 + (this.gameState.fireRateLevel - 1) * 4;
        const mineCost = 12 + this.gameState.mineLevel * 8;
        const droneCost = 15 + this.gameState.droneLevel * 10;
        
        document.getElementById('speedUpgradeCost').textContent = speedCost;
        document.getElementById('turretUpgradeCost').textContent = turretCost;
        document.getElementById('cargoUpgradeCost').textContent = cargoCost;
        document.getElementById('fireRateUpgradeCost').textContent = fireRateCost;
        document.getElementById('mineUpgradeCost').textContent = mineCost;
        document.getElementById('droneUpgradeCost').textContent = droneCost;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('gold').textContent = this.gameState.gold;
        document.getElementById('lives').textContent = this.gameState.lives;
        document.getElementById('timer').textContent = this.gameState.stageTimer;
        document.getElementById('turretCount').textContent = this.player.turrets.length;
        document.getElementById('currentStage').textContent = this.gameState.stage;
        
        const damageCost = 50 + (this.gameState.damageLevel - 1) * 25;
        const speedCost = 75 + (this.gameState.speedLevel - 1) * 25;
        const turretCost = 100;
        const maxTurrets = this.getMaxTurretCount();
        
        document.getElementById('damageCost').textContent = damageCost + '골드';
        document.getElementById('speedCost').textContent = speedCost + '골드';
        document.getElementById('turretCost').textContent = turretCost + '골드';
    }
