/**
 * Главное приложение - оркестрирует все модули игры
 * Это единая точка инициализации и управления
 */

import { Player } from './modules/Player.js';
import { DungeonSystem } from './modules/DungeonSystem.js';
import { StorageManager } from './modules/StorageManager.js';
import { UIManager } from './modules/UIManager.js';
import QuestSystem from './modules/QuestSystem.js';
import StatisticsManager from './modules/StatisticsManager.js';
import SkillTree from './modules/SkillTree.js';
import GameModes from './modules/GameModes.js';
import NotificationSystem from './utils/NotificationSystem.js';
import particleSystem from './utils/ParticleSystem.js';
import GameConfig from './constants/gameConfig.js';
import ItemUtils from './utils/itemUtils.js';

class GameApp {
  constructor() {
    this.player = null;
    this.dungeon = null;
    this.ui = null;
    this.notifications = null;
    this.questSystem = null;
    this.statistics = null;
    this.skillTree = null;
    this.gameModes = null;
    this.gameLoopInterval = null;
  }

  async initialize() {
    console.log('Инициализация игры...');

    // === Загрузить прогресс ===
    const { player, dungeon } = StorageManager.loadGame();
    this.player = player;
    this.dungeon = dungeon;

    // === Инициализировать системы ===
    this.notifications = new NotificationSystem();
    this.questSystem = new QuestSystem(this.player, StorageManager);
    this.statistics = new StatisticsManager(this.player, StorageManager);
    this.skillTree = new SkillTree(this.player);
    this.gameModes = new GameModes(this.dungeon, this.player, this.statistics);
    this.ui = new UIManager(this.player, this.dungeon, this.notifications, this.questSystem, this.statistics, this.skillTree, this.gameModes, particleSystem);

    // === Установить обработчики ===
    this.ui.initEventListeners();
    this.initGameLoopInterval();
    this.initCustomEvents();
    this.adjustHamburgerPosition();

    // === Первичное обновление UI ===
    this.ui.updateProfile();

    // === Инициализировать экспедиции и подземелья ===
    this.initExpeditions();
    this.initDungeons();

    console.log('Игра инициализирована!');
    this.notifications.info('Добро пожаловать в Кликер RPG!');
  }

  // === Основной цикл игры ===
  initGameLoopInterval() {
    this.gameLoopInterval = setInterval(() => {
      // Проверка активности временного бонуса
      if (this.player.isClickBonusActive()) {
        // Обновить UI если нужно
      }

      // Сохранение каждые 5 секунд
      if (Math.random() < 0.1) {
        this.saveProgress();
      }
    }, 500);
  }

  // === Пользовательские события ===
  initCustomEvents() {
    window.addEventListener('resetGame', () => {
      if (StorageManager.resetGame()) {
        this.notifications.success('Игра сброшена. Перезагрузка...');
        setTimeout(() => location.reload(), 500);
      }
    });

    // Сохранение при закрытии вкладки/окна
    window.addEventListener('beforeunload', () => {
      this.saveProgress();
    });
  }

  saveProgress() {
    StorageManager.saveGame(this.player, this.dungeon);
  }

  // === Инициализация экспедиций ===
  initExpeditions() {
    const expeditionsDiv = document.querySelector('.expeditions');
    if (!expeditionsDiv) return;

    // Тренировочная экспедиция
    if (!expeditionsDiv.querySelector('.training')) {
      const trainBtn = document.createElement('button');
      trainBtn.className = 'expedition-btn training';
      trainBtn.textContent = 'Тренировочная экспедиция (доступно с 0 ур.)';
      trainBtn.addEventListener('click', () => {
        const realExp = this.player.addExperience(2);
        this.notifications.info(`Вы получили ${realExp} опыта за тренировочную экспедицию!`);
        this.ui.updateProfile();
        this.saveProgress();
      });
      expeditionsDiv.prepend(trainBtn);
    }

    // Обычные экспедиции
    this.setupExpeditionButtons();
  }

