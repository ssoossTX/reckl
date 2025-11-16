# 📁 Структура проекта - Полная документация

## 🎯 Обзор

Проект "Кликер RPG" имеет четкую иерархическую структуру, разделенную на логические модули.

---

## 📂 Корневая папка

```
reckl/
├── index.html                 # Главная HTML страница
├── README.md                  # Информация о проекте
├── REFACTORING.md             # Подробное описание рефакторинга
├── MIGRATION.md               # Инструкции по миграции
├── SUMMARY.md                 # Итоговая сводка
├── ARCHITECTURE.md            # Этот файл - структура проекта
│
├── src/                       # Исходный код приложения
│   ├── app.js                # Главное приложение (entry point)
│   │
│   ├── constants/            # Константы и конфигурация
│   │   └── gameConfig.js     # Все конфиги игры (50+ констант)
│   │
│   ├── modules/              # Основные классы/модули
│   │   ├── Player.js         # Управление игроком (250 строк)
│   │   ├── DungeonSystem.js  # Система подземелий (300 строк)
│   │   ├── StorageManager.js # Управление сохранениями (150 строк)
│   │   └── UIManager.js      # Управление интерфейсом (400 строк)
│   │
│   └── utils/                # Вспомогательные функции
│       ├── itemUtils.js      # Утилиты работы с предметами (100 строк)
│       └── NotificationSystem.js # Toast уведомления (70 строк)
│
├── css/                       # Стили CSS
│   ├── style.css             # Основные стили (350 строк)
│   └── components.css        # Стили компонентов (250 строк)
│
├── script.js                  # ❌ СТАРЫЙ файл (можно удалить)
├── style.css                  # ❌ СТАРЫЙ файл (можно удалить)
└── IMG_20250114_111552_356.jpg # Фоновое изображение
```

---

## 🔍 Подробное описание каждого файла

### `src/app.js` (Главное приложение)
**Размер:** ~400 строк  
**Назначение:** Оркестрация всех модулей и управление жизненным циклом

```javascript
class GameApp {
  - initialize()           // Инициализация игры
  - initGameLoopInterval() // Основной цикл
  - initCustomEvents()     // Обработчики событий
  - saveProgress()         // Сохранение прогресса
  - initExpeditions()      // Инициализация экспедиций
  - initDungeons()         // Инициализация подземелий
  - startDungeon()         // Запуск подземелья
  - renderDungeonUI()      // Отрисовка боевого интерфейса
  - handleDungeonAttack()  // Обработка атаки
  - handleDungeonUseItem() // Использование предмета
  - handleDungeonExit()    // Выход из подземелья
}
```

### `src/constants/gameConfig.js` (Конфигурация)
**Размер:** ~200 строк  
**Назначение:** Все магические числа в одном месте

```javascript
GameConfig {
  CLICK {
    INITIAL_POWER: 1
    INITIAL_UPGRADE_COST: 10
    UPGRADE_COST_MULTIPLIER: 1.5
    ...
  }
  
  PRESTIGE {
    INITIAL_COST: 1000
    COST_MULTIPLIER: 2.2
    MULTIPLIER_GROWTH: 1.1
  }
  
  EXPERIENCE {
    INITIAL_EXP_TO_NEXT: 20
    EXP_CURVE_MULTIPLIER: 1.2
    ...
  }
  
  CASES [...] // 3 типа кейсов
  EXPEDITIONS {...} // 4 типа экспедиций
  TOWERS {...} // 5 башен
  COMBAT {...} // Параметры боя
  ABILITIES {...} // Способности
  ITEM_EFFECTS {...} // Эффекты предметов
  STORAGE_KEY: 'rpgSave'
}
```

### `src/modules/Player.js` (Модель игрока)
**Размер:** ~250 строк  
**Назначение:** Инкапсуляция всех данных и логики игрока

```javascript
class Player {
  constructor(data)              // Инициализация
  initializeNew()               // Новая игра
  
  // Геттеры бонусов
  getAbilityBonus(index)
  getStrengthBonus()
  getAgilityBonus()
  getIntellectBonus()
  
  // Боевая система
  getPlayerDamage()
  getMaxDungeonHp()
  
  // Опыт
  addExperience(amount)
  levelUp()
  
  // Клики
  addClicks(amount)
  upgradeClickPower(cost)
  
  // Способности
  upgradeAbility(index)
  
  // Инвентарь
  addToInventory(itemName)
  removeFromInventory(index)
  
  // Престиж
  performPrestige()
  
  // Предметы
  activateTemporaryClickBonus()
  isClickBonusActive()
  
  // Сохранение
  toJSON()
}
```

