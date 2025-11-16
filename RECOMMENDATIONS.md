# 🚀 РЕКОМЕНДАЦИИ ПО ИСПОЛЬЗОВАНИЮ

## 📖 Начало работы

### 1️⃣ Первый запуск
```bash
# Откройте index.html в браузере
# ИЛИ запустите локальный сервер
python -m http.server 8000
# Откройте http://localhost:8000
```

### 2️⃣ Проверка функциональности
- Щелкните по кнопке кликера
- Проверьте профиль
- Откройте кейс
- Запустите экспедицию
- Войдите в подземелье

### 3️⃣ Проверка сохранений
- Обновите страницу (F5)
- Проверьте, что данные сохранились
- Попробуйте открыть в другом браузере

---

## 🎯 Использование для разработки

### Дебаг режим
```javascript
// В консоли браузера
window.gameApp                    // Главное приложение
window.gameApp.player             // Текущий игрок
window.gameApp.dungeon            // Система подземелий
window.gameApp.ui                 // Менеджер интерфейса
window.gameApp.notifications      // Уведомления
```

### Быстрое тестирование
```javascript
// Добавить кликов
window.gameApp.player.clicks += 1000;

// Добавить опыта
window.gameApp.player.addExperience(100);

// Повысить уровень
while(window.gameApp.player.exp >= window.gameApp.player.expToNext) {
  window.gameApp.player.exp -= window.gameApp.player.expToNext;
  window.gameApp.player.levelUp();
}

// Улучшить способность
window.gameApp.player.upgradeAbility(0);

// Добавить предмет
window.gameApp.player.addToInventory('Зелье лечения');

// Сохранить
window.gameApp.saveProgress();

// Обновить UI
window.gameApp.ui.updateProfile();
```

### Проверка конфигурации
```javascript
// Получить текущие значения
GameConfig.CLICK.INITIAL_POWER      // 1
GameConfig.PRESTIGE.MULTIPLIER_GROWTH // 1.1
GameConfig.EXPERIENCE.LEVEL_UP_POINTS // 3
```

---

## 🔧 Изменение баланса игры

### Шаг 1: Найти параметр в gameConfig.js
```javascript
// src/constants/gameConfig.js
GameConfig = {
  CLICK: {
    INITIAL_POWER: 1,           // ← Изменить здесь
    INITIAL_UPGRADE_COST: 10,   // ← Или здесь
    UPGRADE_COST_MULTIPLIER: 1.5,
    // ...
  }
}
```

### Шаг 2: Изменить значение
```javascript
// Было
INITIAL_POWER: 1,

// Стало (более быстрый клик)
INITIAL_POWER: 2,
```

### Шаг 3: Сохранить и перезагрузить
- Сохраните файл (Ctrl+S)
- Перезагрузите страницу (F5)
- Изменения вступят в силу

### Примеры балансировки:
```javascript
// Облегчить начало игры
INITIAL_UPGRADE_COST: 5,        // вместо 10
UPGRADE_COST_MULTIPLIER: 1.3,   // вместо 1.5

// Усложнить престиж
PRESTIGE.INITIAL_COST: 2000,    // вместо 1000
PRESTIGE.MULTIPLIER_GROWTH: 1.2, // вместо 1.1

// Ускорить опыт
EXPERIENCE.LEVEL_UP_POINTS: 5,  // вместо 3
EXPERIENCE.EXP_CURVE_MULTIPLIER: 1.1, // вместо 1.2
```

---

## 📦 Добавление нового контента

### Добавить новый предмет

1. **Открыть gameConfig.js**
```javascript
// src/constants/gameConfig.js
CASES: [
  {
    name: 'Обычный кейс',
    // ...
    loot: [
      // Добавить сюда новый предмет:
      { name: 'Мощный артефакт', rarity: 'Редкий', chance: 2, effect: 'Добавляет 500 кликов' }
    ]
  }
]
```

2. **Логика применится автоматически** через itemUtils.js

### Добавить новую способность

1. **Обновить в gameConfig.js**
```javascript
ABILITIES: {
  STRENGTH: { name: 'Сила', value: 0 },
  AGILITY: { name: 'Ловкость', value: 0 },
  INTELLECT: { name: 'Интеллект', value: 0 },
  WISDOM: { name: 'Мудрость', value: 0 } // ← Новая
}
```

2. **Обновить в Player.js**
```javascript
getWisdomBonus() {
  return this.getAbilityBonus(3);
}

// Добавить эффект где нужно
getPlayerDamage() {
  return Math.floor(
    // ... существующая логика ...
    + (this.getWisdomBonus() * 2) // ← новый бонус
  );
}
```

3. **Обновить в UIManager.js**
```javascript
updateAbilityList() {
  // ... существующий код ...
  if (i === 3 && a.value > 0) bonus = ` <span style='color:#9b59b6'>(+${a.value*2} к магии)</span>`;
}
```

### Добавить новую башню

1. **Обновить gameConfig.js**
```javascript
TOWERS: {
  NAMES: [
    'Кристаллическая цитадель',
    // ... существующие ...
    'Новая башня' // ← Добавить
  ]
}
```

2. **Добавить врагов в DungeonSystem.js**
```javascript
_getMonsterPool(towerIndex) {
  const pools = [
    // ... существующие ...
    [ // Новая башня
      { name: 'Новый враг 1', baseHp: 100, baseAtk: 20, drops: ['Предмет'] },
      { name: 'Новый враг 2', baseHp: 120, baseAtk: 22, drops: ['Предмет'] }
    ]
  ];
  return pools[towerIndex] || pools[0];
}
```

