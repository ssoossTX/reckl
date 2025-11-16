/**
 * Система Toast-уведомлений
 */
export class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    const style = document.createElement('style');
    style.textContent = `
      .toast-container { 
        position: fixed; 
        z-index: 9999; 
        right: 24px; 
        bottom: 24px; 
        display: flex; 
        flex-direction: column; 
        gap: 10px; 
        align-items: flex-end; 
      }
      .toast { 
        min-width: 220px; 
        max-width: 350px; 
        background: #222; 
        color: #fff; 
        padding: 14px 22px; 
        border-radius: 8px; 
        box-shadow: 0 2px 12px #0004; 
        font-size: 1rem; 
        opacity: 0; 
        transform: translateY(30px); 
        transition: opacity .3s, transform .3s; 
        pointer-events: auto; 
      }
      .toast.toast-show { 
        opacity: 1; 
        transform: translateY(0); 
      }
      .toast-success { 
        background: linear-gradient(90deg,#2ecc40,#27ae60); 
      }
      .toast-error { 
        background: linear-gradient(90deg,#e74c3c,#c0392b); 
      }
      .toast-info { 
        background: linear-gradient(90deg,#3498db,#2980b9); 
      }
    `;
    document.head.appendChild(style);

    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => toast.classList.add('toast-show'), 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  }

  info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }
}

export default NotificationSystem;
