/**
 * ナビゲーションシステム
 * 画面間の遷移を管理
 */

class Navigation {
  constructor() {
    this.currentPage = 'workout'; // 'workout', 'history', or 'settings'
    this.init();
  }
  
  init() {
    console.log('[Navigation] Initializing...');
    
    // ナビゲーションバーを作成
    this.createNavBar();
    console.log('[Navigation] NavBar created');
    
    // ページコンテナを作成
    this.createPageContainers();
    console.log('[Navigation] Page containers created');
    
    // 初期ページを表示
    this.showPage('workout');
    console.log('[Navigation] Initial page shown');
    
    // 初期化完了フラグ
    this.initialized = true;
    console.log('[Navigation] ✅ Initialization complete');
  }
  
  // ナビゲーションバーを作成
  createNavBar() {
    const navBar = document.createElement('div');
    navBar.className = 'nav-bar';
    navBar.innerHTML = `
      <button class="nav-btn active" data-page="workout">
        <span class="nav-icon">💪</span>
        <span class="nav-label">記録</span>
      </button>
      <button class="nav-btn" data-page="history">
        <span class="nav-icon">📊</span>
        <span class="nav-label">履歴</span>
      </button>
      <button class="nav-btn" data-page="settings">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">設定</span>
      </button>
    `;
    
    // ボディの最初に挿入
    document.body.insertBefore(navBar, document.body.firstChild);
    
    // ナビゲーションボタンのイベントリスナー
    navBar.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        this.showPage(page);
      });
    });
  }
  
  // ページコンテナを作成
  createPageContainers() {
    const existingContainer = document.querySelector('.container');
    
    // .containerが存在しない場合は何もしない（デバッグページなど）
    if (!existingContainer) {
      console.warn('Container element not found. Navigation may not work properly.');
      return;
    }
    
    // ワークアウトページ用のコンテナを作成
    const workoutPage = document.createElement('div');
    workoutPage.id = 'workout-page';
    workoutPage.className = 'page-container active';
    
    // 既存のコンテナの内容を移動
    while (existingContainer.firstChild) {
      workoutPage.appendChild(existingContainer.firstChild);
    }
    
    existingContainer.appendChild(workoutPage);
    
    // 履歴ページ用のコンテナを作成
    const historyPage = document.createElement('div');
    historyPage.id = 'history-page';
    historyPage.className = 'page-container';
    historyPage.innerHTML = `
      <div class="history-header">
        <h2>📊 トレーニング履歴</h2>
        <button class="btn btn-secondary" id="exportDataBtn">エクスポート</button>
      </div>
      <div id="historyList" class="history-list">
        <!-- 動的に生成 -->
      </div>
    `;
    
    existingContainer.appendChild(historyPage);
    
    // 設定ページ用のコンテナを作成
    const settingsPage = document.createElement('div');
    settingsPage.id = 'settings-page';
    settingsPage.className = 'page-container';
    settingsPage.innerHTML = `
      <div class="settings-header">
        <h2>⚙️ 設定</h2>
      </div>
      
      <div class="settings-section">
        <h3>💾 データ管理</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">データエクスポート</div>
            <div class="setting-desc">全てのトレーニングデータをJSONファイルとしてダウンロード</div>
          </div>
          <button class="btn btn-secondary" id="exportAllDataBtn">エクスポート</button>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">データインポート</div>
            <div class="setting-desc">バックアップファイルからデータを復元</div>
          </div>
          <input type="file" id="importFileInput" accept=".json" style="display: none;">
          <button class="btn btn-secondary" id="importDataBtn">インポート</button>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">全データ削除</div>
            <div class="setting-desc">全てのトレーニングデータを削除（復元不可）</div>
          </div>
          <button class="btn btn-danger" id="deleteAllDataBtn">削除</button>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>📊 ストレージ情報</h3>
        <div class="storage-info">
          <div class="storage-item">
            <span class="storage-label">使用容量:</span>
            <span class="storage-value" id="storageUsed">-</span>
          </div>
          <div class="storage-item">
            <span class="storage-label">使用率:</span>
            <span class="storage-value" id="storagePercent">-</span>
          </div>
          <div class="storage-item">
            <span class="storage-label">履歴件数:</span>
            <span class="storage-value" id="historyCount">-</span>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">古いデータを削除</div>
            <div class="setting-desc">6ヶ月以上前のトレーニングデータを削除</div>
          </div>
          <button class="btn btn-secondary" id="deleteOldDataBtn">削除</button>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>ℹ️ アプリ情報</h3>
        <div class="app-info">
          <div class="info-item">
            <span class="info-label">バージョン:</span>
            <span class="info-value">1.0.0</span>
          </div>
          <div class="info-item">
            <span class="info-label">アプリ名:</span>
            <span class="info-value">MuscleApp Zero</span>
          </div>
        </div>
      </div>
    `;
    
    existingContainer.appendChild(settingsPage);
    
    // 設定ページのイベントリスナーを設定
    this.attachSettingsListeners();
  }
  
  // 設定ページのイベントリスナー
  attachSettingsListeners() {
    // エクスポートボタン
    const exportBtn = document.getElementById('exportAllDataBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportAllData());
    }
    
    // インポートボタン
    const importBtn = document.getElementById('importDataBtn');
    const fileInput = document.getElementById('importFileInput');
    if (importBtn && fileInput) {
      importBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.importData(e));
    }
    
    // 削除ボタン
    const deleteBtn = document.getElementById('deleteAllDataBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteAllData());
    }
    
    // 古いデータ削除ボタン
    const deleteOldBtn = document.getElementById('deleteOldDataBtn');
    if (deleteOldBtn) {
      deleteOldBtn.addEventListener('click', () => this.deleteOldData());
    }
  }
  
  // 古いデータを削除
  deleteOldData() {
    if (confirm('6ヶ月以上前のデータを削除しますか？')) {
      const success = storage.deleteOldWorkouts(6);
      if (success) {
        this.updateStorageInfo();
      }
    }
  }
  
  // 全データをエクスポート
  exportAllData() {
    const data = storage.exportAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `muscle-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    alert('データをエクスポートしました！');
  }
  
  // データをインポート
  importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = storage.importAllData(data);
        
        if (success) {
          alert('データをインポートしました！\n\nページをリロードします。');
          location.reload();
        } else {
          alert('インポートに失敗しました。\n\nファイル形式を確認してください。');
        }
      } catch (error) {
        alert('エラー: ファイルの読み込みに失敗しました。');
        console.error(error);
      }
    };
    reader.readAsText(file);
  }
  
  // 全データを削除
  deleteAllData() {
    if (confirm('本当に全てのデータを削除しますか？\n\nこの操作は復元できません。')) {
      if (confirm('最終確認: 本当に削除しますか？')) {
        storage.clearAllData();
        alert('全てのデータを削除しました。\n\nページをリロードします。');
        location.reload();
      }
    }
  }
  
  // ページを表示
  showPage(pageName) {
    this.currentPage = pageName;
    
    // ナビゲーションボタンのアクティブ状態を更新
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.page === pageName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // ページの表示/非表示を切り替え
    document.querySelectorAll('.page-container').forEach(page => {
      page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    // 履歴ページの場合は履歴を読み込み
    if (pageName === 'history') {
      this.loadHistory();
    }
    
    // 設定ページの場合はストレージ情報を更新
    if (pageName === 'settings') {
      this.updateStorageInfo();
    }
  }
  
  // ストレージ情報を更新
  updateStorageInfo() {
    const storageUsedElement = document.getElementById('storageUsed');
    const storagePercentElement = document.getElementById('storagePercent');
    const historyCountElement = document.getElementById('historyCount');
    
    if (storageUsedElement) {
      const usedBytes = storage.getStorageSize();
      const usedKB = (usedBytes / 1024).toFixed(2);
      storageUsedElement.textContent = `${usedKB} KB`;
    }
    
    if (storagePercentElement) {
      const percent = storage.getStorageUsagePercent();
      const color = percent > 80 ? '#FF4444' : percent > 50 ? '#FF9800' : '#4CAF50';
      storagePercentElement.textContent = `${percent.toFixed(1)}%`;
      storagePercentElement.style.color = color;
    }
    
    if (historyCountElement) {
      const history = storage.getWorkoutHistory();
      historyCountElement.textContent = `${history.length} 件`;
    }
  }
  
  // 履歴を読み込み
  loadHistory() {
    console.log('[Navigation] Loading history...');
    const historyList = document.getElementById('historyList');
    console.log('[Navigation] historyList element:', historyList);
    
    if (!historyList) {
      console.error('[Navigation] historyList element not found!');
      return;
    }
    
    const workouts = storage.getAllWorkouts();
    console.log('[Navigation] workouts count:', workouts.length);
    
    if (workouts.length === 0) {
      console.log('[Navigation] No workouts, showing empty message');
      historyList.innerHTML = '<div class="empty-message">まだトレーニング記録がありません</div>';
      return;
    }
    
    // 日付順にソート（新しい順）
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    historyList.innerHTML = workouts.map(workout => this.createWorkoutCard(workout)).join('');
    
    // エクスポートボタンのイベント
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
      exportBtn.onclick = () => storage.exportData();
    }
  }
  
  // ワークアウトカードを作成
  createWorkoutCard(workout) {
    const stats = storage.calculateWorkoutStats(workout);
    const weekday = getWeekday(workout.date);
    const trainerName = this.getTrainerName(workout.trainer);
    
    return `
      <div class="workout-card" data-workout-id="${workout.id}">
        <div class="workout-card-header">
          <div class="workout-date">
            <span class="date-main">${workout.date}</span>
            <span class="date-weekday">(${weekday})</span>
            <span class="date-time">${workout.startTime}</span>
          </div>
          <div class="workout-trainer">${trainerName}</div>
        </div>
        <div class="workout-card-stats">
          <div class="mini-stat">
            <span class="mini-stat-value">${stats.totalExercises}</span>
            <span class="mini-stat-label">種目</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">${stats.totalSets}</span>
            <span class="mini-stat-label">セット</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">${(stats.totalVolume / 1000).toFixed(1)}k</span>
            <span class="mini-stat-label">総重量</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">${stats.avgRPE.toFixed(1)}</span>
            <span class="mini-stat-label">平均RPE</span>
          </div>
        </div>
        <div class="workout-card-exercises">
          ${this.getExerciseSummary(workout)}
        </div>
        <button class="btn btn-outline view-detail-btn" onclick="nav.viewWorkoutDetail('${workout.id}')">
          詳細を見る
        </button>
      </div>
    `;
  }
  
  // トレーナー名を取得
  getTrainerName(trainerId) {
    if (!trainerId || trainerId === 'self') {
      return '自主トレ';
    }
    const trainers = storage.getTrainers();
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? trainer.name : '不明';
  }
  
  // 種目サマリーを取得
  getExerciseSummary(workout) {
    const exercises = [];
    workout.exercises.forEach(group => {
      group.exercises.forEach(ex => {
        exercises.push(ex.exerciseName);
      });
    });
    
    if (exercises.length <= 3) {
      return exercises.join(', ');
    } else {
      return exercises.slice(0, 3).join(', ') + ` 他${exercises.length - 3}種目`;
    }
  }
  
  // ワークアウト詳細を表示
  viewWorkoutDetail(workoutId) {
    const workout = storage.getWorkoutById(workoutId);
    if (!workout) return;
    
    // モーダルを表示（後で実装）
    alert(`詳細表示機能は Phase 2 で実装予定です\n\nワークアウトID: ${workoutId}\n日付: ${workout.date}`);
  }
}

// グローバルインスタンスを作成
// 初期化はinit.jsが行う
let nav;