3. **Кнопка создастся автоматически**

---

## 💡 Лучшие практики

### 1. Всегда используйте GameConfig
```javascript
// ✅ ХОРОШО
const cost = GameConfig.CLICK.INITIAL_UPGRADE_COST;

// ❌ ПЛОХО
const cost = 10; // хардкод
```

### 2. Добавляйте методы в Player, а не в app.js
```javascript
// ✅ ХОРОШО
// В Player.js
customAction() {
  this.diamonds += 100;
}

// В app.js
this.player.customAction();

// ❌ ПЛОХО
// В app.js
this.player.diamonds += 100; // нарушает инкапсуляцию
```

### 3. Используйте уведомления для обратной связи
```javascript
// ✅ ХОРОШО
this.notifications.success('Победа!');
this.notifications.error('Недостаточно кликов!');

// ❌ ПЛОХО
console.log('Победа!');
alert('Победа!'); // некрасиво на UI
```

### 4. Обновляйте UI через UIManager
```javascript
// ✅ ХОРОШО
this.ui.updateProfile();

// ❌ ПЛОХО
document.getElementById('clicks').textContent = this.player.clicks; // нарушает паттерн
```

### 5. Сохраняйте после действий
```javascript
// ✅ ХОРОШО
this.player.addClicks(10);
// ... сразу после
this.saveProgress();

// ❌ ПЛОХО
// Забыли сохранить - потеря данных
```

---

## 🧪 Тестирование

### Тест Player
```javascript
const player = new Player();

// Тест кликов
player.addClicks(5);
console.assert(player.clicks === 5, 'Клики не добавились');

// Тест опыта
const realExp = player.addExperience(20);
console.assert(realExp > 0, 'Опыт не добавился');

// Тест уровня
const oldLevel = player.level;
player.levelUp();
console.assert(player.level === oldLevel + 1, 'Уровень не повысился');
```

### Тест DungeonSystem
```javascript
const dungeon = new DungeonSystem();

// Инициализация
dungeon.initializeTower(0, 100);
console.assert(dungeon.isActive === true, 'Подземелье не активировалось');

// Боевой урон
const result = dungeon.dealPlayerDamage(50);
console.assert(result !== null, 'Урон не применился');

// Следующий этаж
const floor = dungeon.state.floor;
dungeon.nextFloor(100);
console.assert(dungeon.state.floor === floor + 1, 'Этаж не изменился');
```

### Тест StorageManager
```javascript
const player = new Player();
const dungeon = new DungeonSystem();

// Сохранить
const saved = StorageManager.saveGame(player, dungeon);
console.assert(saved === true, 'Сохранение не удалось');

// Загрузить
const { player: loaded } = StorageManager.loadGame();
console.assert(loaded.clicks === player.clicks, 'Данные не совпадают');
```

---

## 🐛 Отладка

### Включить режим разработчика
```javascript
// В консоли
window.DEBUG = true;
```

### Проверить localStorage
```javascript
// В консоли браузера
localStorage.getItem('rpgSave')
// Вернет JSON с сохранениями
```

### Очистить хранилище
```javascript
// Осторожно! Это удалит все сохранения
localStorage.clear();
```

### Посмотреть логи
```javascript
// Откройте DevTools (F12)
// Перейдите на вкладку Console
// Все логи будут видны там
```

---

## 📱 Мобильная версия

### Протестировать на мобильном
1. Откройте DevTools (F12)
2. Нажмите Ctrl+Shift+M (Device Toolbar)
3. Выберите устройство
4. Проверьте все функции

### Убедитесь что работает:
- ✅ Клик работает на мобильном
- ✅ Меню скрывается/показывается
- ✅ Текст читаемый
- ✅ Кнопки нажимаются
- ✅ Экспедиции запускаются
- ✅ Подземелья работают

---

## 🎯 Производственное развертывание

### Перед публикацией:
1. ✅ Протестируйте все функции
2. ✅ Проверьте на мобильных устройствах
3. ✅ Удалите старые файлы (script.js, style.css)
4. ✅ Очистите консоль от логов
5. ✅ Минифицируйте CSS (опционально)

### Развертывание:
```bash
# Загрузить на сервер
scp -r reckl/ user@server:/var/www/

# Или на GitHub Pages
git push origin main
```

### После публикации:
- ✅ Проверьте, что игра работает
- ✅ Проверьте сохранения
- ✅ Мониторьте консоль браузера на ошибки

---

## 📊 Мониторинг

### Проверить производительность
```javascript
// В консоли
// Начало измерения
console.time('game-load');

// ... загрузка игры ...

// Конец измерения
console.timeEnd('game-load');
```

### Проверить использование памяти
```javascript
// В Chrome DevTools
// Откройте Memory tab
// Сделайте Heap Snapshot
// Проверьте размер
```

---

## 🎉 Готово!

Вы успешно:
- ✅ Поняли архитектуру проекта
- ✅ Научились менять баланс
- ✅ Научились добавлять контент
- ✅ Научились отлаживать
- ✅ Готовы расширять проект

**Happy coding! 🚀**

---

**Версия:** 2.0 (Modular Architecture)  
**Дата:** Ноябрь 2025
