/**
 * ナビゲーションシステム
 * 画面間の遷移を管理
 */

class Navigation {
  constructor() {
    this.currentPage = 'workout'; // 'workout' or 'history'
    this.init();
  }
  
  init() {
    // ナビゲーションバーを作成
    this.createNavBar();
    
    // ページコンテナを作成
    this.createPageContainers();
    
    // 初期ページを表示
    this.showPage('workout');
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
  }
  
  // 履歴を読み込み
  loadHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    const workouts = storage.getAllWorkouts();
    
    if (workouts.length === 0) {
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
let nav;

// 即座に初期化（app.jsより先に）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    nav = new Navigation();
  });
} else {
  nav = new Navigation();
}
