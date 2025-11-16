/**
 * GameModes - Система специальных игровых режимов
 */

class GameModes {
  constructor(dungeonSystem, player, statisticsManager) {
    this.dungeonSystem = dungeonSystem;
    this.player = player;
    this.statisticsManager = statisticsManager;
    this.modes = this.initModes();
    this.activeModes = new Set();
    this.modeTimers = {};
  }

  initModes() {
    return {
      wave: {
        id: 'wave',
        name: 'Волна врагов',
        icon: '🌊',
        description: 'Побеждай волны врагов с растущей сложностью и бонусами',
        unlocked: true,
        requirements: { level: 5 },
        rewards: {
          exp: 'x1.5',
          diamonds: 'x1.3',
          loot: 'x2'
        },
        stats: {
          enemyCount: 10,
          difficultyMultiplier: 1,
          currentWave: 0
        },
        cost: 50
      },
      bossRaid: {
        id: 'bossRaid',
        name: 'Босс рейд',
        icon: '👑',
        description: 'Специальное событие раз в день - встреча с могущественным боссом',
        unlocked: true,
        requirements: { level: 10 },
        rewards: {
          exp: 'x3',
          diamonds: 'x5',
          loot: 'x10'
        },
        stats: {
          bossHealth: 10000,
          lastRaidTime: 0,
          raidCooldown: 24 * 60 * 60 * 1000 // 24 часа
        },
        cost: 0,
        cooldown: '24ч'
      },
      speedRun: {
        id: 'speedRun',
        name: 'Забег на время',
        icon: '⚡',
        description: 'Пройди как можно дальше за 5 минут. Чем больше этажей - тем больше наград',
        unlocked: true,
        requirements: { level: 8 },
        rewards: {
          exp: 'x2',
          diamonds: 'x1.5',
          bonus: 'По этажам'
        },
        stats: {
          timeLimit: 5 * 60 * 1000, // 5 минут
          currentFloor: 0,
          startTime: 0,
          isActive: false
        },
        cost: 25
      },
      endless: {
        id: 'endless',
        name: 'Бесконечность',
        icon: '∞',
        description: 'Прошибей как можно дальше в подземелье. Нет лимита этажей',
        unlocked: true,
        requirements: { level: 15 },
        rewards: {
          exp: 'По этажам',
          diamonds: 'По этажам',
          loot: 'x3'
        },
        stats: {
          currentFloor: 0,
          personalBest: 0
        },
        cost: 100
      },
      challenge: {
        id: 'challenge',
        name: 'Испытание на сложность',
        icon: '🏆',
        description: 'Увеличенная сложность врагов, но экспоненциальные награды',
        unlocked: true,
        requirements: { level: 12 },
        rewards: {
          exp: 'x10',
          diamonds: 'x8',
          loot: 'x5'
        },
        stats: {
          enemyDifficultyMultiplier: 2,
          currentFloor: 0
        },
        cost: 75
      },
      survival: {
        id: 'survival',
        name: 'Выживание',
        icon: '💪',
        description: 'Ты получаешь 1 здоровье. Продержись как можно дольше',
        unlocked: true,
        requirements: { level: 20 },
        rewards: {
          exp: 'x5',
          diamonds: 'x10',
          achievement: 'Легендарный выживший'
        },
        stats: {
          health: 1,
          enemiesDefeated: 0
        },
        cost: 0,
        hardcore: true
      }
    };
  }

  /**
   * Получить список всех режимов
   */
  getAllModes() {
    return Object.values(this.modes);
  }

  /**
   * Получить разблокированные режимы
   */
  getUnlockedModes() {
    return Object.values(this.modes).filter(mode => 
      this.checkRequirements(mode.requirements)
    );
  }

  /**
   * Проверить требования для режима
   */
  checkRequirements(requirements) {
    if (requirements.level && this.player.level < requirements.level) {
      return false;
    }
    return true;
  }

  /**
   * Запустить режим
   */
  startMode(modeId) {
    const mode = this.modes[modeId];
    if (!mode) return false;

    // Проверяем требования
    if (!this.checkRequirements(mode.requirements)) {
      return false;
    }

    // Проверяем стоимость
    if (mode.cost && this.player.diamonds < mode.cost) {
      return false;
    }

    // Проверяем кулдаун
    if (mode.stats.lastRaidTime && mode.stats.raidCooldown) {
      const timeSinceLastRaid = Date.now() - mode.stats.lastRaidTime;
      if (timeSinceLastRaid < mode.stats.raidCooldown) {
        return false;
      }
    }

    // Платим стоимость
    if (mode.cost) {
      this.player.diamonds -= mode.cost;
    }

    // Включаем режим
    this.activeModes.add(modeId);
    mode.stats.isActive = true;

    // Запускаем логику режима
    this.initModeLogic(modeId);

    return true;
  }

  /**
   * Инициализировать логику режима
   */
  initModeLogic(modeId) {
    switch (modeId) {
      case 'wave':
        this.startWaveMode();
        break;
      case 'bossRaid':
        this.startBossRaid();
        break;
      case 'speedRun':
        this.startSpeedRun();
        break;
      case 'endless':
        this.startEndless();
        break;
      case 'challenge':
        this.startChallenge();
        break;
      case 'survival':
        this.startSurvival();
        break;
    }
  }

