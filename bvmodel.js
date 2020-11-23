let BVmodel = class {
    constructor() {
        this.selectionState = {};
        this.partyState = {};
        this.enemyState = {};
        this.bossState = {};
        
        this.turnState = {};
        this.gameState = {};

        this.newSessionLoad();
    }

    newSessionLoad() {
        this.selectionState.selected = [];
        
        this.partyState.party = [];
        this.partyState.isPlaying = true;

        this.enemyState.enemies = [];
        
        this.turnState.hitCount = 0;
        this.turnState.turnDamage = 0;
        this.turnState.playerActing = true;

        this.gameState.totalDamage = 0;
        this.gameState.highestTurnDamage = 0;
        this.gameState.highestHitCount = 0;
        this.gameState.turnCount = 1;
        this.gameState.wave = 2;
        this.gameState.isWon = false;
        this.gameState.isLost = false;
        this.gameState.isBoss = false;
        
    }

    setupParty() {
        this.selectionState.selected.forEach(member => {
            let i = this.selectionState.selected.indexOf(member);
            this.partyState.party[i] = JSON.parse(JSON.stringify(braveVesperia[parseInt(member)]));
        });
    }

    setupEnemies() {
        for (let i = 0; i < 4; i++) {
            this.enemyState.enemies[i] = JSON.parse(JSON.stringify(baddies[Math.floor(Math.random()*6)]))
        }
    }

    setupBoss() {
        this.enemyState.enemies = [];
        this.enemyState.enemies[0] = JSON.parse(JSON.stringify(boss));
    }

    toNextTurn() {
        if (this.turnState.turnDamage > this.gameState.highestTurnDamage) {
            this.gameState.highestTurnDamage = this.turnState.turnDamage;
        }
        if (this.turnState.hitCount > this.gameState.highestHitCount) {
            this.gameState.highestHitCount = this.turnState.hitCount;
        }
        this.gameState.turnCount++;
        this.partyState.party.forEach(member => {
            if (member.health > 0) {
                member.canAct = true;
                if (member.arte1.turnsLeft > 0) {
                    member.arte1.turnsLeft--;
                    if (member.arte1.turnsLeft === 0) {
                        member.arte1.isAvailable = true;
                    }
                }
                if (member.arte2.turnsLeft > 0) {
                    member.arte2.turnsLeft--;
                    if (member.arte2.turnsLeft === 0) {
                        member.arte2.isAvailable = true;
                    }
                }
            }
        });
        this.turnState.hitCount = 0;
        this.turnState.turnDamage = 0;
    }

    toNextWave() {
        this.gameState.wave++;
        this.toNextTurn();
        if (this.gameState.wave < 3) {
            this.setupEnemies();
        } else {
            this.setupBoss();
        }
    }

    damage(memberAttacking, arteUsed, enemyAttacked) {
        if (arteUsed == null) {
            let damage = this.elementalMultiplier(memberAttacking, enemyAttacked) * this.hitMultiplier() * this.crit() * memberAttacking.attack * 2500;
            enemyAttacked.health -= damage;
            this.gameState.totalDamage += damage;
            this.turnState.turnDamage += damage;
            this.turnState.hitCount++;
        } else {
            let ed = this.elementalMultiplier(memberAttacking, enemyAttacked);
            let hm = this.hitMultiplier();
            let crit = this.crit();
            let damage = ed * hm * crit * memberAttacking.attack * arteUsed.value;

            enemyAttacked.health -= damage;
            this.gameState.totalDamage += damage;
            this.turnState.turnDamage += damage;
            this.turnState.hitCount++;
        }
    }

    crit() {
        let isCrit = Math.random() <= 0.04;
        if (isCrit) {
            return 1.5;
        } else {
            return 1;
        }
    }

    hitMultiplier() {
        return 1 + Math.floor(this.turnState.hitCount / 10) / 10;
    }

    elementalMultiplier(attacking, attacked) {
        if (attacked.element === 'n/a' || attacking.element === 'n/a') {
            return 1;
        }
        if (attacked.element === attacking.strong) {
            return 1.2;
        } else if (attacked.element === attacking.weak) {
            return 0.8;
        } else {
            return 1;
        }
    } 

    heal(memberToHeal) {
        memberToHeal.health += this.hitMultiplier() * 5000;
        if (memberToHeal.health > braveVesperia[memberToHeal.id].health) {
            memberToHeal.health = braveVesperia[memberToHeal.id].health;
        }
    }

    enemyTurn() {
        this.enemyState.enemies.forEach(enemy => {
            if (this.gameState.isLost) {
                return;
            }
            if (enemy.health <= 0) {
                return;
            }
            let memberToAttack = {};
            let memberToAttackNumber = -1;
            while (memberToAttackNumber === -1) {
                memberToAttackNumber = Math.floor(Math.random() * 4)
                memberToAttack = this.partyState.party[memberToAttackNumber];
                if (!memberToAttack.isAlive) {
                    memberToAttackNumber = -1;
                    continue;
                }
            }
            let ed = this.elementalMultiplier(enemy, memberToAttack);
            let crit = this.crit();
            let damage = (ed * crit * enemy.attack) * memberToAttack.defense;
            memberToAttack.health -= damage;
            if (memberToAttack.health <= 0) {
                memberToAttack.isAlive = false;
            }

            let gameOver = true;
            this.partyState.party.forEach(member => {
                if (member.isAlive) {
                    gameOver = false;
                    return;
                }
            });
            if (gameOver) {
                this.gameState.isLost = true;
                return;
            }

        });
        if (this.gameState.isLost) {
            return;
        }
        this.toNextTurn();
    }

}

