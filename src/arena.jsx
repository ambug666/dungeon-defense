import { initGoblin, attackHeroes, initHireling } from "./Minions";
import { map } from "./Level";

export function startArena(level) {
    console.log('starting arena');
    let wins;

    wins = runTest(level, {num: 1, type: 'fighter', level: 1}, {num: 1, type: 'goblin', level: 1});
    console.log(`${wins.tries} fights. lvl 1 fighter: ${wins.hero}. 1 lvl 1 goblin: ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'fighter', level: 1}, {num: 2, type: 'goblin', level: 1});
    console.log(`${wins.tries} fights. lvl 1 fighter: ${wins.hero}. 2 lvl 1 goblins : ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'fighter', level: 1}, {num: 1, type: 'hireling', level: 1});
    console.log(`${wins.tries} fights. lvl 1 fighter: ${wins.hero}. 1 lvl 1 hireling : ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'rogue', level: 1}, {num: 1, type: 'goblin', level: 1});
    console.log(`${wins.tries} fights. lvl 1 rogue: ${wins.hero}. 1 lvl 1 goblin : ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'rogue', level: 1}, {num: 1, type: 'hireling', level: 1});
    console.log(`${wins.tries} fights. lvl 1 rogue: ${wins.hero}. 1 lvl 1 hireling : ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'fighter', level: 10}, {num: 1, type: 'goblin', level: 10});
    console.log(`${wins.tries} fights. lvl 10 fighter: ${wins.hero}. 1 lvl 10 goblin: ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'fighter', level: 10}, {num: 2, type: 'goblin', level: 10});
    console.log(`${wins.tries} fights. lvl 10 fighter: ${wins.hero}. 2 lvl 10 goblins : ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'fighter', level: 10}, {num: 1, type: 'hireling', level: 10});
    console.log(`${wins.tries} fights. lvl 10 fighter: ${wins.hero}. 1 lvl 10 hireling : ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'rogue', level: 10}, {num: 1, type: 'goblin', level: 10});
    console.log(`${wins.tries} fights. lvl 10 rogue: ${wins.hero}. 1 lvl 10 goblin : ${wins.minion}`);

    wins = runTest(level, {num: 1, type: 'rogue', level: 10}, {num: 1, type: 'hireling', level: 10});
    console.log(`${wins.tries} fights. lvl 10 rogue: ${wins.hero}. 1 lvl 10 hireling : ${wins.minion}`);

    console.log('finished arena');
}

function runTest(level, herodata, miniondata) {
    let tries = 10000;
    let wins = {tries, hero: 0, minion: 0};
    while (tries > 0) {
        map.heroes = [];
        map.minions = [];
        level.addHeroesToMap(herodata.num, herodata.type, herodata.level);
        let tn = miniondata.num;
        while(tn > 0) {
            level.addMinionToMap({
                id: 'goblin',
                name: "Goblin",
                type: miniondata.type,
                class: 'minion',
                level: miniondata.level,
                style: 0,
                styles: 1,
                market: true,
                active: true,
                initMinion: (minion) => minion.type === 'goblin' ? initGoblin(minion) : initHireling(minion)
            },0,0);
            tn--;
        }
        map.heroes.forEach(hero => hero.x = hero.y = 0);
        map.minions.forEach(min => min.x = min.y = 0);
    
        //let turns = 0;
        while (map.heroes.length > 0 && map.minions.length > 0) {
            map.heroes.forEach(hero => level.attackMinion(hero));
            map.minions.forEach(min => attackHeroes(level, min));
           // turns++;
        }
        // let winner = map.heroes.length > 0 ? `Heros` : `Minions`;
        // let loser = map.heroes.length <= 0 ? `Heroes` : `Minions`; 
        // console.log(`${winner} killed ${loser} in ${turns} turns.`);
        if (map.minions.length) {
            wins['minion']++;
        } else {
            wins['hero']++;
        }
        tries--;
    }
    return wins;
}