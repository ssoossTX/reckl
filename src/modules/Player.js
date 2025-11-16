import GameConfig from '../constants/gameConfig.js';

/**
 * Класс Player управляет всеми данными и состоянием игрока
 * Инкапсулирует все глобальные переменные в единый объект
 */
export class Player {
  constructor(data = null) {
    if (data) {
      // Восстановление из сохранения
      Object.assign(this, data);
    } else {
      // Новая игра
      this.initializeNew();
    }
  }

  initializeNew() {
    // === Система кликов ===
    this.clicks = 0;
    this.clickPower = GameConfig.CLICK.INITIAL_POWER;
    this.upgradeCost = GameConfig.CLICK.INITIAL_UPGRADE_COST;
    this.clickBonus = 1; // мультипликатор от предметов
    this.bonusEndTime = null;

    // === Уровень и опыт ===
    this.level = 1;
    this.exp = 0;
    this.expToNext = GameConfig.EXPERIENCE.INITIAL_EXP_TO_NEXT;
    this.points = 0;

    // === Здоровье ===
    this.health = GameConfig.HEALTH.INITIAL;
    this.maxHealth = GameConfig.HEALTH.INITIAL;

    // === Способности ===
    this.abilities = [
      { name: 'Сила', value: 0 },
      { name: 'Ловкость', value: 0 },
      { name: 'Интеллект', value: 0 }
    ];

    // === Валюта и предметы ===
    this.diamonds = 0;
    this.keys = { common: 0, rare: 0, epic: 0 };
    this.inventory = [];

    // === Престиж ===
    this.prestigeCost = GameConfig.PRESTIGE.INITIAL_COST;
    this.prestigeMultiplier = 1;
  }

  // === Геттеры бонусов способностей ===
  getAbilityBonus(abilityIndex) {
    return this.abilities[abilityIndex]?.value || 0;
  }

  getStrengthBonus() {
    return this.getAbilityBonus(0);
  }

  getAgilityBonus() {
    return this.getAbilityBonus(1);
  }

  getIntellectBonus() {
    return this.getAbilityBonus(2);
  }

  // === Вычисления боевой системы ===
  getPlayerDamage() {
    return Math.floor(
      GameConfig.COMBAT.DAMAGE_BASE +
      (this.level * GameConfig.COMBAT.DAMAGE_LEVEL_MULTIPLIER) +
      (this.getStrengthBonus() * GameConfig.COMBAT.STRENGTH_BONUS_PER_POINT)
    );
  }

  getMaxDungeonHp() {
    return this.maxHealth + (this.getAgilityBonus() * GameConfig.HEALTH.ABILITY_BONUS_PER_POINT);
  }

  // === Управление опытом ===
  addExperience(amount) {
    const intellectBonus = this.getIntellectBonus();
    const multiplier = 1 + (intellectBonus * GameConfig.ABILITIES.EXP_BONUS_PER_INTELLECT);
    const realAmount = Math.round(amount * multiplier);

    this.exp += realAmount;
    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.levelUp();
    }

    return realAmount;
  }

  levelUp() {
    this.level++;
    this.points += GameConfig.EXPERIENCE.LEVEL_UP_POINTS;

    const diamondReward = GameConfig.EXPERIENCE.LEVEL_UP_DIAMOND_BASE +
      Math.floor(this.level * GameConfig.EXPERIENCE.LEVEL_UP_DIAMOND_MULTIPLIER);
    this.diamonds += diamondReward;

    this.expToNext = Math.floor(
      this.expToNext * GameConfig.EXPERIENCE.EXP_CURVE_MULTIPLIER +
      GameConfig.EXPERIENCE.EXP_CURVE_ADDEND
    );

    return { level: this.level, points: GameConfig.EXPERIENCE.LEVEL_UP_POINTS, diamonds: diamondReward };
  }

  // === Управление кликами ===
  addClicks(amount) {
    this.clicks += Math.floor(amount * this.clickPower * this.prestigeMultiplier * this.clickBonus);
  }

  upgradeClickPower(cost) {
    if (this.clicks < cost) return false;

    this.clicks -= cost;
    this.clickPower++;
    this.upgradeCost = Math.floor(this.upgradeCost * GameConfig.CLICK.UPGRADE_COST_MULTIPLIER + GameConfig.CLICK.UPGRADE_COST_ADDEND);

    return true;
  }

  // === Способности ===
  upgradeAbility(index) {
    if (this.points <= 0 || !this.abilities[index]) return false;

    this.abilities[index].value++;
    this.points--;

    return true;
  }

  // === Инвентарь ===
  addToInventory(itemName) {
    const found = this.inventory.find(obj => obj.name === itemName);
    if (found) {
      found.count++;
    } else {
      this.inventory.push({ name: itemName, count: 1 });
    }
    return true;
  }

  removeFromInventory(index) {
    if (index < 0 || index >= this.inventory.length) return false;

    if (this.inventory[index].count > 1) {
      this.inventory[index].count--;
    } else {
      this.inventory.splice(index, 1);
    }

    return true;
  }

  // === Престиж ===
  performPrestige() {
    if (this.clicks < this.prestigeCost) return null;

    const bonusDiamonds = Math.floor((this.level + this.clicks + this.exp) / 10) + 10;

    this.diamonds += bonusDiamonds;
    this.prestigeMultiplier = +(this.prestigeMultiplier * GameConfig.PRESTIGE.MULTIPLIER_GROWTH).toFixed(2);
    this.prestigeCost = Math.floor(this.prestigeCost * GameConfig.PRESTIGE.COST_MULTIPLIER);

    // Сброс прогресса
    this.clicks = 0;
    this.clickPower = GameConfig.CLICK.INITIAL_POWER;
    this.upgradeCost = GameConfig.CLICK.INITIAL_UPGRADE_COST;
    this.level = 1;
    this.exp = 0;
    this.expToNext = GameConfig.EXPERIENCE.INITIAL_EXP_TO_NEXT;
    this.points = 0;
    this.abilities = [
      { name: 'Сила', value: 0 },
      { name: 'Ловкость', value: 0 },
      { name: 'Интеллект', value: 0 }
    ];
    this.keys = { common: 0, rare: 0, epic: 0 };
    // inventory НЕ сбрасываем

    return { bonusDiamonds, newMultiplier: this.prestigeMultiplier };
  }

  // === Тренировочный боевой режим ===
  activateTemporaryClickBonus() {
    this.clickBonus = GameConfig.ITEM_EFFECTS.LEGENDARY_CLICK_MULTIPLIER;
    this.bonusEndTime = Date.now() + GameConfig.ITEM_EFFECTS.LEGENDARY_BONUS_DURATION;
  }

  isClickBonusActive() {
    if (!this.bonusEndTime) return false;
    if (Date.now() > this.bonusEndTime) {
      this.clickBonus = 1;
      this.bonusEndTime = null;
      return false;
    }
    return true;
  }

  // === Сохранение ===
  toJSON() {
    return {
      clicks: this.clicks,
      clickPower: this.clickPower,
      upgradeCost: this.upgradeCost,
      clickBonus: this.clickBonus,
      bonusEndTime: this.bonusEndTime,
      level: this.level,
      exp: this.exp,
      expToNext: this.expToNext,
      points: this.points,
      health: this.health,
      maxHealth: this.maxHealth,
      abilities: this.abilities,
      diamonds: this.diamonds,
      keys: this.keys,
      inventory: this.inventory,
      prestigeCost: this.prestigeCost,
      prestigeMultiplier: this.prestigeMultiplier,
    };
  }
}

export default Player;
