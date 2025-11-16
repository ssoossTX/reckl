import GameConfig from '../constants/gameConfig.js';
import ItemUtils from '../utils/itemUtils.js';
import NotificationSystem from '../utils/NotificationSystem.js';

/**
 * Класс UIManager управляет всем пользовательским интерфейсом
 * Отделяет логику отображения от логики игры
 */
export class UIManager {
  constructor(player, dungeon, notifications) {
    this.player = player;
    this.dungeon = dungeon;
    this.notifications = notifications;

    this.elements = {};
    this.cacheElements();
  }

  cacheElements() {
    // === Основные элементы ===
    this.elements.sidebar = document.getElementById('sidebar');
    this.elements.openSidebar = document.getElementById('openSidebar');
    this.elements.closeSidebar = document.getElementById('closeSidebar');
    this.elements.menuItems = document.querySelectorAll('.menu-list li');
    this.elements.tabs = document.querySelectorAll('.tab');

    // === Кликер ===
    this.elements.clickerBtn = document.getElementById('clickerBtn');
    this.elements.clicksSpan = document.getElementById('clicks');
    this.elements.upgradeBtn = document.querySelector('.upgrade-btn');
    this.elements.prestigeBtn = document.querySelector('.prestige-btn');

    // === Профиль ===
    this.elements.playerName = document.getElementById('playerName');
    this.elements.playerLevel = document.getElementById('playerLevel');
    this.elements.playerPoints = document.getElementById('playerPoints');
    this.elements.inventoryList = document.getElementById('inventoryList');
    this.elements.abilitiesList = document.getElementById('abilitiesList');
    this.elements.diamonds = document.getElementById('diamonds');
    this.elements.expBar = document.getElementById('expBar');
    this.elements.expText = document.getElementById('expText');
    this.elements.prestigeMultiplier = document.getElementById('prestigeMultiplier');

    // === Статистика в хедере ===
    this.elements.statDiamonds = document.getElementById('stat-diamonds');
    this.elements.statClicks = document.getElementById('stat-clicks');
    this.elements.statLevel = document.getElementById('stat-level');
    this.elements.statExp = document.getElementById('stat-exp');

    // === Ключи ===
    this.elements.keyCommon = document.getElementById('keyCommon');
    this.elements.keyRare = document.getElementById('keyRare');
    this.elements.keyEpic = document.getElementById('keyEpic');

    // === Кейсы ===
    this.elements.caseBtns = document.querySelectorAll('.case-btn');

    // === Экспедиции ===
    this.elements.expeditionsDiv = document.querySelector('.expeditions');

    // === Подземелья ===
    this.elements.towersDiv = document.querySelector('.towers');
  }

  initEventListeners() {
    // === Сайдбар ===
    this.elements.openSidebar?.addEventListener('click', () => this.toggleSidebar(true));
    this.elements.closeSidebar?.addEventListener('click', () => this.toggleSidebar(false));

    // === Вкладки ===
    this.elements.menuItems.forEach(item => {
      item.addEventListener('click', () => this.switchTab(item));
    });

    // === Кликер ===
    this.elements.clickerBtn?.addEventListener('click', () => this.handleClick());
    this.elements.upgradeBtn?.addEventListener('click', () => this.handleUpgrade());
    this.elements.prestigeBtn?.addEventListener('click', () => this.handlePrestige());

    // === Способности ===
    this.elements.abilitiesList?.addEventListener('click', (e) => this.handleAbilityUpgrade(e));

    // === Инвентарь ===
    this.elements.inventoryList?.addEventListener('click', (e) => this.handleUseItem(e));

    // === Кейсы ===
    this.initCaseButtons();

    // === Кнопка сброса ===
    this.initResetButton();
  }

