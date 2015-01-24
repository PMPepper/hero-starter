/*

  Strategies for the hero are contained within the "moves" object as
  name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

  The "moves" object only contains the data, but in order for a specific
  strategy to be implemented we MUST set the "move" variable to a
  definite property.  This is done like so:

  move = moves.heWhoLivesToFightAnotherDay;

  You MUST also export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")

  The "move" function should accept two arguments that the website will be passing in:
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  Such is the power of Javascript!!!

*/

// Strategy definitions
var moves = {
  // Aggressor
  aggressor: function(gameData, helpers) {
    // Here, we ask if your hero's health is below 30
    if (gameData.activeHero.health <= 30){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go attack someone...anyone.
      return helpers.findNearestEnemy(gameData);
    }
  },

  // Health Nut
  healthNut:  function(gameData, helpers) {
    // Here, we ask if your hero's health is below 75
    if (gameData.activeHero.health <= 75){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go mine some diamonds!!!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // Balanced
  balanced: function(gameData, helpers){
    //FIXME : fix;
    return null;
  },

  // The "Northerner"
  // This hero will walk North.  Always.
  northener : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    return 'North';
  },

  // The "Blind Man"
  // This hero will walk in a random direction each turn.
  blindMan : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  },

  // The "Priest"
  // This hero will heal nearby friendly champions.
  priest : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 60) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestTeamMember(gameData);
    }
  },

  // The "Unwise Assassin"
  // This hero will attempt to kill the closest enemy hero. No matter what.
  unwiseAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 30) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestEnemy(gameData);
    }
  },

  // The "Careful Assassin"
  // This hero will attempt to kill the closest weaker enemy hero.
  carefulAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestWeakerEnemy(gameData);
    }
  },

  // The "Safe Diamond Miner"
  // This hero will attempt to capture enemy diamond mines.
  safeDiamondMiner : function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });
    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // The "Selfish Diamond Miner"
  // This hero will attempt to capture diamond mines (even those owned by teammates).
  selfishDiamondMiner :function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });

    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestUnownedDiamondMine(gameData);
    }
  },

  // The "Coward"
  // This hero will try really hard not to die.
  coward : function(gameData, helpers) {
    return helpers.findNearestHealthWell(gameData);
  },
  
    //TODO Need method to plan route while avoiding enemies, etc
    custom : function( gameData, iHelpers){
        //store on global variable to save me from having to passing around the whole time
        helpers = iHelpers;
        myHero = gameData.activeHero;
        board = gameData.board;
        
        //Get stats on the nearest health well
        var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
            if (boardTile.type === 'HealthWell') {
                return true;
            }
        });

        //get nearest teammate
        var teammateStats = helpers.findNearestObjectDirectionAndDistance(board, myHero, function(heroTile) {
            return heroTile.type === 'Hero' && heroTile.team === myHero.team;
        });
        
        //nearest unclaimed or enemy owned diamond mine
        var diamondMineStats = helpers.findNearestObjectDirectionAndDistance(board, myHero, function(mineTile) {
            if (mineTile.type === 'DiamondMine') {
                if (mineTile.owner) {
                    return mineTile.owner.team !== myHero.team;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        });
        
        var adjacentEnemies = getAdjacentTiles( myHero.distanceFromLeft, myHero.distanceFromTop, filters.enemy );
        
        switch(adjacentEnemies.length ){
            case 4://attack weakest enemy
                return getWeakestAdjEnemyDirection( adjacentEnemies );
            case 3://run away
                var possibleDirections = [].concat( allDirections );//clone all directions array
                
                //remove directions which contain enemies
                for( var i = 0; i < adjacentEnemies.length; i++ ){
                    possibleDirections.splice( possibleDirections.indexOf( adjTileDirection( adjacentEnemies[i] ) ), 1 );
                }
                
                //is the remaining direction accessible?
                if( possibleDirections[0].type === 'Unoccupied'){
                    return possibleDirections[0];
                } else if(healthWellStats && gameData.activeHero.health < 100 && healthWellStats.distance == 1){
                    return healthWellStats.direction;//I'm next to a health well and hurt, just heal
                } else {
                    //last ditch desparation
                    return getWeakestAdjEnemyDirection( adjacentEnemies );
                }
            case 2:
                var weakest = getWeakestEnemy( adjacentEnemies );
                
                if( healthWellStats && gameData.activeHero.health < 100 && healthWellStats.distance == 1){
                    return healthWellStats.direction;//I'm next to a health well and hurt, just heal
                } else if( weakest.health == 10 || (healthWellStats && healthWellStats.distance == 1) ){//I can just kill one OR if im next to a health well and unhurt, may as well attack
                    return adjTileDirection( weakest );
                } else {
                    return healthWellStats.direction;//run to a health well
                }
            case 1:
                if(adjacentEnemies[0].health == 10 ){//can I definately kill them?
                    //move to them (and kill them!)
                    return adjTileDirection( adjacentEnemies[0] );
                } else {
                    //take judgement call on if attacking is a good idea (enemy hasAttribute less health and is not next to health well)
                    if(adjacentEnemies[0].health < myHero.health && getAdjacentTiles( adjacentEnemies[0].distanceFromLeft, adjacentEnemies[0].distanceFromTop, filters.healthWell ).length == 0 ){
                        return adjTileDirection( adjacentEnemies[0] );
                    }
                }
                break;
        }
        
        if( healthWellStats && gameData.activeHero.health < 100 && healthWellStats.distance === 1 ){
            return healthWellStats.direction;//If I'm next to a health well and injured, heal.
        } else if (gameData.activeHero.health <= 50){
            return healthWellStats.direction;//If I am vunlerable, go and get healed
        } else if( teammateStats && teammateStats.distance === 1 && teammateStats.health < 100 ){//if next to an injured team mate, heal them
            return teammateStats.direction;
        } else if( diamondMineStats && diamondMineStats.distance === 1 ){//if next to a diamond mine, grab it
            return diamondMineStats.direction;
        } else {
            //TODO get much smarter here - e.g. if closer to a diamond mine go and grab that, if hurt teammate nearby go and heal them, etc. Dont attack enemies next to health wells
            // Otherwise, go attack someone...anyone.
            return helpers.findNearestEnemy(gameData);
        }
    }
};


