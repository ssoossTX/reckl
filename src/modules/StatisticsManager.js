/**
 * StatisticsManager - Система отслеживания статистики и лидерборда
 */

class StatisticsManager {
  constructor(player, storageManager) {
    this.player = player;
    this.storageManager = storageManager;
    this.stats = {
      totalClicks: 0,
      totalEnemiesDefeated: 0,
      totalDamageTaken: 0,
      totalDamageDealt: 0,
      totalExpGained: 0,
      totalItemsObtained: 0,
      prestigeCount: 0,
      totalPlayTime: 0,
      bestFloor: {},
      firstPlayTime: Date.now()
    };
    this.prestigeHistory = [];
    this.init();
  }

  init() {
    this.loadStats();
    this.startPlayTimeTracking();
  }

  /**
   * Загрузить статистику из хранилища
   */
  loadStats() {
    const saved = localStorage.getItem('gameStats');
    if (saved) {
      const data = JSON.parse(saved);
      this.stats = { ...this.stats, ...data.stats };
      this.prestigeHistory = data.prestigeHistory || [];
    }
  }

  /**
   * Сохранить статистику
   */
  saveStats() {
    localStorage.setItem('gameStats', JSON.stringify({
      stats: this.stats,
      prestigeHistory: this.prestigeHistory
    }));
  }

  /**
   * Отслеживать время игры
   */
  startPlayTimeTracking() {
    setInterval(() => {
      this.stats.totalPlayTime += 1;
      if (this.stats.totalPlayTime % 60 === 0) { // Сохраняем каждую минуту
        this.saveStats();
      }
    }, 1000);
  }

  /**
   * Записать клик
   */
  recordClick(amount = 1) {
    this.stats.totalClicks += amount;
  }

  /**
   * Записать убийство врага
   * @param {number} damage - Урон, нанесённый врагу
   * @param {number} floor - Этаж, на котором было убийство
   * @param {string} towerName - Имя башни
   */
  recordEnemyDefeated(damage, floor, towerName) {
    this.stats.totalEnemiesDefeated += 1;
    this.stats.totalDamageDealt += damage;
    
    // Обновляем лучший результат для башни
    if (!this.stats.bestFloor[towerName] || floor > this.stats.bestFloor[towerName]) {
      this.stats.bestFloor[towerName] = floor;
    }
  }

  /**
   * Записать урон, полученный от врага
   */
  recordDamageTaken(damage) {
    this.stats.totalDamageTaken += damage;
  }

  /**
   * Записать полученный опыт
   */
  recordExpGained(exp) {
    this.stats.totalExpGained += exp;
  }

  /**
   * Записать полученный предмет
   */
  recordItemObtained() {
    this.stats.totalItemsObtained += 1;
  }

  /**
   * Записать престиж
   */
  recordPrestige() {
    this.stats.prestigeCount += 1;
    
    // Сохраняем историю престижей
    this.prestigeHistory.push({
      date: new Date().toISOString(),
      level: this.player.level,
      totalClicks: this.stats.totalClicks,
      totalExp: this.stats.totalExpGained,
      multiplier: this.player.prestigeMultiplier
    });
    
    this.saveStats();
  }

  /**
   * Получить общую статистику игрока
   */
  getOverallStats() {
    const playTimeMinutes = Math.floor(this.stats.totalPlayTime / 60);
    const playTimeHours = Math.floor(playTimeMinutes / 60);
    const playTimeDays = Math.floor(playTimeHours / 24);
    
    return {
      totalClicks: this.stats.totalClicks,
      totalEnemiesDefeated: this.stats.totalEnemiesDefeated,
      totalDamageDealt: this.stats.totalDamageDealt,
      totalDamageTaken: this.stats.totalDamageTaken,
      totalExpGained: this.stats.totalExpGained,
      totalItemsObtained: this.stats.totalItemsObtained,
      prestigeCount: this.stats.prestigeCount,
      playTime: {
        days: playTimeDays,
        hours: playTimeHours % 24,
        minutes: playTimeMinutes % 60,
        totalMinutes: playTimeMinutes,
        formatted: `${playTimeDays}д ${playTimeHours % 24}ч ${playTimeMinutes % 60}м`
      },
      bestFloors: this.stats.bestFloor,
      averageDamagePerEnemy: this.stats.totalEnemiesDefeated > 0 
        ? Math.round(this.stats.totalDamageDealt / this.stats.totalEnemiesDefeated)
        : 0
    };
  }

  /**
   * Получить историю престижей
   */
  getPrestigeHistory() {
    return this.prestigeHistory.map((entry, index) => ({
      number: index + 1,
      date: new Date(entry.date).toLocaleDateString('ru-RU'),
      level: entry.level,
      totalClicks: entry.totalClicks,
      totalExp: entry.totalExp,
      multiplier: entry.multiplier.toFixed(2) + 'x'
    }));
  }

  /**
   * Получить рекорды по башням
   */
  getTowerRecords() {
    return Object.entries(this.stats.bestFloor).map(([tower, floor]) => ({
      tower,
      floor,
      difficulty: floor >= 10 ? 'Легко' : floor >= 20 ? 'Средне' : 'Сложно'
    }));
  }

  /**
   * Получить сегодняшнюю статистику
   */
  getTodayStats() {
    // Это может быть расширено для отслеживания ежедневной статистики
    return {
      clicksToday: 0, // Требуется отдельное отслеживание
      enemiesDefeatedToday: 0,
      expGainedToday: 0,
      playtimeToday: 0
    };
  }

  /**
   * Сбросить всю статистику (для тестирования)
   */
  resetAllStats() {
    if (confirm('⚠️ Вы уверены? Это удалит всю статистику!')) {
      this.stats = {
        totalClicks: 0,
        totalEnemiesDefeated: 0,
        totalDamageTaken: 0,
        totalDamageDealt: 0,
        totalExpGained: 0,
        totalItemsObtained: 0,
        prestigeCount: 0,
        totalPlayTime: 0,
        bestFloor: {},
        firstPlayTime: Date.now()
      };
      this.prestigeHistory = [];
      this.saveStats();
      return true;
    }
    return false;
  }
}

export default StatisticsManager;