let BVcontroller = class {
    constructor(sModel, sView) {
        this.model = sModel;
        this.view = sView;
        this.secret = [];
        $(document).on(("keyup"), (e) => this.handleKeyup(e.keyCode));
        $(document).on('click', 'img.unselected', (e) => this.select(e.target));
        $(document).on('click', 'img.selected', (e) => this.deselect(e.target));
        $(document).on('click', '#start', (e) => this.finalize());
    }

    handleKeyup(keyCode) {
        switch(keyCode) {
            case 13: // Start (Enter/Return)
                this.secret.push(13);
                if (JSON.stringify(this.secret) !== JSON.stringify([38,38,40,40,37,39,37,39,66,65,13])) {
                    this.secret = [];
                    break;
                }
                this.view.unlockNewCharacters();
                break;
            case 37: // Left
                this.secret.push(37);
                break;
            case 38: // Up
                this.secret.push(38);
                break;
            case 39: // Right
                this.secret.push(39);
                break;
            case 40: // Down
                this.secret.push(40);
                break;
            case 65: // A
                this.secret.push(65);
                break;
            case 66: // B
                this.secret.push(66)
                break;
        }
    }

    onFinalize(callback) {
        this.callback = callback;
    }

    select(element) {
        if (this.model.selectionState.selected.includes(element.id[1]) || this.model.selectionState.selected.length == 4) {
            return
        }
        this.model.selectionState.selected.push(element.id[1]);
        this.view.select(element.id);
    }

    deselect(element) {
        if (!this.model.selectionState.selected.includes(element.id[1])) {
            return
        }
        this.view.deselect(element.id);
        this.model.selectionState.selected.splice(this.model.selectionState.selected.indexOf(element.id[1]), 1);
    }
    
    finalize() {
        if (typeof this.callback === 'function') {
            this.callback(this.model);
        }
    }

}

