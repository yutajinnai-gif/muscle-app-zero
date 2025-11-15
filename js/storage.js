/**
 * LocalStorage管理システム
 * データの保存・読み込み・検索機能
 */

class StorageManager {
  constructor() {
    this.init();
  }
  
  // 初期化
  init() {
    // トレーナーリストが存在しない場合はデフォルトを設定
    if (!this.getTrainers()) {
      this.saveTrainers(DEFAULT_TRAINERS);
    }
  }
  
  // ========== ワークアウト関連 ==========
  
  // 現在のワークアウトを保存
  saveCurrentWorkout(workout) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_WORKOUT, JSON.stringify(workout));
      return true;
    } catch (error) {
      console.error('Failed to save current workout:', error);
      return false;
    }
  }
  
  // 現在のワークアウトを取得
  getCurrentWorkout() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKOUT);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get current workout:', error);
      return null;
    }
  }
  
  // 現在のワークアウトをクリア
  clearCurrentWorkout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
  }
  
  // ワークアウトを完了して保存
  completeWorkout(workout) {
    try {
      // 終了時刻を記録
      workout.endTime = getCurrentTime();
      
      // 統計を計算
      workout.stats = this.calculateWorkoutStats(workout);
      
      // バリデーション
      const validation = validateWorkoutEntry(workout);
      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        return false;
      }
      
      // 全ワークアウトに追加
      const workouts = this.getAllWorkouts();
      workouts.push(workout);
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
      
      // 現在のワークアウトをクリア
      this.clearCurrentWorkout();
      
      return true;
    } catch (error) {
      console.error('Failed to complete workout:', error);
      return false;
    }
  }
  
  // 全ワークアウトを取得
  getAllWorkouts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get all workouts:', error);
      return [];
    }
  }
  
  // 特定のワークアウトを取得
  getWorkoutById(id) {
    const workouts = this.getAllWorkouts();
    return workouts.find(w => w.id === id);
  }
  
  // ワークアウトを削除
  deleteWorkout(id) {
    try {
      const workouts = this.getAllWorkouts();
      const filtered = workouts.filter(w => w.id !== id);
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete workout:', error);
      return false;
    }
  }
  
  // ========== 種目履歴関連 ==========
  
  // 特定の種目の履歴を取得（同条件フィルタリング付き）
  getExerciseHistory(exerciseName, conditions = {}) {
    const workouts = this.getAllWorkouts();
    let history = [];
    
    workouts.forEach(workout => {
      workout.exercises.forEach(group => {
        group.exercises.forEach(exercise => {
          if (exercise.exerciseName.toLowerCase().includes(exerciseName.toLowerCase())) {
            // 条件が一致する場合のみ追加
            if (this.matchesConditions(exercise, conditions)) {
              history.push({
                date: workout.date,
                trainer: workout.trainer,
                ...exercise
              });
            }
          }
        });
      });
    });
    
    // 日付でソート（新しい順）
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  
  // 条件マッチング
  matchesConditions(exercise, conditions) {
    if (conditions.equipment && exercise.equipment !== conditions.equipment) {
      return false;
    }
    if (conditions.benchAngle && exercise.benchAngle !== conditions.benchAngle) {
      return false;
    }
    if (conditions.attachment && exercise.attachment !== conditions.attachment) {
      return false;
    }
    if (conditions.gripWidth && exercise.gripWidth !== conditions.gripWidth) {
      return false;
    }
    return true;
  }
  
  // ========== トレーナー関連 ==========
  
  // トレーナーリストを取得
  getTrainers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRAINERS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get trainers:', error);
      return null;
    }
  }
  
  // トレーナーリストを保存
  saveTrainers(trainers) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(trainers));
      return true;
    } catch (error) {
      console.error('Failed to save trainers:', error);
      return false;
    }
  }
  
  // トレーナーを追加
  addTrainer(name) {
    const trainers = this.getTrainers();
    const newTrainer = createTrainer(name);
    trainers.push(newTrainer);
    return this.saveTrainers(trainers);
  }
  
  // ========== 統計計算 ==========
  
  // ワークアウトの統計を計算
  calculateWorkoutStats(workout) {
    let totalExercises = 0;
    let totalSets = 0;
    let totalVolume = 0;
    
    workout.exercises.forEach(group => {
      totalExercises += group.exercises.length;
      group.exercises.forEach(exercise => {
        totalSets += exercise.sets.length;
        exercise.sets.forEach(set => {
          const totalReps = set.repsUnassisted + set.repsAssisted;
          totalVolume += set.weight * totalReps;
        });
      });
    });
    
    // 経過時間を計算
    let duration = 0;
    if (workout.startTime && workout.endTime) {
      const start = this.parseTime(workout.startTime);
      const end = this.parseTime(workout.endTime);
      duration = end - start;
    }
    
    return {
      totalExercises: totalExercises,
      totalSets: totalSets,
      totalVolume: Math.round(totalVolume),
      duration: duration
    };
  }
  
  // 時刻をパース（分単位）
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  // ========== データエクスポート/インポート ==========
  
  // 全データをエクスポート
  exportData() {
    try {
      const allData = {
        workouts: this.getAllWorkouts(),
        trainers: this.getTrainers(),
        currentWorkout: this.getCurrentWorkout(),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }
  
  // データをインポート
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.workouts) {
        localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(data.workouts));
      }
      if (data.trainers) {
        localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(data.trainers));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
  
  // 全データをクリア（危険！）
  clearAllData() {
    if (confirm('本当に全データを削除しますか？この操作は取り消せません。')) {
      localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_WORKOUT);
      // トレーナーリストはデフォルトに戻す
      this.saveTrainers(DEFAULT_TRAINERS);
      return true;
    }
    return false;
  }
}

// グローバルインスタンスを作成
const storage = new StorageManager();
