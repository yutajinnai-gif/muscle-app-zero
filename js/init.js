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
        window.muscleAppInitFlags.navReady = true;
        console.log('[Init] ✅ Navigation initialized:', window.nav);
      } catch (error) {
        console.error('[Init] ❌ Navigation initialization failed:', error);
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
    
    // 必要な要素を確認
    const dateElement = document.getElementById('currentDate');
    const exerciseContainer = document.getElementById('exerciseListContainer');
    
    if (!dateElement || !exerciseContainer) {
      console.warn('[Init] Required elements not found yet, retrying...');
      console.log('[Init] dateElement:', dateElement);
      console.log('[Init] exerciseContainer:', exerciseContainer);
      setTimeout(initializeApp, 100);
      return;
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
    setTimeout(initializeApp, 50);
  });
} else {
  console.log('[Init] DOM already ready, initializing immediately');
  setTimeout(initializeApp, 50);
}

// エラーハンドラー
window.addEventListener('error', (event) => {
  console.error('[Init] Global error caught:', event.error);
});