  /**
   * Режим: Волна
   */
  startWaveMode() {
    const mode = this.modes.wave;
    mode.stats.currentWave = 1;
    mode.stats.difficultyMultiplier = 1;
    
    // Первая волна начинается
    this.waveSpawnEnemies(mode);
  }

  waveSpawnEnemies(mode) {
    // Врагами спауны в зависимости от волны
    // После каждой волны сложность растёт на 10%
    mode.stats.difficultyMultiplier += 0.1;
    mode.stats.currentWave++;
  }

  /**
   * Режим: Босс рейд
   */
  startBossRaid() {
    const mode = this.modes.bossRaid;
    mode.stats.lastRaidTime = Date.now();
    
    // Создаём особого босса с 10000 HP
    const specialBoss = {
      name: '👑 Верховный Босс',
      hp: 10000,
      maxHp: 10000,
      atk: 50,
      exp: 500,
      isBoss: true,
      isSpecial: true
    };
    
    // Инициируем боевую систему с боссом
    return specialBoss;
  }

  /**
   * Режим: Забег на время
   */
  startSpeedRun() {
    const mode = this.modes.speedRun;
    mode.stats.isActive = true;
    mode.stats.startTime = Date.now();
    mode.stats.currentFloor = 0;
    
    // Запускаем таймер
    const timeLeft = setInterval(() => {
      const elapsed = Date.now() - mode.stats.startTime;
      
      if (elapsed >= mode.stats.timeLimit) {
        clearInterval(timeLeft);
        this.endSpeedRun(mode);
      }
    }, 1000);
  }

  endSpeedRun(mode) {
    const floors = mode.stats.currentFloor;
    const reward = floors * 100; // 100 опыта за этаж
    
    this.player.addExperience(reward);
    this.activeModes.delete('speedRun');
    mode.stats.isActive = false;
  }

  /**
   * Режим: Бесконечность
   */
  startEndless() {
    const mode = this.modes.endless;
    mode.stats.currentFloor = 0;
  }

  /**
   * Режим: Испытание на сложность
   */
  startChallenge() {
    const mode = this.modes.challenge;
    mode.stats.currentFloor = 0;
    
    // Враги будут в 2 раза сильнее, но награды в 10 раз больше
    this.dungeonSystem.enemyDifficultyMultiplier = mode.stats.enemyDifficultyMultiplier;
  }

  /**
   * Режим: Выживание (хардкор)
   */
  startSurvival() {
    const mode = this.modes.survival;
    mode.stats.health = 1;
    mode.stats.enemiesDefeated = 0;
    
    // Специальное уведомление
    if (window.notificationSystem) {
      window.notificationSystem.error('💀 Режим выживания: 1 здоровье. Смерть означает конец!');
    }
  }

  /**
   * Завершить режим
   */
  endMode(modeId, success = true) {
    const mode = this.modes[modeId];
    if (!mode) return;

    this.activeModes.delete(modeId);
    mode.stats.isActive = false;
  }

  /**
   * Получить активные режимы
   */
  getActiveModes() {
    return Array.from(this.activeModes).map(id => this.modes[id]);
  }

  /**
   * Применить бонусы режима к наградам
   */
  applyModeRewards(modeId, baseReward) {
    const mode = this.modes[modeId];
    if (!mode) return baseReward;

    const rewards = {
      exp: baseReward.exp,
      diamonds: baseReward.diamonds,
      loot: baseReward.loot
    };

    // Применяем мультипликаторы режима
    if (mode.rewards.exp && typeof mode.rewards.exp === 'string') {
      const mult = parseFloat(mode.rewards.exp.replace('x', ''));
      rewards.exp = Math.round(rewards.exp * mult);
    }

    if (mode.rewards.diamonds && typeof mode.rewards.diamonds === 'string') {
      const mult = parseFloat(mode.rewards.diamonds.replace('x', ''));
      rewards.diamonds = Math.round(rewards.diamonds * mult);
    }

    return rewards;
  }

  /**
   * Получить информацию о режиме
   */
  getModeInfo(modeId) {
    const mode = this.modes[modeId];
    return {
      ...mode,
      canPlay: this.checkRequirements(mode.requirements),
      unlocked: this.checkRequirements(mode.requirements)
    };
  }

  /**
   * Получить достижение за режим
   */
  getAchievements() {
    return [
      { title: 'Волновой мастер', condition: 'Победи 50 волн', reward: 100 },
      { title: 'Убийца боссов', condition: 'Победи 10 боссов', reward: 200 },
      { title: 'Спринтер', condition: 'Пройди 20 этажей за 5 минут', reward: 150 },
      { title: 'Бесконечный воин', condition: 'Достигни 50 этажа в режиме бесконечности', reward: 300 },
      { title: 'Выжившийнет', condition: 'Победи 100 врагов в режиме выживания', reward: 250 }
    ];
  }
}

export default GameModes;
