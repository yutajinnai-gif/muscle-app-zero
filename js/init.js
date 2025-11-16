/**
 * 統合初期化スクリプト
 * navigation.jsとapp.jsの初期化を確実に順序制御
 */

console.log('[Init] 統合初期化スクリプト開始');

// グローバル初期化フラグ
window.muscleAppInitFlags = {
  navReady: false,
  appReady: false
};

// 初期化プロセス全体を管理
function initializeApp() {
  console.log('[Init] initializeApp() called');
  console.log('[Init] document.readyState:', document.readyState);
  
  // Step 1: Navigationを初期化
  if (!window.muscleAppInitFlags.navReady) {
    console.log('[Init] Step 1: Initializing Navigation...');
    
    if (typeof Navigation === 'undefined') {
      console.error('[Init] Navigation class not loaded!');
      setTimeout(initializeApp, 100);
      return;
    }
    
    // .containerが存在するか確認（debug.htmlなどではスキップ）
    const container = document.querySelector('.container');
    if (container) {
      try {
        window.nav = new Navigation();
        // Navigationが完全に初期化されるまで待つ
        if (!window.nav.initialized) {
          console.warn('[Init] Navigation created but not fully initialized, retrying...');
          setTimeout(initializeApp, 100);
          return;
        }
        window.muscleAppInitFlags.navReady = true;
        console.log('[Init] ✅ Navigation initialized:', window.nav);
      } catch (error) {
        console.error('[Init] ❌ Navigation initialization failed:', error);
        console.error('[Init] Stack:', error.stack);
        setTimeout(initializeApp, 100);
        return;
      }
    } else {
      console.log('[Init] No .container found, skipping Navigation');
      window.muscleAppInitFlags.navReady = true;
    }
  }
  
  // Step 2: MuscleAppを初期化（Navigationの後）
  if (window.muscleAppInitFlags.navReady && !window.muscleAppInitFlags.appReady) {
    console.log('[Init] Step 2: Initializing MuscleApp...');
    
    if (typeof MuscleApp === 'undefined') {
      console.error('[Init] MuscleApp class not loaded!');
      setTimeout(initializeApp, 100);
      return;
    }
    
    // 必要な要素を確認（より詳細なデバッグ）
    const dateElement = document.getElementById('currentDate');
    const exerciseContainer = document.getElementById('exerciseListContainer');
    const workoutPage = document.getElementById('workout-page');
    
    console.log('[Init] Element check:');
    console.log('[Init] - dateElement:', dateElement);
    console.log('[Init] - exerciseContainer:', exerciseContainer);
    console.log('[Init] - workoutPage:', workoutPage);
    console.log('[Init] - document.body.innerHTML length:', document.body.innerHTML.length);
    
    // 要素がまだ存在しない場合でも、一定回数リトライしたら強制的に初期化
    if (!window.muscleAppInitFlags.retryCount) {
      window.muscleAppInitFlags.retryCount = 0;
    }
    window.muscleAppInitFlags.retryCount++;
    
    if (!dateElement || !exerciseContainer) {
      console.warn(`[Init] Required elements not found yet, retrying... (${window.muscleAppInitFlags.retryCount}/20)`);
      
      if (window.muscleAppInitFlags.retryCount >= 20) {
        console.error('[Init] ❌ Max retry count reached. Elements still not found.');
        console.error('[Init] This may indicate a structural problem with navigation.js');
        // 諦めずに初期化を試みる（エラーを記録するため）
      } else {
        setTimeout(initializeApp, 100);
        return;
      }
    }
    
    try {
      window.app = new MuscleApp();
      window.muscleAppInitFlags.appReady = true;
      console.log('[Init] ✅ MuscleApp initialized:', window.app);
      
      // 定期的に統計を更新（1分ごと）
      setInterval(() => {
        if (window.app) {
          window.app.updateStats();
        }
      }, 60000);
      
    } catch (error) {
      console.error('[Init] ❌ MuscleApp initialization failed:', error);
      console.error('[Init] Stack:', error.stack);
      return;
    }
  }
  
  if (window.muscleAppInitFlags.navReady && window.muscleAppInitFlags.appReady) {
    console.log('[Init] 🎉 All initialization complete!');
  }
}

// DOMが準備できたら初期化開始
if (document.readyState === 'loading') {
  console.log('[Init] Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Init] DOMContentLoaded fired');
    // navigation.jsがDOMを変更するのを待つため、さらに遅延
    setTimeout(initializeApp, 200);
  });
} else {
  console.log('[Init] DOM already ready, initializing with delay');
  setTimeout(initializeApp, 200);
}

// エラーハンドラー
window.addEventListener('error', (event) => {
  console.error('[Init] Global error caught:', event.error);
});