  setupExpeditionButtons() {
    const expeditionConfig = [
      { className: 'easy', config: GameConfig.EXPEDITIONS.EASY },
      { className: 'medium', config: GameConfig.EXPEDITIONS.MEDIUM },
      { className: 'hard', config: GameConfig.EXPEDITIONS.HARD },
      { className: 'extreme', config: GameConfig.EXPEDITIONS.EXTREME },
    ];

    expeditionConfig.forEach(({ className, config }) => {
      const btn = document.querySelector(`.expedition-btn.${className}`);
      if (!btn) return;

      btn.textContent += ` (c ${config.requiredLevel} ур.)`;

      btn.addEventListener('click', () => {
        if (this.player.level < config.requiredLevel) {
          this.notifications.error(`Требуется ${config.requiredLevel} уровень для этой экспедиции!`);
          return;
        }

        const expeditionKey = `expeditionTimer_${className}`;
        const saved = StorageManager.loadExpeditionTimer(className);

        if (saved) {
          this.notifications.info('Экспедиция уже выполняется!');
          return;
        }

        // Запустить экспедицию
        const endTime = Date.now() + config.duration * 1000;
        StorageManager.saveExpeditionTimer(className, endTime, config.expReward, config.dropChance, config.drops);

        this.runExpeditionTimer(className, config, endTime, btn);
      });
    });

    // Проверить активные экспедиции при загрузке
    this.restoreActiveExpeditions(expeditionConfig);
  }

  runExpeditionTimer(className, config, endTime, btn) {
    const originalText = btn.textContent;
    btn.disabled = true;

    const timer = setInterval(() => {
      const left = Math.ceil((endTime - Date.now()) / 1000);

      if (left <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = originalText;

        // Выдать награду
        const realExp = this.player.addExperience(config.expReward);
        this.notifications.success(`${originalText.split('(')[0].trim()} завершена! Получено ${realExp} опыта.`);

        if (Math.random() < config.dropChance) {
          const drop = config.drops[Math.floor(Math.random() * config.drops.length)];
          this.player.addToInventory(drop);
          this.notifications.info(`Бонус: найден предмет — ${drop}!`);
        }

        StorageManager.clearExpeditionTimer(className);
        this.ui.updateProfile();
        this.saveProgress();
      } else {
        btn.textContent = `Экспедиция в пути... (${left} сек)`;
      }
    }, 1000);
  }

  restoreActiveExpeditions(expeditionConfig) {
    expeditionConfig.forEach(({ className, config }) => {
      const saved = StorageManager.loadExpeditionTimer(className);
      if (!saved) return;

      const left = Math.ceil((saved.endTime - Date.now()) / 1000);
      if (left <= 0) {
        StorageManager.clearExpeditionTimer(className);
      } else {
        const btn = document.querySelector(`.expedition-btn.${className}`);
        if (btn) {
          this.runExpeditionTimer(className, config, saved.endTime, btn);
        }
      }
    });
  }

  // === Инициализация подземелий ===
  initDungeons() {
    const towersDiv = document.querySelector('.towers');
    if (!towersDiv) return;

    // Тренировочное подземелье
    if (!towersDiv.querySelector('.training')) {
      const trainBtn = document.createElement('button');
      trainBtn.className = 'tower-btn training';
      trainBtn.textContent = 'Тренировочное подземелье (выбор монстра)';
      trainBtn.addEventListener('click', () => this.openTrainingDungeonModal());
      towersDiv.prepend(trainBtn);
    }

    // Кнопки башен
    this.renderTowerButtons();
  }

  renderTowerButtons() {
    const towersDiv = document.querySelector('.towers');
    if (!towersDiv) return;

    let buttonsDiv = document.getElementById('dungeonStartBtns');
    if (buttonsDiv) buttonsDiv.remove();

    const wrap = document.createElement('div');
    wrap.id = 'dungeonStartBtns';
    wrap.style = 'margin:18px 0 0 0;display:flex;gap:12px;flex-wrap:wrap;';

    // Кнопка продолжить подземелье
    if (this.dungeon.isActive) {
      const contBtn = document.createElement('button');
      contBtn.textContent = 'Продолжить подземелье';
      contBtn.style = 'background:#27ae60;color:#fff;padding:10px 18px;border:none;border-radius:7px;font-size:1.1em;cursor:pointer;';
      contBtn.addEventListener('click', () => this.renderDungeonUI());
      wrap.appendChild(contBtn);
    }

    // Кнопки башен
    GameConfig.TOWERS.NAMES.forEach((name, idx) => {
      const btn = document.createElement('button');
      btn.textContent = `Войти в "${name}"`;
      btn.style = 'background:#8e44ad;color:#fff;padding:10px 18px;border:none;border-radius:7px;font-size:1.1em;cursor:pointer;';
      btn.addEventListener('click', () => this.startDungeon(idx));

      if (this.dungeon.isActive && this.dungeon.state?.tower === idx) {
        btn.disabled = true;
        btn.textContent += ' (идёт прохождение)';
      }

      wrap.appendChild(btn);
    });

    towersDiv.appendChild(wrap);
  }

