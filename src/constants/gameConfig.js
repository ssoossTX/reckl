/**
 * Центральный файл конфигурации игры
 * Все магические числа и константы в одном месте
 */

export const GameConfig = {
  // === Клик система ===
  CLICK: {
    INITIAL_POWER: 1,
    INITIAL_UPGRADE_COST: 10,
    UPGRADE_COST_MULTIPLIER: 1.5,
    UPGRADE_COST_ADDEND: 5,
  },

  // === Престиж ===
  PRESTIGE: {
    INITIAL_COST: 1000,
    COST_MULTIPLIER: 2.2,
    MULTIPLIER_GROWTH: 1.1,
  },

  // === Опыт и уровень ===
  EXPERIENCE: {
    INITIAL_EXP_TO_NEXT: 20,
    EXP_CURVE_MULTIPLIER: 1.2,
    EXP_CURVE_ADDEND: 5,
    LEVEL_UP_POINTS: 3,
    LEVEL_UP_DIAMOND_BASE: 5,
    LEVEL_UP_DIAMOND_MULTIPLIER: 1.5,
  },

  // === Здоровье ===
  HEALTH: {
    INITIAL: 100,
    ABILITY_BONUS_PER_POINT: 15, // для ловкости
  },

  // === Кейсы ===
  CASES: [
    {
      name: 'Обычный кейс',
      price: 50,
      key: 'common',
      loot: [
        { name: 'Зелье лечения', rarity: 'Обычный', chance: 60, effect: 'Восстанавливает здоровье' },
        { name: 'Малый клик-бонус', rarity: 'Обычный', chance: 25, effect: 'Добавляет 10 кликов' },
        { name: 'Книга опыта', rarity: 'Обычный', chance: 10, effect: 'Дает опыт' },
        { name: 'Редкий эликсир', rarity: 'Редкий', chance: 4, effect: 'Восстанавливает здоровье' },
        { name: 'Редкий клик-бонус', rarity: 'Редкий', chance: 1, effect: 'Добавляет 50 кликов' }
      ]
    },
    {
      name: 'Редкий кейс',
      price: 200,
      key: 'rare',
      loot: [
        { name: 'Большое зелье лечения', rarity: 'Редкий', chance: 50, effect: 'Восстанавливает здоровье' },
        { name: 'Большой клик-бонус', rarity: 'Редкий', chance: 30, effect: 'Добавляет 50 кликов' },
        { name: 'Книга опыта', rarity: 'Редкий', chance: 10, effect: 'Дает опыт' },
        { name: 'Эпический эликсир', rarity: 'Эпический', chance: 8, effect: 'Восстанавливает здоровье' },
        { name: 'Эпический клик-бонус', rarity: 'Эпический', chance: 2, effect: 'Добавляет 200 кликов' }
      ]
    },
    {
      name: 'Эпический кейс',
      price: 1000,
      key: 'epic',
      loot: [
        { name: 'Эпическое зелье лечения', rarity: 'Эпический', chance: 60, effect: 'Восстанавливает здоровье' },
        { name: 'Эпический клик-бонус', rarity: 'Эпический', chance: 25, effect: 'Добавляет 200 кликов' },
        { name: 'Книга опыта', rarity: 'Эпический', chance: 10, effect: 'Дает опыт' },
        { name: 'Легендарный артефакт', rarity: 'Легендарный', chance: 5, effect: 'Дает уникальную способность' }
      ]
    }
  ],

  // === Экспедиции ===
  EXPEDITIONS: {
    EASY: { requiredLevel: 1, expReward: 5, duration: 3, dropChance: 0.2, drops: ['Зелье лечения', 'Малый клик-бонус'] },
    MEDIUM: { requiredLevel: 5, expReward: 12, duration: 6, dropChance: 0.28, drops: ['Большое зелье лечения', 'Большой клик-бонус', 'Книга опыта'] },
    HARD: { requiredLevel: 12, expReward: 25, duration: 10, dropChance: 0.35, drops: ['Эпическое зелье лечения', 'Эпический клик-бонус', 'Книга опыта'] },
    EXTREME: { requiredLevel: 20, expReward: 50, duration: 16, dropChance: 0.45, drops: ['Легендарный артефакт', 'Камень времени', 'Эпический клик-бонус'] },
  },

  // === Башни и подземелья ===
  TOWERS: {
    NAMES: ['Кристаллическая цитадель', 'Проклятый некрополь', 'Лес иллюзий', 'Вулкан забвения', 'Обитель времени'],
    MONSTER_RANKS: ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    BOSS_SPAWN_FLOOR: 10,
    RELIC_DROP_CHANCE: 0.25,
  },

  // === Боевая система ===
  COMBAT: {
    DAMAGE_BASE: 8,
    DAMAGE_LEVEL_MULTIPLIER: 1.5,
    STRENGTH_BONUS_PER_POINT: 3,
    FLOOR_SCALING: 0.05,
    RANK_SCALING: 0.15,
    BOSS_HP_MULTIPLIER: 2,
    BOSS_DAMAGE_MULTIPLIER: 2,
    BOSS_EXP_MULTIPLIER: 2.5,
  },

  // === Способности ===
  ABILITIES: {
    STRENGTH: { name: 'Сила', value: 0, bonus: (val) => val * 3 },
    AGILITY: { name: 'Ловкость', value: 0, bonus: (val) => val * 15 },
    INTELLECT: { name: 'Интеллект', value: 0, bonus: (val) => (val * 7) },
    EXP_BONUS_PER_INTELLECT: 0.07,
  },

  // === Система предметов ===
  ITEM_EFFECTS: {
    HEAL_COMMON: 20,
    HEAL_RARE: 50,
    HEAL_EPIC: 100,
    CLICK_BONUS_SMALL: 10,
    CLICK_BONUS_MEDIUM: 50,
    CLICK_BONUS_LARGE: 200,
    EXP_BONUS_SMALL: 5,
    EXP_BONUS_RARE: 15,
    EXP_BONUS_EPIC: 50,
    LEGENDARY_BONUS_DURATION: 60000, // 60 сек
    LEGENDARY_CLICK_MULTIPLIER: 2,
  },

  // === Хранилище ===
  STORAGE_KEY: 'rpgSave',
};

export default GameConfig;
