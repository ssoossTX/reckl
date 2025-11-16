/**
 * ParticleSystem - Система управления визуальными эффектами и анимациями
 * Включает парящие числа, частицы, мерцание и другие эффекты
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.container = null;
    this.animationFrameId = null;
    this.init();
  }

  init() {
    // Создаём контейнер для частиц
    this.container = document.createElement('div');
    this.container.id = 'particle-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    `;
    document.body.appendChild(this.container);
    
    // Запускаем цикл анимации
    this.startAnimation();
  }

  /**
   * Создать парящее число (+ или -)
   * @param {number} x - Позиция X
   * @param {number} y - Позиция Y
   * @param {string|number} text - Текст или число
   * @param {string} color - Цвет текста (default: cyan)
   * @param {number} duration - Длительность анимации в мс (default: 1000)
   */
  createFloatingText(x, y, text, color = '#0ff', duration = 1000) {
    const particle = document.createElement('div');
    particle.className = 'floating-text';
    particle.textContent = text;
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: ${color};
      font-weight: bold;
      font-size: 18px;
      pointer-events: none;
      z-index: 101;
      text-shadow: 0 0 8px ${color};
      transform: translate(-50%, -50%);
      animation: float-up ${duration}ms ease-out forwards;
    `;
    
    this.container.appendChild(particle);
    
    // Удаляем элемент после анимации
    setTimeout(() => {
      particle.remove();
    }, duration);
  }

  /**
   * Эффект мерцания на элементе
   * @param {HTMLElement} element - Элемент для мерцания
   * @param {string} color - Цвет свечения (default: cyan)
   * @param {number} duration - Длительность эффекта в мс (default: 300)
   */
  createGlow(element, color = '#0ff', duration = 300) {
    const originalShadow = element.style.boxShadow;
    element.style.transition = `box-shadow ${duration}ms ease-out`;
    element.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    
    setTimeout(() => {
      element.style.boxShadow = originalShadow;
    }, duration);
  }

  /**
   * Эффект вибрации элемента
   * @param {HTMLElement} element - Элемент для вибрации
   * @param {number} duration - Длительность вибрации в мс (default: 200)
   * @param {number} intensity - Интенсивность вибрации в пикселях (default: 5)
   */
  createShake(element, duration = 200, intensity = 5) {
    const originalTransform = element.style.transform;
    let startTime = Date.now();
    
    const shake = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = (1 - progress) * intensity;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        
        element.style.transform = `${originalTransform || ''} translate(${offsetX}px, ${offsetY}px)`;
        requestAnimationFrame(shake);
      } else {
        element.style.transform = originalTransform;
      }
    };
    
    shake();
  }

  /**
   * Волновой эффект от центра элемента
   * @param {HTMLElement} element - Центр волны
   * @param {string} color - Цвет волны (default: cyan)
   * @param {number} radius - Начальный радиус в пикселях (default: 30)
   */
  createWaveEffect(element, color = '#0ff', radius = 30) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const wave = document.createElement('div');
    wave.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: ${radius}px;
      height: ${radius}px;
      border: 2px solid ${color};
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      animation: wave-expand 0.6s ease-out forwards;
    `;
    
    this.container.appendChild(wave);
    
    setTimeout(() => {
      wave.remove();
    }, 600);
  }

  /**
   * Эффект крита (золотое свечение с большим числом)
   * @param {number} x - Позиция X
   * @param {number} y - Позиция Y
   * @param {string|number} damage - Урон крита
   */
  createCritEffect(x, y, damage) {
    // Создаём крупное число с золотым цветом
    this.createFloatingText(x, y, `КРИТ! ${damage}`, '#ffd700', 1200);
    
    // Парящие золотые частицы
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 40;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        this.createFloatingText(px, py, '✦', '#ffd700', 800);
      }, i * 50);
    }
  }

  /**
   * Эффект вылета лута при убийстве врага
   * @param {number} x - Позиция X
   * @param {number} y - Позиция Y
   * @param {Array} items - Массив [название, количество]
   */
  createLootEffect(x, y, items = []) {
    items.forEach((item, index) => {
      setTimeout(() => {
        const angle = (Math.random() - 0.5) * Math.PI;
        const distance = 50 + Math.random() * 50;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        const colors = ['#0f0', '#00ff00', '#00dd00'];
        const color = colors[index % colors.length];
        
        this.createFloatingText(px, py, `+${item}`, color, 800);
      }, index * 100);
    });
  }

  /**
   * Эффект при повышении уровня
   * @param {HTMLElement} element - Элемент для эффекта
   */
  createLevelUpEffect(element) {
    // Яркое свечение
    this.createGlow(element, '#00ff00', 500);
    
    // Несколько волн
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createWaveEffect(element, '#00ff00', 20 + i * 10);
      }, i * 150);
    }
    
    // Парящий текст "LEVEL UP!"
    const rect = element.getBoundingClientRect();
    this.createFloatingText(rect.left + rect.width / 2, rect.top - 50, 'LEVEL UP!', '#00ff00', 1000);
  }

  /**
   * Эффект получения награды
   * @param {number} x - Позиция X
   * @param {number} y - Позиция Y
   * @param {string} reward - Тип награды (exp, diamonds, keys)
   * @param {number} amount - Количество
   */
  createRewardEffect(x, y, reward, amount) {
    const colors = {
      'exp': '#0f0',
      'diamonds': '#ff00ff',
      'keys': '#ffd700',
      'heal': '#00ff00'
    };
    
    const icons = {
      'exp': 'EXP',
      'diamonds': '◆',
      'keys': '🔑',
      'heal': '+'
    };
    
    const color = colors[reward] || '#0ff';
    const icon = icons[reward] || '';
    
    this.createFloatingText(x, y, `${icon} +${amount}`, color, 1200);
  }

  /**
   * Запустить основной цикл анимации
   */
  startAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.startAnimation();
    });
  }

  /**
   * Остановить цикл анимации
   */
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Очистить все частицы
   */
  clear() {
    this.particles = [];
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Уничтожить систему частиц
   */
  destroy() {
    this.stopAnimation();
    this.clear();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Создаём глобальный экземпляр
const particleSystem = new ParticleSystem();

export default particleSystem;