  startDungeon(towerIndex) {
    try {
      this.dungeon.initializeTower(towerIndex, this.player.getMaxDungeonHp());
      this.renderDungeonUI();
    } catch (e) {
      this.notifications.error(e.message);
    }
  }

  openTrainingDungeonModal() {
    // TODO: Реализовать интерфейс выбора тренировочного подземелья
    this.notifications.info('Тренировочное подземелье в разработке');
  }

  renderDungeonUI() {
    if (!this.dungeon.isActive || !this.dungeon.state) {
      let modal = document.getElementById('dungeonUI');
      if (modal) modal.style.display = 'none';
      return;
    }

    let modal = document.getElementById('dungeonUI');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dungeonUI';
      modal.style = 'position:fixed;left:0;top:0;width:100vw;height:100vh;background:linear-gradient(135deg,#181c24 60%,#232b39 100%);z-index:99999;display:flex;align-items:center;justify-content:center;';
      document.body.appendChild(modal);
    }

    const m = this.dungeon.state.monster;
    const playerDmg = this.player.getPlayerDamage();

    modal.style.display = 'flex';
    modal.innerHTML = `<div style='background:rgba(24,28,36,0.98);border-radius:18px;box-shadow:0 8px 32px #000a;padding:36px 44px;min-width:340px;max-width:96vw;text-align:center;position:relative;color:#fff;'>
      <h2 style='margin-bottom:10px;'>Этаж ${this.dungeon.state.floor}${m.isBoss ? ' <span style="color:#e67e22;">(Босс)</span>' : ''}</h2>
      <div style='font-size:1.3em;font-weight:bold;margin-bottom:10px;'>${m.name} <span style="color:#888;">[${m.rank}]</span></div>
      <div style='margin-bottom:10px;'>Здоровье монстра: <b>${this.dungeon.state.monsterHp}</b> / ${m.hp}</div>
      <div style='margin-bottom:10px;'>Атака монстра: <b>${m.atk}</b></div>
      <div style='margin-bottom:18px;'>Ваша атака: <b>${playerDmg}</b></div>
      <div style='margin-bottom:18px;'>Ваше здоровье: <b>${this.dungeon.state.playerHp}</b> / ${this.player.getMaxDungeonHp()}</div>
      <button id='dungeonAttackBtn' style='background:#27ae60;color:#fff;padding:10px 28px;border:none;border-radius:7px;font-size:1.1em;margin:0 8px 12px 0;cursor:pointer;'>Атаковать</button>
      <button id='dungeonHealBtn' style='background:#2980b9;color:#fff;padding:10px 18px;border:none;border-radius:7px;font-size:1.1em;margin:0 8px 12px 0;cursor:pointer;'>Использовать предмет</button>
      <button id='dungeonExitBtn' style='background:#f1c40f;color:#222;padding:10px 18px;border:none;border-radius:7px;font-size:1.1em;margin:0 8px 12px 0;cursor:pointer;'>Сохранить и выйти</button>
      <button id='dungeonGiveUpBtn' style='background:#e74c3c;color:#fff;padding:10px 18px;border:none;border-radius:7px;font-size:1.1em;margin:0 8px 12px 0;cursor:pointer;'>Сдаться</button>
      <div id='dungeonMsg' style='margin-top:18px;min-height:32px;'></div>
    </div>`;