### `src/modules/DungeonSystem.js` (Боевая система)
**Размер:** ~300 строк  
**Назначение:** Управление боями в подземельях

```javascript
class DungeonSystem {
  constructor()                 // Инициализация
  initializeTower(index, hp)   // Вход в башню
  generateFloor(playerMaxHp)   // Генерация этажа
  dealPlayerDamage(damage)     // Урон от игрока
  nextFloor(playerMaxHp)       // Следующий этаж
  getMonsterExpReward()        // Опыт за монстра
  exit()                       // Выход с сохранением
  giveUp()                     // Сдача
  
  _getMonsterPool(towerIndex)  // Получить врагов
  toJSON()                     // Сохранение
  static fromJSON(data)        // Восстановление
}
```

### `src/modules/StorageManager.js` (Хранилище)
**Размер:** ~150 строк  
**Назначение:** Работа с localStorage и сохранениями

```javascript
class StorageManager {
  static saveGame(player, dungeon)        // Сохранить игру
  static loadGame()                       // Загрузить игру
  static resetGame()                      // Сброс прогресса
  
  static saveExpeditionTimer(...)         // Сохранить таймер
  static loadExpeditionTimer(...)         // Загрузить таймер
  static clearExpeditionTimer(...)        // Удалить таймер
  
  // Приватные методы для миграции данных
}
```

### `src/modules/UIManager.js` (Интерфейс)
**Размер:** ~400 строк  
**Назначение:** Управление всеми элементами UI

```javascript
class UIManager {
  constructor(player, dungeon, notifications)
  
  // Кэширование и инициализация
  cacheElements()
  initEventListeners()
  
  // Обновление профиля
  updateProfile()
  updateAbilityList()
  updateInventory()
  
  // Управление UI
  toggleSidebar(open)
  switchTab(menuItem)
  
  // Обработчики действий
  handleClick()
  handleUpgrade()
  handlePrestige()
  handleAbilityUpgrade(e)
  handleUseItem(e)
  
  // Кейсы
  initCaseButtons()
  createDropInfoModal(caseData, infoBtn)
  handleOpenCase(caseData)
  
  // Кнопка сброса
  initResetButton()
}
```

### `src/utils/itemUtils.js` (Утилиты предметов)
**Размер:** ~100 строк  
**Назначение:** Логика работы с предметами

```javascript
export const ItemUtils {
  getItemEffect(itemName)
  getItemEffectText(itemName)
  getHealAmount(itemName)
  getClickBonusAmount(itemName)
  getExpBonusAmount(itemName)
  isHealItem(itemName)
}
```

### `src/utils/NotificationSystem.js` (Уведомления)
**Размер:** ~70 строк  
**Назначение:** Toast-уведомления

```javascript
class NotificationSystem {
  constructor()
  init()                          // Инициализация стилей
  show(message, type, duration)  // Показать уведомление
  success(message, duration)
  error(message, duration)
  info(message, duration)
}
```

### `css/style.css` (Основные стили)
**Размер:** ~350 строк  
**Содержит:**
```css
:root {...}               /* CSS переменные */
body, html {...}          /* Глобальные стили */
.background {...}         /* Фоновое изображение */
.player-stats {...}       /* Статистика в хедере */
.hamburger {...}          /* Кнопка меню */
.sidebar {...}            /* Боковое меню */
main {...}                /* Основной контент */
.clicker-container {...}  /* Кликер */
.upgrades {...}           /* Улучшения */
.prestige-btn {...}       /* Престиж */
.profile-info {...}       /* Профиль */
.cases, .expeditions, .towers {...} /* Контейнеры */
.case-btn, .expedition-btn, .tower-btn {...} /* Кнопки */
@media (max-width: 700px) {...} /* Мобильные */
.mt-2, .mb-2, .p-2 {...} /* Утилиты */
```

### `css/components.css` (Компоненты)
**Размер:** ~250 строк  
**Содержит:**
```css
.modal-overlay {...}           /* Модальные окна */
.drop-info-content {...}       /* Информация о дропе */
#dungeonUI, #trainingBattleUI {...} /* Боевой интерфейс */
#dungeonAttackBtn {...}        /* Кнопки боя */
#expBar, #healthInner {...}   /* Прогресс-бары */
#inventoryList {...}           /* Инвентарь */
@media (max-width: 700px) {...} /* Мобильные */
```

