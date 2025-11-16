/**
 * メインアプリケーションロジック
 */

class MuscleApp {
  constructor() {
    this.currentWorkout = null;
    this.init();
  }
  
  // ========== 初期化 ==========
  
  init() {
    // 現在のワークアウトを読み込み、なければ新規作成
    this.currentWorkout = storage.getCurrentWorkout();
    if (!this.currentWorkout) {
      this.currentWorkout = createWorkoutEntry();
      storage.saveCurrentWorkout(this.currentWorkout);
    }
    
    // UIを初期化
    this.initUI();
    
    // イベントリスナーを設定
    this.attachEventListeners();
    
    // ワークアウトを描画
    this.renderWorkout();
    
    // 統計を更新
    this.updateStats();
  }
  
  // UIを初期化
  initUI() {
    console.log('[App] Initializing UI...');
    // 日付を設定
    const dateElement = document.getElementById('currentDate');
    console.log('[App] dateElement:', dateElement);
    if (dateElement) {
      const weekday = getWeekday(this.currentWorkout.date);
      dateElement.textContent = `${this.currentWorkout.date} (${weekday}) ${this.currentWorkout.startTime}`;
    }
    
    // トレーナーセレクトを設定
    this.renderTrainerSelect();
  }
  
  // トレーナーセレクトを描画
  renderTrainerSelect() {
    const trainerSelect = document.getElementById('trainerSelect');
    if (!trainerSelect) return;
    
    const trainers = storage.getTrainers();
    trainerSelect.innerHTML = trainers
      .map(trainer => `<option value="${trainer.id}" ${this.currentWorkout.trainer === trainer.id ? 'selected' : ''}>${trainer.name}</option>`)
      .join('');
  }
  
  // イベントリスナーを設定
  attachEventListeners() {
    console.log('[App] Attaching event listeners...');
    
    // スーパーセット追加ボタン
    const addSupersetBtn = document.getElementById('addSupersetBtn');
    console.log('[App] addSupersetBtn:', addSupersetBtn);
    if (addSupersetBtn) {
      addSupersetBtn.addEventListener('click', () => {
        console.log('[App] addSupersetBtn clicked!');
        this.addSuperset();
      });
      console.log('[App] addSupersetBtn listener attached');
    } else {
      console.error('[App] addSupersetBtn not found!');
    }
    
    // 通常種目追加ボタン
    const addNormalBtn = document.getElementById('addNormalBtn');
    console.log('[App] addNormalBtn:', addNormalBtn);
    if (addNormalBtn) {
      addNormalBtn.addEventListener('click', () => {
        console.log('[App] addNormalBtn clicked!');
        this.addNormalExercise();
      });
      console.log('[App] addNormalBtn listener attached');
    } else {
      console.error('[App] addNormalBtn not found!');
    }
    
    // トレーナー選択
    const trainerSelect = document.getElementById('trainerSelect');
    console.log('[App] trainerSelect:', trainerSelect);
    if (trainerSelect) {
      trainerSelect.addEventListener('change', (e) => {
        console.log('[App] trainerSelect changed!');
        this.currentWorkout.trainer = e.target.value === 'self' ? null : e.target.value;
        this.saveCurrentWorkout();
      });
      console.log('[App] trainerSelect listener attached');
    } else {
      console.error('[App] trainerSelect not found!');
    }
    
    console.log('[App] All event listeners attached');
  }
  
  // ========== ワークアウト描画 ==========
  
  renderWorkout() {
    console.log('[App] Rendering workout...');
    const container = document.getElementById('exerciseListContainer');
    console.log('[App] exerciseListContainer:', container);
    if (!container) return;
    
    // クリア
    container.innerHTML = '';
    
    // 各グループを描画
    this.currentWorkout.exercises.forEach(group => {
      let groupElement;
      if (group.groupType === 'superset') {
        groupElement = ui.createSupersetGroup(group);
      } else {
        groupElement = ui.createNormalGroup(group);
      }
      container.appendChild(groupElement);
    });
  }
  
  // ========== グループ管理 ==========
  
