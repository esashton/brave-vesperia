let BVview = class {
    constructor(selectionModel) {
        this.model = selectionModel;
        $('body').append($('<audio/>').attr("src", "media/selection.mp3").attr("loop", "true").attr("autoplay", "true").attr("type", "audio/mpeg").css("visibility", "hidden"));
        this.selectionDIV = $("<div></div>").attr('id', 'game').addClass('selection');
        this.selectCharactersDIV = $('<div/>');
        braveVesperia.forEach(character => {
            if (character.id === 7 || character.id === 8) {
                return;
            }
            this.selectCharactersDIV.append($("<img/>").addClass("unselected").attr("id", "s" + character.id).attr("src", "media/" + character.img));
        });
        this.selectionDIV.append(this.selectCharactersDIV);

        this.howToPlayLink = $('<a/>').attr('target', '_blank').attr('href', 'media/How_To_Play.pdf').addClass('htp').text('How To Play');
        $('body').append(this.howToPlayLink);

        this.gameDIV = $('<div/>').attr('id', 'gameDIV');
        this.partyDIV = $('<ul/>').attr('id', 'partyDIV');
        this.arenaDIV = $('<div/>').attr('id', 'arenaDIV');
        this.enemyDIV = $('<ul/>').attr('id', 'enemyDIV');

    }

    unlockNewCharacters() {
        if ($('img').hasClass('secretChar')) {
            return;
        }
        this.selectCharactersDIV.append($("<img/>").addClass("unselected").addClass('secretChar').attr("id", "s7").attr("src", "media/portraits/flynn.png"));
        this.selectCharactersDIV.append($("<img/>").addClass("unselected").addClass('secretChar').attr("id", "s8").attr("src", "media/portraits/patty.png"));
    }

    select(id) {
        $("#" + id).removeClass("unselected");
        $("#" + id).addClass("selected");

        if (this.model.selectionState.selected.length == 4) {
            $('.unselected').toggleClass('noHover');
            $('body').append($('<button>BATTLE WITH THIS TEAM</button>')
                .attr({
                    id: 'start',
                })
                .css('text-align', 'center'));
        }
    }

    deselect(id) {
        if (this.model.selectionState.selected.length == 4) {
            $('.unselected').toggleClass('noHover');
            $('#start').remove();
        }
        $("#" + id).removeClass("selected");
        $("#" + id).addClass("unselected");
    }

    // GAME WINDOW IS CREATED BELOW AND THE SELECTION PROCESS ENDS //
    
    readyGame(party, enemies) {
        $('body').empty();
        this.gameDIV.append(this.partyDIV);
        this.gameDIV.append(this.enemyDIV);
        $('body').append(this.gameDIV);
        let p = 0;
        party.forEach(member => {
            let thisMember = $('<li/>').addClass('memberLI');;
            thisMember.append($("<img/>").addClass('party').attr("id", 'p' + p).attr("src", "media/" + braveVesperia.find(c => c.id == member.id).img));
            let thisMemberData = $('<ul/>').addClass('control').attr('id', 'd' + p);
            thisMember.append(thisMemberData);
            let memberName = $('<div/>').addClass('memberName');
            memberName.append($('<h2/>').text(member.name));
            memberName.append($('<img/>').addClass('memberElement').attr('src', 'media/portraits/' + member.element + '.png'));
            thisMemberData.append(memberName);
            thisMemberData.append($('<h3/>').text(member.health + '/' + braveVesperia[member.id].health));
            thisMemberData.append($('<progress/>').attr('value', member.health).attr('max', braveVesperia[member.id].health));
            thisMemberData.append($('<button/>').addClass('attack').text('ATTACK'));
            if (member.arte1.type === 0) {
                thisMemberData.append($('<button/>').addClass('arte1').attr('data-tooltip', 'Hits: ' + member.arte1.hits + ', enemies: ' + (member.arte1.isMultiTarget?'all':'1')).text(member.arte1.name));
            } else {
                thisMemberData.append($('<button/>').addClass('healingArte').attr('data-tooltip', 'Heals a base 5000 health').text(member.arte1.name));
            }
            thisMemberData.append($('<button/>').addClass('arte2').attr('data-tooltip', 'Hits: ' + member.arte2.hits + ', enemies: ' + (member.arte2.isMultiTarget?'all':'1')).text(member.arte2.name));
            this.partyDIV.append(thisMember);
            p++;
        });
        let turnNumber = $('<h2/>').attr('id', 'turn').text('Turn: ' + this.model.gameState.turnCount);
        let wave = $('<h2/>').attr('id', 'wave').text('WAVE: ' + this.model.gameState.wave);
        let arenaTop = $('<data/>');
        arenaTop.append(wave);
        arenaTop.append(turnNumber);
        this.arenaDIV.append(arenaTop);
        let howToPlayLink = $('<a/>').attr('href', 'media/How_To_Play.pdf').attr('target', '_blank').text('How To Play');
        let elementalAdvantageImage = $('<img/>').attr('src', 'media/portraits/elementaladvantage.png')
        let hitCount = $('<h3/>').attr('id', 'hitCount').text('Hit Count: ' + this.model.turnState.hitCount);
        let turnDamage = $('<h3/>').attr('id', 'hitCount').text('Total Damage: ' + Math.floor(this.model.gameState.totalDamage));
        let arenaBottom = $('<data/>');
        arenaBottom.append(howToPlayLink);
        arenaBottom.append(elementalAdvantageImage);
        arenaBottom.append(hitCount);
        arenaBottom.append(turnDamage);
        this.arenaDIV.append(arenaBottom);
        this.gameDIV.append(this.arenaDIV);
        let e = 0;
        enemies.forEach(enemy => {
            let thisEnemy = $('<li/>').addClass('enemyLI');
            let thisEnemyData = $('<data/>').addClass('control').attr('id', 'd' + e);
            thisEnemy.append(thisEnemyData);
            thisEnemyData.append($('<h3/>').text(enemy.name));
            thisEnemyData.append($('<h4/>').text(enemy.health + '/' + baddies[enemy.id - 100].health));
            thisEnemyData.append($('<progress/>').attr('value', enemy.health).attr('max', baddies[enemy.id - 100].health));
            thisEnemy.append($("<img/>").addClass('enemy').attr("id", 'e' + e).attr("src", baddies.find(e => e.id == enemy.id).img));
            this.enemyDIV.append(thisEnemy);
            e++;
        });
    }

    render() {
        if (this.model.gameState.isWon) {
            this.gameWon();
            return;
        } else if (this.model.gameState.isLost) {
            this.gameOver();
            return;
        }
        this.gameDIV.empty();
        this.partyDIV.empty();
        this.enemyDIV.empty();
        this.arenaDIV.empty();

        this.gameDIV.append(this.partyDIV);
        this.gameDIV.append(this.enemyDIV);
        this.gameDIV.append(this.arenaDIV);
        $('body').append(this.gameDIV);
        let p = 0;
        this.model.partyState.party.forEach(member => {
            let thisMember = $('<li/>').addClass('memberLI');
            if (!member.canAct || !this.model.partyState.isPlaying) {
                if (!member.isAlive) {
                    thisMember.addClass('dead');
                    thisMember.append($("<img/>").addClass('party').addClass('dead').attr("id", 'p' + p).attr("src", "media/" + braveVesperia.find(c => c.id == member.id).img));
                    let thisMemberData = $('<ul/>').addClass('control').addClass('dead').attr('id', 'd' + p);
                    thisMember.append(thisMemberData);
                    let memberName = $('<div/>').addClass('memberName');
                    memberName.append($('<h2/>').text(member.name));
                    memberName.append($('<img/>').addClass('memberElement').attr('src', 'media/portraits/' + member.element + '.png'));
                    thisMemberData.append(memberName);
                    thisMemberData.append($('<h3/>').text(0 + '/' + braveVesperia[member.id].health));
                    thisMemberData.append($('<progress/>').attr('value', 0).attr('max', braveVesperia[member.id].health));
                    thisMemberData.append($('<button/>').addClass('attack').addClass('deadButton').text('ATTACK'));
                    if (member.arte1.type === 0) {
                        thisMemberData.append($('<button/>').addClass('arte1').addClass('deadButton').text(member.arte1.name));
                    } else {
                        thisMemberData.append($('<button/>').addClass('healingArte').addClass('deadButton').text(member.arte1.name));
                    }
                    thisMemberData.append($('<button/>').addClass('arte2').addClass('deadButton').text(member.arte2.name));
                    this.partyDIV.append(thisMember);
                    p++
                    return;
                }
                thisMember.addClass('inactive');
                thisMember.append($("<img/>").addClass('party').addClass('inactive').attr("id", 'p' + p).attr("src", "media/" + braveVesperia.find(c => c.id == member.id).img));
                let thisMemberData = $('<ul/>').addClass('control').attr('id', 'd' + p);
                thisMember.append(thisMemberData);
                let memberName = $('<div/>').addClass('memberName');
                memberName.append($('<h2/>').text(member.name));
                memberName.append($('<img/>').addClass('memberElement').attr('src', 'media/portraits/' + member.element + '.png'));
                thisMemberData.append(memberName);
                thisMemberData.append($('<h3/>').text(member.health + '/' + braveVesperia[member.id].health));
                thisMemberData.append($('<progress/>').attr('value', Math.floor(member.health)).attr('max', braveVesperia[member.id].health));
                thisMemberData.append($('<button/>').addClass('attack').addClass('cannotActButton').text('ATTACK'));
                if (member.arte1.type === 0) {
                    thisMemberData.append($('<button/>').addClass('arte1').addClass('cannotActButton').text(member.arte1.name));
                } else {
                    thisMemberData.append($('<button/>').addClass('healingArte').addClass('cannotActButton').text(member.arte1.name));
                }
                thisMemberData.append($('<button/>').addClass('arte2').addClass('cannotActButton').text(member.arte2.name));
                this.partyDIV.append(thisMember);
                p++
                return;
            }
            thisMember.append($("<img/>").addClass('party').attr("id", 'p' + p).attr("src", "media/" + braveVesperia.find(c => c.id == member.id).img));
            let thisMemberData = $('<ul/>').addClass('control').attr('id', 'd' + p);
            thisMember.append(thisMemberData);
            let memberName = $('<div/>').addClass('memberName');
            memberName.append($('<h2/>').text(member.name));
            memberName.append($('<img/>').addClass('memberElement').attr('src', 'media/portraits/' + member.element + '.png'));
            thisMemberData.append(memberName);
            thisMemberData.append($('<h3/>').text(member.health + '/' + braveVesperia[member.id].health));
            thisMemberData.append($('<progress/>').attr('value', Math.floor(member.health)).attr('max', braveVesperia[member.id].health));
            thisMemberData.append($('<button/>').addClass('attack').text('ATTACK'));
            if (member.arte1.type === 0) {
                if (!member.arte1.isAvailable) {
                    thisMemberData.append($('<button/>').addClass('arte1').addClass('cooldown').text(member.arte1.name));
                    thisMemberData.append($('<span/>').addClass('turnsLeft').text(member.arte1.turnsLeft));
                } else {
                    thisMemberData.append($('<button/>').addClass('arte1').attr('data-tooltip', 'Hits: ' + member.arte1.hits + ', enemies: ' + (member.arte1.isMultiTarget?'all':'1')).text(member.arte1.name));
                }
            } else {
                if (!member.arte1.isAvailable) {
                    thisMemberData.append($('<button/>').addClass('healingArte').addClass('cooldown').text(member.arte1.name));
                    thisMemberData.append($('<span/>').addClass('turnsLeft').text(member.arte1.turnsLeft));
                } else {
                    thisMemberData.append($('<button/>').addClass('healingArte').attr('data-tooltip', 'Heals a base 5000 health').text(member.arte1.name));
                }
            }
            if (!member.arte2.isAvailable) {
                thisMemberData.append($('<button/>').addClass('arte2').addClass('cooldown').text(member.arte2.name));
                thisMemberData.append($('<span/>').addClass('turnsLeft').text(member.arte2.turnsLeft));
            } else {
                thisMemberData.append($('<button/>').addClass('arte2').attr('data-tooltip', 'Hits: ' + member.arte2.hits + ', enemies: ' + (member.arte2.isMultiTarget?'all':'1')).text(member.arte2.name));
            }
            this.partyDIV.append(thisMember);
            p++;
        });
        let turnNumber = $('<h2/>').attr('id', 'turn').text('Turn: ' + this.model.gameState.turnCount);
        let wave = $('<h2/>').attr('id', 'wave').text('WAVE: ' + this.model.gameState.wave);
        let arenaTop = $('<data/>');
        arenaTop.append(wave);
        arenaTop.append(turnNumber);
        this.arenaDIV.append(arenaTop);
        let howToPlayLink = $('<a/>').attr('href', 'media/How_To_Play.pdf').attr('target', '_blank').text('How To Play');
        let elementalAdvantageImage = $('<img/>').attr('src', 'media/portraits/elementaladvantage.png')
        let hitCount = $('<h3/>').attr('id', 'hitCount').text('Hit Count: ' + this.model.turnState.hitCount);
        let turnDamage = $('<h3/>').attr('id', 'hitCount').text('Total Damage: ' + Math.floor(this.model.gameState.totalDamage));
        let arenaBottom = $('<data/>').addClass('arenaBottom');
        arenaBottom.append(howToPlayLink);
        arenaBottom.append(elementalAdvantageImage);
        arenaBottom.append(hitCount);
        arenaBottom.append(turnDamage);
        this.arenaDIV.append(arenaBottom);
        this.gameDIV.append(this.arenaDIV);
        let e = 0;
        this.model.enemyState.enemies.forEach(enemy => {
            let thisEnemy = $('<li/>').addClass('enemyLI');
            if (enemy.health <= 0) {
                let thisEnemyData = $('<data/>').addClass('control').addClass('deadEnemy').attr('id', 'd' + e);
                thisEnemy.append(thisEnemyData);
                thisEnemyData.append($('<h3/>').text(enemy.name));
                thisEnemyData.append($('<h4/>').text(0 + '/' + baddies[enemy.id - 100].health));
                thisEnemyData.append($('<progress/>').attr('value', 0).attr('max', baddies[enemy.id - 100].health));
                thisEnemy.append($("<img/>").addClass('enemy').addClass('dead').attr("id", 'e' + e).attr("src", baddies.find(e => e.id == enemy.id).img));
                this.enemyDIV.append(thisEnemy);
                e++;
                return;
            }
            let thisEnemyData = $('<data/>').addClass('control').attr('id', 'd' + e);
            thisEnemy.append(thisEnemyData);
            thisEnemyData.append($('<h3/>').text(enemy.name));
            if (this.model.gameState.wave === 3) {
                thisEnemyData.append($('<h4/>').text(Math.floor(enemy.health) + '/' + boss.health));
                thisEnemyData.append($('<progress/>').attr('value', Math.floor(enemy.health)).attr('max', boss.health));
                thisEnemy.append($("<img/>").addClass('enemy').attr("id", 'e' + e).attr("src", boss.img));
            } else {
                thisEnemyData.append($('<h4/>').text(Math.floor(enemy.health) + '/' + baddies[enemy.id - 100].health));
                thisEnemyData.append($('<progress/>').attr('value', Math.floor(enemy.health)).attr('max', baddies[enemy.id - 100].health));
                thisEnemy.append($("<img/>").addClass('enemy').attr("id", 'e' + e).attr("src", baddies.find(e => e.id == enemy.id).img));
            }
            this.enemyDIV.append(thisEnemy);
            e++;
        });

        let endOfPartyTurn = true;
        this.model.partyState.party.forEach(member => {
            if (member.canAct === true) {
                endOfPartyTurn = false;
            }
        });
        if (endOfPartyTurn) {
            this.model.enemyTurn();
            if (this.model.gameState.isLost) {
                this.gameOver();
                return;
            }
            this.render();
            return;
        }
        
    }

    gameOver() {
        this.partyDIV.empty();
        let gameOverDIV = $('<li/>').addClass('gameOver');
        gameOverDIV.append($('<h1/>').addClass('gameOverText').text('And they were never heard from, again...'));
        gameOverDIV.append($('<h3/>').text('You survived ' + this.model.gameState.turnCount  + ' turns.'));
        gameOverDIV.append($('<h3/>').text('Total damage: ' + Math.floor(this.model.gameState.totalDamage)));
        this.partyDIV.append(gameOverDIV);
        return;
    }

    gameWon() {
        this.enemyDIV.empty();
        let gameWonDIV = $('<li/>').addClass('gameWon');
        gameWonDIV.append($('<h1/>').addClass('gameWonText').text('Battle Won!'));
        gameWonDIV.append($('<h3/>').text('Turns taken: ' + this.model.gameState.turnCount + ' turns'));
        gameWonDIV.append($('<h3/>').text('Highest hit count: ' + this.model.gameState.highestHitCount));
        gameWonDIV.append($('<h3/>').text('Highest turn damage: ' + Math.floor(this.model.gameState.highestTurnDamage)));
        gameWonDIV.append($('<h3/>').text('Total damage: ' + Math.floor(this.model.gameState.totalDamage)));
        this.enemyDIV.append(gameWonDIV);
        $('.control').empty();
        $('.arenaBottom').empty();
        return;
    }

    pressAttack(element, enemies) {
        $(element).toggleClass('attack').toggleClass('activeAttackButton');
        $('button').not(element).toggleClass('disabledButton');
        enemies.forEach(enemy => {
            if (enemy.health > 0) {
                $('.enemy').addClass('attackThisEnemy');
            }
        });
    }

    unpressAttack(element) {
        $(element).toggleClass('activeAttackButton').toggleClass('attack');
        $('button').not(element).toggleClass('disabledButton');
        $('.enemy').removeClass('attackThisEnemy');
    }

    attackThisEnemy(element) {
        this.unpressAttack(element);
        this.render();
    }

    pressArte1(element, enemies) {
        $(element).toggleClass('activeArte1Button').toggleClass('arte1').attr('id', 'arte1');
        $('button').not(element).toggleClass('disabledButton');

        let isHealingArte = $(element).hasClass('healingArte');
        if (isHealingArte) {
            $('.party').addClass('healThisAlly');
            return;
        }
        enemies.forEach(enemy => {
            if (enemy.health > 0) {
                $('.enemy').addClass('arteThisEnemy');
            }
        });
    }

    pressArte2(element, enemies) {
        $(element).toggleClass('activeArte2Button').toggleClass('arte2').attr('id', 'arte2');
        $('button').not(element).toggleClass('disabledButton');
        enemies.forEach(enemy => {
            if (enemy.health > 0) {
                $('.enemy').addClass('arteThisEnemy');
            }
        });
    }

    unpressArte1(element) {
        $(element).toggleClass('activeArte1Button').toggleClass('arte1').removeAttr('id');
        $('button').not(element).toggleClass('disabledButton');
        $('.party').removeClass('healThisAlly');
        $('.enemy').removeClass('arteThisEnemy');
    }

    unpressArte2(element) {
        $(element).toggleClass('activeArte2Button').toggleClass('arte2').removeAttr('id');
        $('button').not(element).toggleClass('disabledButton');
        $('.enemy').removeClass('arteThisEnemy');
    }
}