---

## 🔄 Поток данных

### 1. Инициализация
```
index.html загружает src/app.js
    ↓
GameApp.initialize()
    ↓
StorageManager.loadGame() → Player + DungeonSystem
    ↓
UIManager.initEventListeners()
    ↓
UIManager.updateProfile() → Отрисовка UI
```

### 2. Клик игрока
```
Клик по кнопке
    ↓
UIManager.handleClick()
    ↓
Player.addClicks(1)
    ↓
UIManager.updateProfile()
    ↓
StorageManager.saveGame()
```

### 3. Открытие кейса
```
Клик на case-btn
    ↓
UIManager.handleOpenCase(caseData)
    ↓
Генерация лута по шансам
    ↓
Player.addToInventory(lootItem)
    ↓
UIManager.updateInventory()
    ↓
StorageManager.saveGame()
```

### 4. Бой в подземелье
```
Клик "Войти в башню"
    ↓
GameApp.startDungeon(index)
    ↓
DungeonSystem.initializeTower()
    ↓
GameApp.renderDungeonUI()
    ↓
Клик "Атаковать"
    ↓
DungeonSystem.dealPlayerDamage()
    ↓
GameApp.renderDungeonUI() (обновление)
    ↓
Если победа:
  Player.addExperience()
  Player.addToInventory()
  DungeonSystem.nextFloor()
```

---

## 📊 Зависимости между модулями

```
index.html
    └── src/app.js (главный оркестратор)
        ├── src/constants/gameConfig.js (конфиги)
        ├── src/modules/Player.js
        ├── src/modules/DungeonSystem.js
        ├── src/modules/StorageManager.js
        ├── src/modules/UIManager.js
        │   ├── src/utils/itemUtils.js
        │   └── src/utils/NotificationSystem.js
        └── Обработчики событий
```

**Важно:** Между модулями минимальные связанности, максимальная модульность!

---

## 🚀 Как добавить новый модуль

### Пример: Система достижений

1. **Создать файл:**
```javascript
// src/modules/AchievementSystem.js
export class AchievementSystem {
  constructor() {
    this.achievements = [];
  }
  
  checkAchievement(condition) {
    // логика
  }
}
```

2. **Импортировать в app.js:**
```javascript
import { AchievementSystem } from './modules/AchievementSystem.js';

class GameApp {
  constructor() {
    // ...
    this.achievements = new AchievementSystem();
  }
}
```

3. **Использовать где нужно:**
```javascript
this.achievements.checkAchievement('levelUp');
```

---

## 📈 Статистика

### Размер проекта
```
Исходный код (src/):     ~2000 строк
Стили (css/):            ~600 строк
HTML:                    ~100 строк
────────────────────────────
Всего:                   ~2700 строк
```

### Качество кода
```
Модули:                  8
Классы:                  7
Методы:                  80+
Функции:                 30+
Комментарии:             Да (везде)
JSDoc:                   Полный
```

---

## ✅ Чек-лист файлов

- ✅ `src/app.js` - главное приложение
- ✅ `src/constants/gameConfig.js` - конфигурация
- ✅ `src/modules/Player.js` - модель игрока
- ✅ `src/modules/DungeonSystem.js` - боевая система
- ✅ `src/modules/StorageManager.js` - хранилище
- ✅ `src/modules/UIManager.js` - интерфейс
- ✅ `src/utils/itemUtils.js` - утилиты предметов
- ✅ `src/utils/NotificationSystem.js` - уведомления
- ✅ `css/style.css` - основные стили
- ✅ `css/components.css` - компоненты
- ✅ `index.html` - главная страница (обновлена)

---

## 🎯 Рекомендации

### При работе с проектом:
1. Не трогайте старые файлы (`script.js`, `style.css`)
2. Все новое пишите в `src/`
3. Следуйте структуре папок
4. Добавляйте JSDoc комментарии
5. Обновляйте конфиг вместо хардкода

### При расширении:
1. Создавайте новый модуль для новой системы
2. Импортируйте в `app.js`
3. Интегрируйте с существующими модулями
4. Тестируйте совместимость

---

**Версия:** 2.0 (Modular Architecture)  
**Дата:** Ноябрь 2025  
**Статус:** ✅ Полная структурная документация