  // スーパーセットを追加
  addSuperset() {
    const newGroup = createExerciseGroup('superset');
    newGroup.order = this.currentWorkout.exercises.length + 1;
    
    // 2つの空の種目を追加
    newGroup.exercises.push(createExercise());
    newGroup.exercises.push(createExercise());
    
    // 各種目に1セット追加
    newGroup.exercises.forEach(exercise => {
      exercise.sets.push(createSet(1));
    });
    
    this.currentWorkout.exercises.push(newGroup);
    this.saveCurrentWorkout();
    
    // UIを再描画
    this.renderWorkout();
  }
  
  // 通常種目を追加
  addNormalExercise() {
    const newGroup = createExerciseGroup('normal');
    newGroup.order = this.currentWorkout.exercises.length + 1;
    
    const exercise = createExercise();
    exercise.sets.push(createSet(1));
    newGroup.exercises.push(exercise);
    
    this.currentWorkout.exercises.push(newGroup);
    this.saveCurrentWorkout();
    
    // UIを再描画
    this.renderWorkout();
  }
  
  // グループに種目を追加
  addExerciseToGroup(groupId) {
    const group = this.currentWorkout.exercises.find(g => g.groupId === groupId);
    if (!group) return;
    
    const exercise = createExercise();
    exercise.sets.push(createSet(1));
    group.exercises.push(exercise);
    
    this.saveCurrentWorkout();
    
    // UIを再描画
    this.renderWorkout();
  }
  
  // ========== 種目管理 ==========
  
  // 種目名を更新
  updateExerciseName(exerciseId, name) {
    const exercise = this.findExercise(exerciseId);
    if (exercise) {
      exercise.exerciseName = name;
    }
  }
  
  // 器具を更新
  updateEquipment(exerciseId, equipment) {
    const exercise = this.findExercise(exerciseId);
    if (exercise) {
      exercise.equipment = equipment;
    }
  }
  
  // 角度を更新
  updateAngle(exerciseId, angle) {
    const exercise = this.findExercise(exerciseId);
    if (exercise) {
      exercise.benchAngle = angle;
    }
  }
  
  // 種目を検索
  findExercise(exerciseId) {
    for (const group of this.currentWorkout.exercises) {
      const exercise = group.exercises.find(e => e.exerciseId === exerciseId);
      if (exercise) return exercise;
    }
    return null;
  }
  
  // ========== セット管理 ==========
  
  // セットを追加
  addSet(exerciseId) {
    const exercise = this.findExercise(exerciseId);
    if (!exercise) return;
    
    const newSetNumber = exercise.sets.length + 1;
    exercise.sets.push(createSet(newSetNumber));
    
    this.saveCurrentWorkout();
    
    // UIを再描画
    this.renderWorkout();
  }
  
  // セット番号を再計算
  recalculateSetNumbers(exerciseElement) {
    const setRows = exerciseElement.querySelectorAll('.set-row');
    setRows.forEach((row, index) => {
      row.querySelector('.set-number').textContent = `SET ${index + 1}`;
      row.dataset.setNumber = index + 1;
    });
  }
  
  // ========== データ保存 ==========
  
  // 現在のワークアウトを保存
  saveCurrentWorkout() {
    // UIから最新データを取得
    this.syncDataFromUI();
    
    // 統計を更新
    this.updateStats();
    
    // LocalStorageに保存
    storage.saveCurrentWorkout(this.currentWorkout);
  }
  
