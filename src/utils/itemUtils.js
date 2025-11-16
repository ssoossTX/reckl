/**
 * Утилиты для работы с предметами и их эффектами
 */
import GameConfig from '../constants/gameConfig.js';

export const ItemUtils = {
  /**
   * Получить таблицу эффектов предмета по его названию
   */
  getItemEffect(itemName) {
    for (const caseType of GameConfig.CASES) {
      const item = caseType.loot.find(l => l.name === itemName);
      if (item) return item;
    }
    return null;
  },

  /**
   * Получить текстовое описание эффекта предмета
   */
  getItemEffectText(itemName) {
    const item = this.getItemEffect(itemName);
    if (!item) return '';

    if (item.effect.includes('Восстанавливает')) {
      const amounts = {
        'Обычный': GameConfig.ITEM_EFFECTS.HEAL_COMMON,
        'Редкий': GameConfig.ITEM_EFFECTS.HEAL_RARE,
        'Эпический': GameConfig.ITEM_EFFECTS.HEAL_EPIC,
      };
      const amount = amounts[item.rarity] || 20;
      return `<span style='color:#27ae60;font-size:0.97em;'>(+${amount} HP)</span>`;
    } else if (item.effect.includes('Добавляет')) {
      const amounts = {
        '10 кликов': GameConfig.ITEM_EFFECTS.CLICK_BONUS_SMALL,
        '50 кликов': GameConfig.ITEM_EFFECTS.CLICK_BONUS_MEDIUM,
        '200 кликов': GameConfig.ITEM_EFFECTS.CLICK_BONUS_LARGE,
      };
      const amount = Object.entries(amounts).find(([key]) => item.effect.includes(key))?.[1] || 0;
      return `<span style='color:#0ff;font-size:0.97em;'>(+${amount} кликов)</span>`;
    } else if (item.effect.includes('опыт')) {
      const amounts = {
        'Обычный': GameConfig.ITEM_EFFECTS.EXP_BONUS_SMALL,
        'Редкий': GameConfig.ITEM_EFFECTS.EXP_BONUS_RARE,
        'Эпический': GameConfig.ITEM_EFFECTS.EXP_BONUS_EPIC,
      };
      const amount = amounts[item.rarity] || 5;
      return `<span style='color:#2980b9;font-size:0.97em;'>(+${amount} опыта)</span>`;
    } else if (item.effect.includes('уникальная способность')) {
      return `<span style='color:#e67e22;font-size:0.97em;'>Клики x2 на 60 сек</span>`;
    }

    return '';
  },

  /**
   * Получить количество хила для предмета
   */
  getHealAmount(itemName) {
    const item = this.getItemEffect(itemName);
    if (!item || !item.effect.includes('Восстанавливает')) return 0;

    const amounts = {
      'Обычный': GameConfig.ITEM_EFFECTS.HEAL_COMMON,
      'Редкий': GameConfig.ITEM_EFFECTS.HEAL_RARE,
      'Эпический': GameConfig.ITEM_EFFECTS.HEAL_EPIC,
    };
    return amounts[item.rarity] || 0;
  },

  /**
   * Получить количество кликов для предмета
   */
  getClickBonusAmount(itemName) {
    const item = this.getItemEffect(itemName);
    if (!item || !item.effect.includes('Добавляет')) return 0;

    if (item.effect.includes('10 кликов')) return GameConfig.ITEM_EFFECTS.CLICK_BONUS_SMALL;
    if (item.effect.includes('50 кликов')) return GameConfig.ITEM_EFFECTS.CLICK_BONUS_MEDIUM;
    if (item.effect.includes('200 кликов')) return GameConfig.ITEM_EFFECTS.CLICK_BONUS_LARGE;

    return 0;
  },

  /**
   * Получить количество опыта для предмета
   */
  getExpBonusAmount(itemName) {
    const item = this.getItemEffect(itemName);
    if (!item || !item.effect.includes('опыт')) return 0;

    const amounts = {
      'Обычный': GameConfig.ITEM_EFFECTS.EXP_BONUS_SMALL,
      'Редкий': GameConfig.ITEM_EFFECTS.EXP_BONUS_RARE,
      'Эпический': GameConfig.ITEM_EFFECTS.EXP_BONUS_EPIC,
    };
    return amounts[item.rarity] || 0;
  },

  /**
   * Проверить, является ли предмет лечебным
   */
  isHealItem(itemName) {
    const item = this.getItemEffect(itemName);
    return item ? item.effect.includes('Восстанавливает') : false;
  },
};

export default ItemUtils;
