/**
 * QuestSystem - Система ежедневных квестов и достижений
 */

class QuestSystem {
  constructor(player, storageManager) {
    this.player = player;
    this.storageManager = storageManager;
    this.quests = [];
    this.completedQuests = new Set();
    this.questResetTime = null;
    this.init();
  }

  init() {
    this.setupDailyQuests();
    this.loadQuestProgress();
    this.checkQuestReset();
  }

  setupDailyQuests() {
    this.quests = [
      {
        id: 'daily_clicks_100',
        title: 'Кликер',
        description: 'Сделай 100 кликов',
        type: 'clicks',
        target: 100,
        progress: 0,
        reward: { exp: 50, diamonds: 5 },
        icon: '🖱️'
      },
      {
        id: 'daily_clicks_500',
        title: 'Маньяк кликов',
        description: 'Сделай 500 кликов',
        type: 'clicks',
        target: 500,
        progress: 0,
        reward: { exp: 150, diamonds: 15 },
        icon: '🖱️🖱️'
      },
      {
        id: 'daily_level_up',
        title: 'Рост',
        description: 'Повысь уровень на 2',
        type: 'level',
        target: 2,
        progress: 0,
        reward: { exp: 100, diamonds: 10 },
        icon: '📈'
      },
      {
        id: 'daily_dungeon_wins',
        title: 'Охотник',
        description: 'Победи 5 врагов в подземелье',
        type: 'dungeon_wins',
        target: 5,
        progress: 0,
        reward: { exp: 80, diamonds: 8 },
        icon: '⚔️'
      },
      {
        id: 'daily_prestige',
        title: 'Новое начало',
        description: 'Используй престиж',
        type: 'prestige',
        target: 1,
        progress: 0,
        reward: { exp: 200, diamonds: 50 },
        icon: '✨'
      },
      {
        id: 'daily_ability_upgrade',
        title: 'Мастер умений',
        description: 'Улучши 3 способности',
        type: 'ability_upgrade',
        target: 3,
        progress: 0,
        reward: { exp: 60, diamonds: 6 },
        icon: '💪'
      },
      {
        id: 'daily_expedition',
        title: 'Искатель',
        description: 'Отправься в экспедицию',
        type: 'expedition',
        target: 1,
        progress: 0,
        reward: { exp: 40, diamonds: 4 },
        icon: '🗺️'
      },
      {
        id: 'daily_tower_5',
        title: 'Покоритель башни',
        description: 'Достигни 5-го этажа в любой башне',
        type: 'tower_floor',
        target: 5,
        progress: 0,
        reward: { exp: 120, diamonds: 12 },
        icon: '🏰'
      }
    ];
  }

  /**
   * Загрузить прогресс квестов из хранилища
   */
  loadQuestProgress() {
    const saved = localStorage.getItem('questProgress');
    if (saved) {
      const data = JSON.parse(saved);
      this.questResetTime = data.resetTime;
      
      // Проверяем, нужно ли сбросить квесты
      if (this.shouldResetQuests(data.resetTime)) {
        this.resetDailyQuests();
      } else {
        // Восстанавливаем прогресс
        this.completedQuests = new Set(data.completedQuests || []);
        data.questProgress?.forEach(progress => {
          const quest = this.quests.find(q => q.id === progress.id);
          if (quest) {
            quest.progress = progress.progress;
          }
        });
      }
    } else {
      this.resetDailyQuests();
    }
  }

  /**
   * Проверить, нужен ли сброс квестов (каждые 24 часа)
   */
  shouldResetQuests(resetTime) {
    if (!resetTime) return true;
    const now = Date.now();
    return now - resetTime > 24 * 60 * 60 * 1000;
  }

  /**
   * Сбросить дневные квесты
   */
  resetDailyQuests() {
    this.quests.forEach(quest => {
      quest.progress = 0;
    });
    this.completedQuests.clear();
    this.questResetTime = Date.now();
    this.saveQuestProgress();
  }

  /**
   * Обновить прогресс квеста
   * @param {string} questType - Тип квеста (clicks, level, dungeon_wins и т.д.)
   * @param {number} amount - Количество для добавления (default: 1)
   */
  updateQuestProgress(questType, amount = 1) {
    this.quests.forEach(quest => {
      if (quest.type === questType && !this.completedQuests.has(quest.id)) {
        quest.progress = Math.min(quest.progress + amount, quest.target);
        
        // Проверяем, завершён ли квест
        if (quest.progress >= quest.target) {
          this.completeQuest(quest.id);
        }
      }
    });
    
    this.saveQuestProgress();
  }

  /**
   * Завершить квест и выдать награды
   * @param {string} questId - ID квеста
   */
  completeQuest(questId) {
    if (this.completedQuests.has(questId)) return;
    
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return;
    
    this.completedQuests.add(questId);
    
    // Выдаём награды
    if (quest.reward.exp) {
      this.player.addExperience(quest.reward.exp);
    }
    if (quest.reward.diamonds) {
      this.player.diamonds += quest.reward.diamonds;
    }
    
    // Уведомляем об успехе
    if (window.notificationSystem) {
      window.notificationSystem.success(
        `Квест завершён! +${quest.reward.exp} опыта, +${quest.reward.diamonds} алмазов`
      );
    }
    
    this.saveQuestProgress();
  }

  /**
   * Получить статистику квестов
   */
  getQuestStats() {
    const total = this.quests.length;
    const completed = this.completedQuests.size;
    const percentComplete = Math.round((completed / total) * 100);
    
    return {
      total,
      completed,
      percentComplete,
      remaining: total - completed,
      totalRewardsExp: this.calculateTotalRewards().exp,
      totalRewardsDiamonds: this.calculateTotalRewards().diamonds
    };
  }

  /**
   * Рассчитать общие награды за всё дневные квесты
   */
  calculateTotalRewards() {
    let totalExp = 0;
    let totalDiamonds = 0;
    
    this.quests.forEach(quest => {
      totalExp += quest.reward.exp || 0;
      totalDiamonds += quest.reward.diamonds || 0;
    });
    
    return { exp: totalExp, diamonds: totalDiamonds };
  }

  /**
   * Сохранить прогресс квестов
   */
  saveQuestProgress() {
    const questProgress = this.quests.map(quest => ({
      id: quest.id,
      progress: quest.progress
    }));
    
    localStorage.setItem('questProgress', JSON.stringify({
      resetTime: this.questResetTime,
      completedQuests: Array.from(this.completedQuests),
      questProgress
    }));
  }

  /**
   * Проверить сброс квестов по расписанию
   */
  checkQuestReset() {
    setInterval(() => {
      if (this.shouldResetQuests(this.questResetTime)) {
        this.resetDailyQuests();
        if (window.notificationSystem) {
          window.notificationSystem.info('🌅 Дневные квесты сброшены! Новые задания доступны.');
        }
      }
    }, 60000); // Проверяем каждую минуту
  }

  /**
   * Получить информацию о конкретном квесте
   */
  getQuest(questId) {
    return this.quests.find(q => q.id === questId);
  }

  /**
   * Получить список всех активных квестов
   */
  getActiveQuests() {
    return this.quests.filter(q => !this.completedQuests.has(q.id));
  }

  /**
   * Получить список завершённых квестов сегодня
   */
  getCompletedQuests() {
    return this.quests.filter(q => this.completedQuests.has(q.id));
  }
}

export default QuestSystem;