  // === Управление сайдбаром ===
  toggleSidebar(open) {
    if (open) {
      this.elements.sidebar?.classList.add('open');
      if (window.innerWidth <= 700) {
        document.body.classList.add('menu-open');
      }
    } else {
      this.elements.sidebar?.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  }

  // === Переключение вкладок ===
  switchTab(menuItem) {
    const active = document.querySelector('.menu-list li.active');
    if (active) active.classList.remove('active');
    menuItem.classList.add('active');

    const tabName = menuItem.dataset.tab;
    this.elements.tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabName}`)?.classList.add('active');

    this.toggleSidebar(false);
  }

  // === Обновление профиля ===
  updateProfile() {
    this.elements.playerLevel.textContent = this.player.level;
    this.elements.playerPoints.textContent = this.player.points;
    this.elements.diamonds.textContent = this.player.diamonds;

    this.elements.expBar.style.width = (this.player.exp / this.player.expToNext * 100) + '%';
    this.elements.expText.textContent = `${this.player.exp} / ${this.player.expToNext} опыта`;

    this.elements.keyCommon.textContent = this.player.keys.common;
    this.elements.keyRare.textContent = this.player.keys.rare;
    this.elements.keyEpic.textContent = this.player.keys.epic;

    this.elements.prestigeMultiplier.textContent = this.player.prestigeMultiplier.toFixed(2) + 'x';

    // === Статистика в хедере ===
    this.elements.statDiamonds.textContent = `💎 Алмазы: ${this.player.diamonds}`;
    this.elements.statClicks.textContent = `🖱️ Клики: ${this.player.clicks}`;
    this.elements.statLevel.textContent = `🏅 Уровень: ${this.player.level}`;
    this.elements.statExp.textContent = `📚 Опыт: ${this.player.exp} / ${this.player.expToNext}`;

    // === Способности с бонусами ===
    this.updateAbilityList();

    // === Клики ===
    this.elements.clicksSpan.textContent = this.player.clicks;
    this.elements.upgradeBtn.textContent = `Улучшить (+${this.player.clickPower}/клик) — ${this.player.upgradeCost} кликов`;

    // === Престиж ===
    this.elements.prestigeBtn.textContent = `Престиж — ${this.player.prestigeCost} кликов`;

    // === Инвентарь ===
    this.updateInventory();
  }

  updateAbilityList() {
    this.elements.abilitiesList.innerHTML = this.player.abilities.map((a, i) => {
      let bonus = '';
      if (i === 0 && a.value > 0) bonus = ` <span style='color:#27ae60'>(+${a.value * 3} урона)</span>`;
      if (i === 1 && a.value > 0) bonus = ` <span style='color:#2980b9'>(+${a.value * 15} HP)</span>`;
      if (i === 2 && a.value > 0) bonus = ` <span style='color:#f39c12'>(+${(a.value * 7).toFixed(0)}% опыта)</span>`;

      return `<div>${a.name}: ${a.value}${bonus} <button class='ability-up' data-idx='${i}' ${this.player.points === 0 ? 'disabled' : ''}>+</button></div>`;
    }).join('');
  }

  updateInventory() {
    if (!this.elements.inventoryList) return;

    this.elements.inventoryList.innerHTML = this.player.inventory.length ? this.player.inventory.map((obj, idx) => {
      const item = ItemUtils.getItemEffect(obj.name);
      const effectText = ItemUtils.getItemEffectText(obj.name);

      const btn = `<button class='use-item-btn' data-idx='${idx}' style='margin-left:10px;background:#27ae60;color:#fff;border:none;border-radius:5px;padding:4px 12px;cursor:pointer;'>Использовать</button>`;

      return `<div>${obj.name}${item ? ` <span style='color:#888;font-size:0.95em;'>(${item.rarity})</span>` : ''}${obj.count > 1 ? ` <span style='color:#0ff;font-weight:bold;'>×${obj.count}</span>` : ''}${effectText} ${btn}</div>`;
    }).join('') : '<em>Пусто</em>';
  }

  // === Обработчики кликов ===
  handleClick() {
    this.player.addClicks(1);
    this.elements.clicksSpan.textContent = this.player.clicks;
    this.updateProfile();
  }

  handleUpgrade() {
    if (this.player.upgradeClickPower(this.player.upgradeCost)) {
      this.updateProfile();
      this.notifications.success(`Клик улучшен! Теперь +${this.player.clickPower}/клик.`);
    } else {
      this.notifications.error(`Недостаточно кликов для улучшения! Нужно ${this.player.upgradeCost}`);
    }
  }

  handlePrestige() {
    if (this.player.clicks < this.player.prestigeCost) {
      this.notifications.error(`Недостаточно кликов для престижа! Нужно ${this.player.prestigeCost}`);
      return;
    }

    const result = this.player.performPrestige();
    if (result) {
      this.notifications.success(
        `Престиж совершен! Вы получили ${result.bonusDiamonds} алмазиков и +10% к приросту кликов!`,
        4000
      );
      this.updateProfile();
      // Обновить кнопку престижа
      this.elements.prestigeBtn.textContent = `Престиж — ${this.player.prestigeCost} кликов`;
    }
  }

  handleAbilityUpgrade(e) {
    if (e.target.classList.contains('ability-up')) {
      const idx = +e.target.dataset.idx;
      if (this.player.upgradeAbility(idx)) {
        this.updateProfile();
        this.notifications.success(`${this.player.abilities[idx].name} улучшена!`);
      }
    }
  }

  handleUseItem(e) {
    if (!e.target.classList.contains('use-item-btn')) return;

    const idx = +e.target.dataset.idx;
    const obj = this.player.inventory[idx];
    const itemName = obj.name;

    const item = ItemUtils.getItemEffect(itemName);
    if (!item) return;

    // === Применить эффект ===
    if (item.effect.includes('Восстанавливает')) {
      const amount = ItemUtils.getHealAmount(itemName);
      this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
      this.notifications.success(`Здоровье восстановлено на ${amount}!`);
    } else if (item.effect.includes('Добавляет')) {
      const amount = ItemUtils.getClickBonusAmount(itemName);
      this.player.clicks += amount;
      this.elements.clicksSpan.textContent = this.player.clicks;
      this.notifications.success(`Получено ${amount} кликов!`);
    } else if (item.effect.includes('опыт')) {
      const amount = ItemUtils.getExpBonusAmount(itemName);
      this.player.addExperience(amount);
      this.notifications.success(`Получено ${amount} опыта!`);
    } else if (item.effect.includes('уникальная способность')) {
      this.player.activateTemporaryClickBonus();
      this.notifications.info('Уникальная способность! Клики x2 на 60 секунд!', 4000);
    }

    // === Удалить предмет ===
    this.player.removeFromInventory(idx);
    this.updateProfile();
  }

  // === Инициализация кейсов ===
  initCaseButtons() {
    GameConfig.CASES.forEach((caseData, i) => {
      const btn = Array.from(this.elements.caseBtns)[i];
      if (!btn) return;

      btn.textContent = `${caseData.name} — ${caseData.price} алмазиков или 1 ключ`;

      // Кнопка инфо
      const infoBtn = document.createElement('button');
      infoBtn.textContent = 'Инфо о дропе';
      infoBtn.style = 'margin-left:12px; background:#2980b9; color:#fff; border:none; border-radius:5px; padding:6px 14px; cursor:pointer; font-size:0.95em;';
      btn.parentNode.insertBefore(infoBtn, btn.nextSibling);

      // Модальное окно дропа
      this.createDropInfoModal(caseData, infoBtn);

      // Обработчик открытия кейса
      btn.addEventListener('click', () => this.handleOpenCase(caseData));
    });
  }

  createDropInfoModal(caseData, infoBtn) {
    const dropInfo = document.createElement('div');
    dropInfo.style = 'display:none; position:fixed; left:0; top:0; width:100vw; height:100vh; background:rgba(0,0,0,0.55); z-index:99999; align-items:center; justify-content:center;';

    const loots = caseData.loot.map(item => `
      <tr style="background:${item.rarity === 'Легендарный' ? '#fff6d6' : item.rarity === 'Эпический' ? '#e5e9ff' : item.rarity === 'Редкий' ? '#e3f0fb' : '#f7fafd'}; color:${item.rarity === 'Легендарный' ? '#b9770e' : item.rarity === 'Эпический' ? '#6c5ce7' : item.rarity === 'Редкий' ? '#0984e3' : '#222'}; font-weight:${item.rarity === 'Легендарный' ? 'bold' : 'normal'}; box-shadow:0 2px 8px #0001; border-radius:8px;">
        <td style='padding:10px 12px;'>${item.rarity === 'Легендарный' ? '👑' : item.rarity === 'Эпический' ? '💎' : item.rarity === 'Редкий' ? '🔷' : ''} ${item.name}</td>
        <td style='padding:10px 12px;'>${item.rarity}</td>
        <td style='padding:10px 12px;'>${item.chance}%</td>
        <td style='padding:10px 12px;'>${item.effect}</td>
      </tr>
    `).join('');

    dropInfo.innerHTML = `<div class='drop-info-content' style='background:linear-gradient(135deg,#f8fafc 60%,#e0e7ef 100%); color:#222; border-radius:22px; padding:44px 36px; min-width:320px; max-width:96vw; box-shadow:0 12px 48px #0008; text-align:center; position:relative; font-family:inherit; border:2px solid #dfe6e9;'>
      <h2 style='margin-top:0; margin-bottom:22px; font-size:1.7em; letter-spacing:0.5px; color:#2980b9; text-shadow:0 2px 8px #dfe6e9;'>${caseData.name} — дроп</h2>
      <table style='width:100%; border-collapse:separate; border-spacing:0 10px; margin-bottom:28px; font-size:1.13em;'>
        <thead><tr style='background:#f7fafd; color:#2980b9; font-weight:700;'><th style="padding:10px 12px; border-radius:10px 0 0 10px;">🎁 Предмет</th><th style="padding:10px 12px;">⭐ Редкость</th><th style="padding:10px 12px;">🎲 Шанс</th><th style="padding:10px 12px; border-radius:0 10px 10px 0;">✨ Эффект</th></tr></thead>
        <tbody>${loots}</tbody>
      </table>
      <button class='close-drop-info' style='background:linear-gradient(90deg,#e74c3c,#c0392b); color:#fff; border:none; border-radius:10px; padding:14px 44px; font-size:1.13em; cursor:pointer; box-shadow:0 2px 12px #e74c3c33; transition:background .2s; font-weight:600; letter-spacing:0.5px;'>Закрыть</button>
    </div>`;

    document.body.appendChild(dropInfo);

    infoBtn.addEventListener('click', () => {
      dropInfo.style.display = 'flex';
    });

    dropInfo.querySelector('.close-drop-info').addEventListener('click', () => {
      dropInfo.style.display = 'none';
    });
  }

  handleOpenCase(caseData) {
    if (this.player.diamonds < caseData.price && this.player.keys[caseData.key] <= 0) {
      this.notifications.error('Недостаточно алмазиков или ключей!');
      return;
    }

    // Выбор предмета по шансам
    let rand = Math.random() * 100, sum = 0, lootItem = caseData.loot[0];
    for (let item of caseData.loot) {
      sum += item.chance;
      if (rand < sum) { lootItem = item; break; }
    }

    if (this.player.diamonds >= caseData.price) {
      this.player.diamonds -= caseData.price;
    } else if (this.player.keys[caseData.key] > 0) {
      this.player.keys[caseData.key]--;
    }

    this.player.addToInventory(lootItem.name);
    this.updateProfile();

    this.notifications.success(
      `Вы получили: ${lootItem.name} (${lootItem.rarity}) — ${lootItem.effect}`
    );
  }

  // === Кнопка сброса ===
  initResetButton() {
    const clickerTab = document.getElementById('tab-clicker');
    if (!clickerTab || document.getElementById('resetGameBtn')) return;

    const resetWrap = document.createElement('div');
    resetWrap.style = 'display:flex; justify-content:center; margin-top:32px;';
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetGameBtn';
    resetBtn.textContent = 'Сбросить игру';
    resetBtn.style = 'background:#e74c3c; color:#fff; border:none; border-radius:6px; padding:12px 28px; font-size:1.1em; cursor:pointer;';
    resetBtn.onclick = () => {
      if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
        window.dispatchEvent(new CustomEvent('resetGame'));
      }
    };
    resetWrap.appendChild(resetBtn);
    clickerTab.appendChild(resetWrap);
  }
}

export default UIManager;