  // UIからデータを同期
  syncDataFromUI() {
    const container = document.getElementById('exerciseListContainer');
    if (!container) return;
    
    const groupElements = container.querySelectorAll('.exercise-group');
    
    groupElements.forEach((groupElement, groupIndex) => {
      const groupId = groupElement.dataset.groupId;
      const group = this.currentWorkout.exercises.find(g => g.groupId === groupId);
      if (!group) return;
      
      // 順序を更新
      group.order = groupIndex + 1;
      
      // 各種目のデータを同期
      const exerciseElements = groupElement.querySelectorAll('.exercise-item');
      exerciseElements.forEach((exerciseElement, exerciseIndex) => {
        const exerciseId = exerciseElement.dataset.exerciseId;
        const exercise = group.exercises[exerciseIndex];
        if (!exercise) return;
        
        // 種目名
        const nameInput = exerciseElement.querySelector('.exercise-name-input');
        if (nameInput) exercise.exerciseName = nameInput.value;
        
        // 器具
        const equipmentSelect = exerciseElement.querySelector('.equipment-select');
        if (equipmentSelect) exercise.equipment = equipmentSelect.value;
        
        // 角度
        const angleSelect = exerciseElement.querySelector('.angle-select');
        if (angleSelect) exercise.benchAngle = angleSelect.value;
        
        // セットデータ
        const setRows = exerciseElement.querySelectorAll('.set-row');
        exercise.sets = [];
        setRows.forEach((setRow, setIndex) => {
          const setData = {
            setNumber: setIndex + 1,
            weight: parseFloat(setRow.querySelector('.weight-input').value) || 0,
            repsUnassisted: parseInt(setRow.querySelector('.reps-input').value) || 0,
            repsAssisted: parseInt(setRow.querySelector('.assisted-input').value) || 0,
            rpe: parseInt(setRow.querySelector('.rpe-badge').textContent.replace('RPE ', '')) || 8,
            restSeconds: 90,
            notes: ''
          };
          exercise.sets.push(setData);
        });
      });
    });
  }
  
  // ========== 統計更新 ==========
  
  updateStats() {
    const stats = storage.calculateWorkoutStats(this.currentWorkout);
    
    // 統計を表示
    const totalExercisesElement = document.getElementById('totalExercises');
    if (totalExercisesElement) {
      totalExercisesElement.textContent = stats.totalExercises;
    }
    
    const totalSetsElement = document.getElementById('totalSets');
    if (totalSetsElement) {
      totalSetsElement.textContent = stats.totalSets;
    }
    
    const totalVolumeElement = document.getElementById('totalVolume');
    if (totalVolumeElement) {
      totalVolumeElement.textContent = `${(stats.totalVolume / 1000).toFixed(1)}k`;
    }
    
    const durationElement = document.getElementById('duration');
    if (durationElement) {
      const now = new Date();
      const start = this.currentWorkout.startTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const elapsed = nowMinutes - startMinutes;
      durationElement.textContent = elapsed > 0 ? `${elapsed}分` : '0分';
    }
  }
  
  // ========== 削除機能 ==========
  
  // グループを削除
  deleteGroup(groupId) {
    const index = this.currentWorkout.exercises.findIndex(g => g.groupId === groupId);
    if (index !== -1) {
      this.currentWorkout.exercises.splice(index, 1);
      this.saveCurrentWorkout();
      this.renderWorkout();
    }
  }
  
  // 種目を削除
  deleteExercise(exerciseId) {
    // 全てのグループから種目を探す
    for (let i = 0; i < this.currentWorkout.exercises.length; i++) {
      const group = this.currentWorkout.exercises[i];
      const exerciseIndex = group.exercises.findIndex(e => e.exerciseId === exerciseId);
      
      if (exerciseIndex !== -1) {
        // 種目を削除
        group.exercises.splice(exerciseIndex, 1);
        
        // グループに種目がなくなったらグループごと削除
        if (group.exercises.length === 0) {
          this.currentWorkout.exercises.splice(i, 1);
        }
        
        this.saveCurrentWorkout();
        this.renderWorkout();
        break;
      }
    }
  }
  
  // ========== ワークアウト完了 ==========
  
  completeWorkout() {
    if (confirm('トレーニングを完了しますか？')) {
      this.syncDataFromUI();
      
      // デバッグ用：保存前のデータをログ出力
      console.log('保存するワークアウト:', JSON.stringify(this.currentWorkout, null, 2));
      
      const success = storage.completeWorkout(this.currentWorkout);
      
      if (success) {
        alert('お疲れ様でした！🔥\n\n履歴タブで確認できます。');
        // 新しいワークアウトを開始
        this.currentWorkout = createWorkoutEntry();
        storage.saveCurrentWorkout(this.currentWorkout);
        this.init();
      } else {
        alert('保存に失敗しました。\n\nブラウザーのコンソールを確認してください。');
      }
    }
  }
}

// アプリケーションインスタンス
// 初期化はinit.jsが行う
let app;
