import GameConfig from '../constants/gameConfig.js';
import { Player } from './Player.js';
import { DungeonSystem } from './DungeonSystem.js';

/**
 * Класс для управления сохранением и загрузкой прогресса
 * Единая точка взаимодействия с localStorage
 */
export class StorageManager {
  static saveGame(player, dungeon) {
    const data = {
      player: player.toJSON(),
      dungeon: dungeon.toJSON(),
      version: 1,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(GameConfig.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Ошибка сохранения игры:', e);
      return false;
    }
  }

  static loadGame() {
    try {
      const data = localStorage.getItem(GameConfig.STORAGE_KEY);
      if (!data) return { player: new Player(), dungeon: new DungeonSystem() };

      const parsed = JSON.parse(data);

      // Миграция старого формата инвентаря
      if (parsed.player && parsed.player.inventory) {
        if (Array.isArray(parsed.player.inventory[0]) && typeof parsed.player.inventory[0] === 'string') {
          const newInventory = [];
          parsed.player.inventory.forEach(name => {
            const found = newInventory.find(obj => obj.name === name);
            if (found) found.count++;
            else newInventory.push({ name, count: 1 });
          });
          parsed.player.inventory = newInventory;
        }
      }

      const player = new Player(parsed.player);
      const dungeon = parsed.dungeon ? DungeonSystem.fromJSON(parsed.dungeon) : new DungeonSystem();

      // Проверка активности временного бонуса
      if (player.bonusEndTime && Date.now() > player.bonusEndTime) {
        player.clickBonus = 1;
        player.bonusEndTime = null;
      }

      return { player, dungeon };
    } catch (e) {
      console.error('Ошибка загрузки игры:', e);
      return { player: new Player(), dungeon: new DungeonSystem() };
    }
  }

  static resetGame() {
    try {
      localStorage.removeItem(GameConfig.STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Ошибка сброса игры:', e);
      return false;
    }
  }

  static saveExpeditionTimer(expeditionId, endTime, expReward, dropChance, possibleDrops) {
    try {
      const timer = {
        endTime,
        expReward,
        dropChance,
        possibleDrops
      };
      localStorage.setItem(`expeditionTimer_${expeditionId}`, JSON.stringify(timer));
      return true;
    } catch (e) {
      console.error('Ошибка сохранения таймера экспедиции:', e);
      return false;
    }
  }

  static loadExpeditionTimer(expeditionId) {
    try {
      const data = localStorage.getItem(`expeditionTimer_${expeditionId}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Ошибка загрузки таймера экспедиции:', e);
      return null;
    }
  }

  static clearExpeditionTimer(expeditionId) {
    try {
      localStorage.removeItem(`expeditionTimer_${expeditionId}`);
      return true;
    } catch (e) {
      console.error('Ошибка удаления таймера экспедиции:', e);
      return false;
    }
  }
}

export default StorageManager;