    document.getElementById('dungeonAttackBtn').onclick = () => this.handleDungeonAttack();
    document.getElementById('dungeonHealBtn').onclick = () => this.handleDungeonUseItem();
    document.getElementById('dungeonExitBtn').onclick = () => this.handleDungeonExit();
    document.getElementById('dungeonGiveUpBtn').onclick = () => this.handleDungeonGiveUp();
  }

  handleDungeonAttack() {
    const playerDmg = this.player.getPlayerDamage();
    const result = this.dungeon.dealPlayerDamage(playerDmg);

    if (!result) return;

    let msg = document.getElementById('dungeonMsg');
    msg.innerHTML = `Вы нанесли ${playerDmg} урона!`;

    setTimeout(() => {
      if (result.result === 'victory') {
        const exp = this.dungeon.getMonsterExpReward();
        const realExp = this.player.addExperience(exp);

        let loot = result.monster.drops[Math.floor(Math.random() * result.monster.drops.length)];
        this.player.addToInventory(loot);

        let victoryMsg = `<br>Монстр повержен!<br><span style='color:#3498db;'>Получено опыта: ${realExp}</span><br>Добыча: <b>${loot}</b>`;

        if (result.relicDrop) {
          this.player.addToInventory('Камень времени');
          victoryMsg += `<br><span style='color:#e67e22;font-weight:bold;'>Вам выпала реликвия: Камень времени!</span>`;
        }

        msg.innerHTML += victoryMsg;

        this.dungeon.nextFloor(this.player.getMaxDungeonHp());

        setTimeout(() => {
          this.renderDungeonUI();
          this.ui.updateProfile();
          this.saveProgress();
        }, 1200);
      } else if (result.result === 'defeat') {
        msg.innerHTML += '<br><span style="color:#e74c3c;font-weight:bold;">Вы проиграли! Вас выбросило из подземелья.</span>';
        this.player.health = 1;
        this.dungeon.giveUp();

        setTimeout(() => {
          document.getElementById('dungeonUI').style.display = 'none';
          this.ui.updateProfile();
          this.renderTowerButtons();
          this.saveProgress();
        }, 1500);
      } else {
        msg.innerHTML += `<br>Монстр атакует и наносит ${result.monsterDamage} урона!`;
        setTimeout(() => this.renderDungeonUI(), 600);
      }
    }, 600);
  }

  handleDungeonUseItem() {
    const healItems = this.player.inventory.filter(obj => ItemUtils.isHealItem(obj.name));

    if (!healItems.length) {
      this.notifications.error('Нет предметов для лечения!');
      return;
    }

    let list = healItems.map((obj, idx) => {
      const effect = ItemUtils.getItemEffectText(obj.name);
      return `<button class='heal-btn' style='margin:4px 0;' data-idx='${idx}'>${obj.name} ×${obj.count} ${effect}</button>`;
    }).join('<br>');

    const modal = document.createElement('div');
    modal.style = 'position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(24,28,36,0.92);z-index:100000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `<div style='background:#232b39;padding:32px 28px;border-radius:16px;min-width:220px;text-align:center;color:#fff;'><h3>Выберите предмет для лечения</h3>${list}<br><button class='cancel-btn'>Отмена</button></div>`;
    document.body.appendChild(modal);

    modal.querySelectorAll('.heal-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.idx;
        const obj = healItems[idx];
        const amount = ItemUtils.getHealAmount(obj.name);

        this.dungeon.state.playerHp = Math.min(this.player.getMaxDungeonHp(), this.dungeon.state.playerHp + amount);

        this.notifications.success(`Здоровье восстановлено на ${amount}!`);

        // Найти в основном инвентаре и удалить
        const mainIdx = this.player.inventory.findIndex(x => x.name === obj.name);
        if (mainIdx >= 0) {
          this.player.removeFromInventory(mainIdx);
        }

        this.ui.updateProfile();
        this.saveProgress();
        modal.remove();
        this.renderDungeonUI();
      };
    });

    modal.querySelector('.cancel-btn').onclick = () => modal.remove();
  }

  handleDungeonExit() {
    this.notifications.info('Прогресс подземелья сохранён.');
    document.getElementById('dungeonUI').style.display = 'none';
    this.saveProgress();
    this.renderTowerButtons();
  }

  handleDungeonGiveUp() {
    this.notifications.error('Вы сдались и покинули подземелье.');
    this.player.health = this.dungeon.giveUp();
    this.dungeon.giveUp();
    document.getElementById('dungeonUI').style.display = 'none';
    this.ui.updateProfile();
    this.renderTowerButtons();
    this.saveProgress();
  }

  // === Динамический расчёт позиции гамбургер-кнопки ===
  adjustHamburgerPosition() {
    const hamburger = document.getElementById('openSidebar');
    const headerPanel = document.querySelector('.header-panel');
    
    if (!hamburger || !headerPanel) return;

    const updatePosition = () => {
      const headerHeight = headerPanel.offsetHeight;
      const hamburgerSize = window.innerWidth <= 600 ? 44 : 48;
      const gap = 10; // зазор между header и гамбургером
      
      hamburger.style.top = (headerHeight + gap) + 'px';
    };

    // Обновить при загрузке
    updatePosition();
    
    // Переобновить при изменении размера окна
    window.addEventListener('resize', updatePosition);
  }
}

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  window.gameApp = app; // Для отладки
  app.initialize();
});
