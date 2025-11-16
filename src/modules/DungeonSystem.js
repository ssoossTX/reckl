import GameConfig from '../constants/gameConfig.js';

/**
 * Система подземелий с управлением боями, прогрессом этажей и монстрами
 */
export class DungeonSystem {
  constructor() {
    this.state = null; // { tower, floor, playerHp, monster, monsterHp, isBoss, relicDrop }
    this.isActive = false;
  }

  initializeTower(towerIndex, playerMaxHp) {
    if (this.isActive) {
      throw new Error('Подземелье уже активно');
    }

    this.state = {
      tower: towerIndex,
      floor: 1,
      playerHp: playerMaxHp,
      relicDrop: false,
    };

    this.isActive = true;
    this.generateFloor(playerMaxHp);
  }

  generateFloor(playerMaxHp) {
    if (!this.state) return;

    const towerIndex = this.state.tower;
    const floor = this.state.floor;
    const isBoss = floor % GameConfig.TOWERS.BOSS_SPAWN_FLOOR === 0;

    const monsterPool = this._getMonsterPool(towerIndex);
    const baseMonster = monsterPool[Math.floor(Math.random() * monsterPool.length)];

    const rankIndex = Math.floor(Math.random() * GameConfig.TOWERS.MONSTER_RANKS.length);
    const rank = GameConfig.TOWERS.MONSTER_RANKS[rankIndex];

    const rankMultiplier = 1 + (GameConfig.TOWERS.MONSTER_RANKS.length - rankIndex - 1) * GameConfig.COMBAT.RANK_SCALING;
    const floorMultiplier = 1 + (floor * GameConfig.COMBAT.FLOOR_SCALING);
    const bossFactor = isBoss ? GameConfig.COMBAT.BOSS_HP_MULTIPLIER : 1;

    const monster = {
      ...baseMonster,
      rank,
      isBoss,
      name: (isBoss ? 'Босс ' : '') + baseMonster.name,
      hp: Math.round(baseMonster.baseHp * rankMultiplier * bossFactor * floorMultiplier),
      atk: Math.round(baseMonster.baseAtk * rankMultiplier * (isBoss ? GameConfig.COMBAT.BOSS_DAMAGE_MULTIPLIER : 1) * floorMultiplier),
    };

    this.state.monster = monster;
    this.state.monsterHp = monster.hp;
    this.state.isBoss = isBoss;
    this.state.relicDrop = isBoss && Math.random() < GameConfig.TOWERS.RELIC_DROP_CHANCE;
  }

  dealPlayerDamage(damage) {
    if (!this.state || !this.state.monster) return null;

    this.state.monsterHp -= damage;

    if (this.state.monsterHp <= 0) {
      return { result: 'victory', monster: this.state.monster, relicDrop: this.state.relicDrop };
    }

    const monsterDamage = this.state.monster.atk;
    this.state.playerHp -= monsterDamage;

    if (this.state.playerHp <= 0) {
      return { result: 'defeat' };
    }

    return { result: 'continue', monsterDamage };
  }

  nextFloor(playerMaxHp) {
    if (!this.state) return false;

    this.state.floor++;
    this.state.playerHp = Math.min(playerMaxHp, this.state.playerHp); // Восстановление HP между этажами
    this.generateFloor(playerMaxHp);

    return true;
  }

  getMonsterExpReward() {
    if (!this.state || !this.state.monster) return 0;

    const rankExpMap = {
      S: 30, A: 22, B: 16, C: 12, D: 8, E: 5, F: 3, G: 2
    };

    let baseExp = rankExpMap[this.state.monster.rank] || 2;
    if (this.state.monster.isBoss) {
      baseExp = Math.round(baseExp * GameConfig.COMBAT.BOSS_EXP_MULTIPLIER);
    }

    return baseExp;
  }

  exit() {
    this.isActive = false;
    return this.state;
  }

  giveUp() {
    this.isActive = false;
    const playerHp = this.state?.playerHp || 0;
    this.state = null;
    return playerHp;
  }

  // === Вспомогательные методы ===

  _getMonsterPool(towerIndex) {
    const pools = [
      [
        { name: 'Кристальный гоблин', baseHp: 30, baseAtk: 5, drops: ['Малый клик-бонус', 'Зелье лечения'] },
        { name: 'Осколочный слизень', baseHp: 25, baseAtk: 4, drops: ['Зелье лечения'] },
        { name: 'Сверкающая крыса', baseHp: 20, baseAtk: 3, drops: ['Книга опыта'] }
      ],
      [
        { name: 'Скелет-воин', baseHp: 50, baseAtk: 9, drops: ['Большое зелье лечения'] },
        { name: 'Орк-некромант', baseHp: 60, baseAtk: 10, drops: ['Большой клик-бонус', 'Большое зелье лечения'] },
        { name: 'Волк-призрак', baseHp: 40, baseAtk: 8, drops: ['Книга опыта'] }
      ],
      [
        { name: 'Древесный демон', baseHp: 120, baseAtk: 18, drops: ['Эпический клик-бонус', 'Эпическое зелье лечения'] },
        { name: 'Гарпия-мираж', baseHp: 80, baseAtk: 14, drops: ['Книга опыта'] },
        { name: 'Тролль-иллюзионист', baseHp: 100, baseAtk: 16, drops: ['Эпическое зелье лечения'] }
      ],
      [
        { name: 'Огненный дракон', baseHp: 200, baseAtk: 30, drops: ['Легендарный артефакт'] },
        { name: 'Феникс-пепельник', baseHp: 150, baseAtk: 22, drops: ['Эпический клик-бонус'] },
        { name: 'Лавовый голем', baseHp: 180, baseAtk: 25, drops: ['Эпическое зелье лечения'] }
      ],
      [
        { name: 'Тёмный властелин времени', baseHp: 350, baseAtk: 50, drops: ['Легендарный артефакт', 'Камень времени'] },
        { name: 'Архидемон эпох', baseHp: 300, baseAtk: 45, drops: ['Камень времени'] },
        { name: 'Бессмертный рыцарь', baseHp: 320, baseAtk: 48, drops: ['Легендарный артефакт'] }
      ]
    ];

    return pools[towerIndex] || pools[0];
  }

  toJSON() {
    return {
      state: this.state,
      isActive: this.isActive,
    };
  }

  static fromJSON(data) {
    const dungeon = new DungeonSystem();
    dungeon.state = data.state;
    dungeon.isActive = data.isActive;
    return dungeon;
  }
}

export default DungeonSystem;