var myHero, board, helpers, allDirections = ["North", "East", "South", "West"];

function getTileDirection( dx, dy ){
    if( dx === 1 ){
        return "East";
    } else if( dx === -1 ){
        return "West";
    } else if( dy === 1 ){
        return "South";
    } else if( dy === -1 ){
        return "North";
    }
    
    return false;
}

function getWeakestEnemy( enemies ){
    if( enemies.length == 0 ){
        return false;
    }
    
    var lowestHealth = 100,
        weakestEnemy = enemies[Math.floor(Math.random()*enemies.length)];
    
    for( var i = 0; i < enemies.length; i++ ){
        if( enemies[i].health < lowestHealth ){
            weakestEnemy = enemies[i];
            lowestHealth = enemies[i].health;
        }
    }
    
    //TODO avoid attacking enemies next to health wells? Or that are/could be being healed?
    
    return weakestEnemy;
}

//TODO make this work even if not adjacent
function getWeakestAdjEnemyDirection( enemies ){
    if( enemies.length == 0 ){
        return false;
    }
    
    return adjTileDirection( getWeakestEnemy( enemies ) );
}

function adjTileDirection( tile ){
    return getTileDirection( tile.distanceFromLeft - myHero.distanceFromLeft, tile.distanceFromTop - myHero.distanceFromTop );
}

function getAdjacentTiles( x, y, filter ){
    var tiles = [];
    
    if (helpers.validCoordinates(board, x+1, y)) {
        tiles.push( board.tiles[x+1][y] );
    }
    if (helpers.validCoordinates(board, x-1, y)) {
        tiles.push( board.tiles[x-1][y] );
    }
    if (helpers.validCoordinates(board, x, y+1)) {
        tiles.push( board.tiles[x][y+1] );
    }
    if (helpers.validCoordinates(board, x, y-1)) {
        tiles.push( board.tiles[x][y-1] );
    }
    
    //if supplied, filter out non applicable tiles
    if( filter ){
        for( var i = tiles.length-1; i > -1; --i ){
            if( !filter( tiles[i] ) ){
                tiles.splice( i, 1 );
            }
        }
    }
    
    return tiles;
}


var filters = {
    enemy:function( tile ){
        return tile.type === 'Hero' && tile.team !== myHero.team;
    },
    healthWell:function( tile ){
        return tile.type === 'HealthWell';
    }
};

//  Set our heros strategy
var  move =  moves.custom;

// Export the move function here
module.exports = move;