let BVGameController = class {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.model.setupParty();
        this.model.setupEnemies();
        this.view.readyGame(this.model.partyState.party, this.model.enemyState.enemies);

        $(document).on('click', '.attack', (e) => this.pressAttack(e.target));
        $(document).on('click', '.activeAttackButton', (e) => this.unpressAttack(e.target));

        $(document).on('click', '.arte1', (e) => this.pressArte1(e.target));
        $(document).on('click', '.arte2', (e) => this.pressArte2(e.target));
        $(document).on('click', '.healingArte', (e) => this.pressArte1(e.target));
        $(document).on('click', '.activeArte1Button', (e) => this.unpressArte1(e.target));
        $(document).on('click', '.activeArte2Button', (e) => this.unpressArte2(e.target));

        $(document).on('click', '.attackThisEnemy', (e) => this.attackThisEnemy(e.target));
        $(document).on('click', '.arteThisEnemy', (e) => this.arteThisEnemy(e.target));
        $(document).on('click', '.healThisAlly', (e) => this.healThisAlly(e.target));
    }

    pressAttack(element) {
        if ($(element).hasClass('disabledButton') || $(element).hasClass('cannotActButton') || $(element).hasClass('deadButton')) {
            return;
        }
        this.view.pressAttack(element, this.model.enemyState.enemies);
    }

    unpressAttack(element) {
        this.view.unpressAttack(element);
    }

    attackThisEnemy(element) {
        if ($(element).hasClass('attackThisEnemy') == false || $(element).hasClass('dead') || $('.healThisAlly').hasClass('healThisAlly')) {
            return;
        }
        this.model.damage(this.model.partyState.party[$('.activeAttackButton').parent().attr('id')[1]], null, this.model.enemyState.enemies[element.id[1]]);
        if (this.model.enemyState.enemies[element.id[1]].health <= 0) {
            this.model.enemyState.enemies[element.id[1]].dead = true;
        }
        this.model.partyState.party[$('.activeAttackButton').parent().attr('id')[1]].canAct = false;
        let endOfWave = true;
        this.model.enemyState.enemies.forEach(enemy => {
            if (enemy.health > 0) {
                endOfWave = false;
            }
        });
        if (endOfWave) {
            if (this.model.gameState.wave === 3) {
                this.model.gameState.isWon = true;
                if (this.model.gameState.highestHitCount < this.model.turnState.hitCount) {
                    this.model.gameState.highestHitCount = this.model.turnState.hitCount;
                }
                if (this.model.gameState.highestTurnDamage < this.model.turnState.turnDamage) {
                    this.model.gameState.highestTurnDamage = this.model.turnState.turnDamage;
                }
                this.view.gameWon();
                return;
            }
            this.model.toNextWave();
        }
        this.view.render();
    }

    pressArte1(element) {
        if ($(element).hasClass('cooldown') || $(element).hasClass('disabledButton') || $(element).hasClass('cannotActButton') || $(element).hasClass('deadButton')) {
            return;
        }
        let arteUsed = this.model.partyState.party[$(element).parent().attr('id')[1]].arte1;
        if (arteUsed.isMultiTarget) {
            for (let i = 1; i <= arteUsed.hits; i++) {
                this.model.enemyState.enemies.forEach(enemy => {
                    if (enemy.health <= 0) {
                        return;
                    }
                    this.model.damage(this.model.partyState.party[$(element).parent().attr('id')[1]], arteUsed, enemy);
                });

            }
            this.model.partyState.party[$(element).parent().attr('id')[1]].canAct = false;
            arteUsed.turnsLeft = arteUsed.cooldown;
            arteUsed.isAvailable = false;
            let endOfWave = true;
            this.model.enemyState.enemies.forEach(enemy => {
                if (enemy.health > 0) {
                    endOfWave = false;
                }
            });
            if (endOfWave) {
                this.model.toNextWave();
            }
            this.view.render()
            return;
        }
        this.view.pressArte1(element, this.model.enemyState.enemies);
    }

    pressArte2(element) {
        if ($(element).hasClass('cooldown') || $(element).hasClass('disabledButton') || $(element).hasClass('cannotActButton') || $(element).hasClass('deadButton')) {
            return;
        }
        let arteUsed = this.model.partyState.party[$(element).parent().attr('id')[1]].arte2;
        if (arteUsed.isMultiTarget) {
            for (let i = 1; i <= arteUsed.hits; i++) {
                this.model.enemyState.enemies.forEach(enemy => {
                    if (enemy.health <= 0) {
                        return;
                    }
                    this.model.damage(this.model.partyState.party[$(element).parent().attr('id')[1]], arteUsed, enemy);
                });

            }
            this.model.partyState.party[$(element).parent().attr('id')[1]].canAct = false;
            arteUsed.turnsLeft = arteUsed.cooldown;
            arteUsed.isAvailable = false;
            let endOfWave = true;
            this.model.enemyState.enemies.forEach(enemy => {
                if (enemy.health > 0) {
                    endOfWave = false;
                }
            });
            if (endOfWave) {
                this.model.toNextWave();
            }
            this.view.render()
            return;
        }
        this.view.pressArte2(element, this.model.enemyState.enemies);
    }

    unpressArte1(element) {
        this.view.unpressArte1(element);
    }

    unpressArte2(element) {
        this.view.unpressArte2(element);
    }

    arteThisEnemy(element) {
        if ($(element).hasClass('arteThisEnemy') == false || $(element).hasClass('dead')) {
            return;
        }
        let arteNumber = $('.activeArte1Button').attr('id');
        if (typeof arteNumber === 'undefined') {
            arteNumber = 'arte2';
        }
        let memberAttackingNumber = $('.activeA' + arteNumber.substring(1) + 'Button').parent().attr('id')[1];
        let memberAttacking = this.model.partyState.party[memberAttackingNumber];
        let arteUsed = memberAttacking[arteNumber];
        let enemyAttacked = this.model.enemyState.enemies[element.id[1]];
        for (let i = 1; i <= arteUsed.hits; i++) {
            this.model.damage(memberAttacking, arteUsed, enemyAttacked);
        }
        if (enemyAttacked.health <= 0) {
            enemyAttacked.dead = true;
        }
        memberAttacking.canAct = false;
        arteUsed.turnsLeft = arteUsed.cooldown;
        arteUsed.isAvailable = false;
        let endOfWave = true;
        this.model.enemyState.enemies.forEach(enemy => {
            if (enemy.health > 0) {
                endOfWave = false;
            }
        });
        if (endOfWave) {
            if (this.model.gameState.wave === 3) {
                this.model.gameState.isWon = true;
                if (this.model.gameState.highestHitCount < this.model.turnState.hitCount) {
                    this.model.gameState.highestHitCount = this.model.turnState.hitCount;
                }
                if (this.model.gameState.highestTurnDamage < this.model.turnState.turnDamage) {
                    this.model.gameState.highestTurnDamage = this.model.turnState.turnDamage;
                }
                this.view.gameWon();
                return;
            }
            this.model.toNextWave();
        }
        this.view.render()  
    }

    healThisAlly(element) {
        if ($(element).hasClass('healThisAlly') == false || $(element).hasClass('dead')) {
            return;
        }
        let memberToHealID = $(element).attr('id')[1];
        let memberToHeal = this.model.partyState.party[memberToHealID];
        this.model.heal(memberToHeal);
        this.model.partyState.party[$('.healingArte').parent().attr('id')[1]].canAct = false;
        this.model.partyState.party[$('.healingArte').parent().attr('id')[1]].arte1.turnsLeft = this.model.partyState.party[$('.healingArte').parent().attr('id')[1]].arte1.cooldown;
        this.model.partyState.party[$('.healingArte').parent().attr('id')[1]].arte1.isAvailable = false;
        this.view.render();
    }

}
