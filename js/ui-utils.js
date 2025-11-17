/**
 * UI ユーティリティ
 * モーダル、トースト通知などのUI要素
 */

class UIUtils {
  constructor() {
    this.init();
  }
  
  init() {
    // モーダルコンテナを作成
    this.createModalContainer();
    // トーストコンテナを作成
    this.createToastContainer();
  }
  
  // ========== モーダル ==========
  
  createModalContainer() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    modalContainer.className = 'modal-container';
    document.body.appendChild(modalContainer);
  }
  
  // カスタムアラート
  showAlert(message, title = '通知') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary modal-btn-ok">OK</button>
          </div>
        </div>
      `;
      
      const container = document.getElementById('modal-container');
      container.appendChild(modal);
      
      // アニメーション
      setTimeout(() => modal.classList.add('show'), 10);
      
      // OKボタン
      const okBtn = modal.querySelector('.modal-btn-ok');
      okBtn.addEventListener('click', () => {
        this.closeModal(modal);
        resolve(true);
      });
      
      // オーバーレイクリック
      const overlay = modal.querySelector('.modal-overlay');
      overlay.addEventListener('click', () => {
        this.closeModal(modal);
        resolve(true);
      });
    });
  }
  
  // カスタム確認ダイアログ
  showConfirm(message, title = '確認') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary modal-btn-cancel">キャンセル</button>
            <button class="btn btn-primary modal-btn-ok">OK</button>
          </div>
        </div>
      `;
      
      const container = document.getElementById('modal-container');
      container.appendChild(modal);
      
      // アニメーション
      setTimeout(() => modal.classList.add('show'), 10);
      
      // OKボタン
      const okBtn = modal.querySelector('.modal-btn-ok');
      okBtn.addEventListener('click', () => {
        this.closeModal(modal);
        resolve(true);
      });
      
      // キャンセルボタン
      const cancelBtn = modal.querySelector('.modal-btn-cancel');
      cancelBtn.addEventListener('click', () => {
        this.closeModal(modal);
        resolve(false);
      });
      
      // オーバーレイクリック
      const overlay = modal.querySelector('.modal-overlay');
      overlay.addEventListener('click', () => {
        this.closeModal(modal);
        resolve(false);
      });
    });
  }
  
  // モーダルを閉じる
  closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
  
  // ========== トースト通知 ==========
  
  createToastContainer() {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // トースト通知を表示
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = this.getToastIcon(type);
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // アニメーション
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自動削除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  // トーストアイコンを取得
  getToastIcon(type) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  }
  
  // 成功トースト
  showSuccess(message) {
    this.showToast(message, 'success');
  }
  
  // エラートースト
  showError(message) {
    this.showToast(message, 'error');
  }
  
  // 警告トースト
  showWarning(message) {
    this.showToast(message, 'warning');
  }
  
  // 情報トースト
  showInfo(message) {
    this.showToast(message, 'info');
  }
}

// グローバルインスタンスを作成
const uiUtils = new UIUtils();
