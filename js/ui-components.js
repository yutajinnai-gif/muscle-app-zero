/**
 * UIコンポーネント生成システム
 * 動的にUIを生成する関数群
 */

class UIComponents {
  
  // ========== グループ生成 ==========
  
  // スーパーセットグループを生成
  createSupersetGroup(groupData) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'exercise-group superset';
    groupDiv.dataset.groupId = groupData.groupId;
    groupDiv.dataset.groupType = 'superset';
    
    groupDiv.innerHTML = `
      <div class="group-header">
        <div>
          <span class="drag-handle">⋮⋮</span>
          <span class="group-title superset">🔥 スーパーセット #${groupData.order}</span>
        </div>
        <div>
          <span class="group-order">${groupData.order}番目</span>
          <button class="delete-group-btn" data-group-id="${groupData.groupId}" title="グループを削除">🗑️</button>
        </div>
      </div>
      <div class="exercises-container"></div>
      <span class="add-exercise-link">+ この組に種目追加</span>
    `;
    
    const exercisesContainer = groupDiv.querySelector('.exercises-container');
    groupData.exercises.forEach((exercise, index) => {
      const label = String.fromCharCode(65 + index); // A, B, C...
      exercisesContainer.appendChild(this.createExerciseItem(exercise, label));
    });
    
    // イベントリスナーを追加
    this.attachGroupListeners(groupDiv);
    
    return groupDiv;
  }
  
  // 通常種目グループを生成
  createNormalGroup(groupData) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'exercise-group';
    groupDiv.dataset.groupId = groupData.groupId;
    groupDiv.dataset.groupType = 'normal';
    
    groupDiv.innerHTML = `
      <div class="group-header">
        <div>
          <span class="drag-handle">⋮⋮</span>
          <span class="group-title">通常種目 #${groupData.order}</span>
        </div>
        <div>
          <span class="group-order">${groupData.order}番目</span>
          <button class="delete-group-btn" data-group-id="${groupData.groupId}" title="グループを削除">🗑️</button>
        </div>
      </div>
      <div class="exercises-container"></div>
    `;
    
    const exercisesContainer = groupDiv.querySelector('.exercises-container');
    exercisesContainer.appendChild(this.createExerciseItem(groupData.exercises[0]));
    
    // イベントリスナーを追加
    this.attachGroupListeners(groupDiv);
    
    return groupDiv;
  }
  
  // ========== 種目生成 ==========
  
  // 種目アイテムを生成
  createExerciseItem(exerciseData, label = null) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'exercise-item';
    itemDiv.dataset.exerciseId = exerciseData.exerciseId;
    
    itemDiv.innerHTML = `
      <div class="exercise-header">
        ${label ? `<span class="exercise-label">${label}</span>` : ''}
        <input type="text" class="exercise-name-input" 
               value="${exerciseData.exerciseName}" 
               placeholder="種目名"
               data-exercise-id="${exerciseData.exerciseId}">
        <button class="delete-exercise-btn" data-exercise-id="${exerciseData.exerciseId}" title="種目を削除">🗑️</button>
      </div>
      
      <div class="equipment-row">
        <label>器具:</label>
        <select class="equipment-select" data-exercise-id="${exerciseData.exerciseId}">
          ${this.getEquipmentOptions(exerciseData.equipment)}
        </select>
        <label>角度:</label>
        <select class="angle-select" data-exercise-id="${exerciseData.exerciseId}">
          ${this.getAngleOptions(exerciseData.benchAngle)}
        </select>
      </div>
      
      <div class="sets-header">
        <span class="sets-label">セット記録</span>
        <span class="add-set-link" data-exercise-id="${exerciseData.exerciseId}">+ 追加</span>
      </div>
      
      <div class="set-list" data-exercise-id="${exerciseData.exerciseId}"></div>
      
      <div class="history-compact" data-exercise-id="${exerciseData.exerciseId}">
        過去データを読み込み中...
      </div>
    `;
    
    // セットを追加
    const setList = itemDiv.querySelector('.set-list');
    if (exerciseData.sets && exerciseData.sets.length > 0) {
      exerciseData.sets.forEach(set => {
        setList.appendChild(this.createSetRow(set));
      });
    } else {
      // セットがない場合は1つ追加
      setList.appendChild(this.createSetRow(createSet(1)));
    }
    
    // イベントリスナーを追加
    this.attachExerciseListeners(itemDiv);
    
    // 過去データを読み込み
    this.loadHistoryForExercise(itemDiv, exerciseData);
    
    return itemDiv;
  }
  
  // ========== セット生成 ==========
  
  // セット行を生成
  createSetRow(setData) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'set-row';
    rowDiv.dataset.setNumber = setData.setNumber;
    
    const assistedColor = setData.repsAssisted > 0 ? 
      'style="color: #FF9800; border-bottom-color: rgba(255, 152, 0, 0.5);"' : '';
    
    rowDiv.innerHTML = `
      <span class="set-number">SET ${setData.setNumber}</span>
      <div class="set-input">
        <input type="number" value="${setData.weight || ''}" placeholder="kg" 
               class="weight-input" min="0" step="0.5">
        <span>×</span>
        <input type="number" value="${setData.repsUnassisted || ''}" placeholder="自" 
               class="reps-input" min="0" step="1">
        <span>+</span>
        <input type="number" value="${setData.repsAssisted || ''}" placeholder="補" 
               class="assisted-input" min="0" step="1" ${assistedColor}>
      </div>
      <div class="rpe-badge">RPE ${setData.rpe || '-'}</div>
      <button class="remove-btn" title="セットを削除">✕</button>
    `;
    
    // イベントリスナーを追加
    this.attachSetRowListeners(rowDiv);
    
    return rowDiv;
  }
  
  // ========== オプション生成 ==========
  
  // 器具オプションを生成
  getEquipmentOptions(selected) {
    const options = [
      { value: 'barbell', label: 'バーベル' },
      { value: 'dumbbell', label: 'ダンベル' },
      { value: 'smith_machine', label: 'スミスマシン' },
      { value: 'cable', label: 'ケーブル' },
      { value: 'machine', label: 'マシン' }
    ];
    
    return options
      .map(opt => `<option value="${opt.value}" ${selected === opt.value ? 'selected' : ''}>${opt.label}</option>`)
      .join('');
  }
  
  // 角度オプションを生成
  getAngleOptions(selected) {
    const options = [
      { value: 'decline', label: 'デクライン' },
      { value: 'flat', label: 'フラット' },
      { value: 'incline_30', label: 'インクライン30°' },
      { value: 'incline_45', label: 'インクライン45°' }
    ];
    
    return options
      .map(opt => `<option value="${opt.value}" ${selected === opt.value ? 'selected' : ''}>${opt.label}</option>`)
      .join('');
  }
  
  // ========== イベントリスナー ==========
  
  // グループのイベントリスナーを追加
  attachGroupListeners(groupDiv) {
    // スーパーセットに種目追加
    const addLink = groupDiv.querySelector('.add-exercise-link');
    if (addLink) {
      addLink.addEventListener('click', () => {
        const groupId = groupDiv.dataset.groupId;
        app.addExerciseToGroup(groupId);
      });
    }
    
    // グループ削除
    const deleteGroupBtn = groupDiv.querySelector('.delete-group-btn');
    if (deleteGroupBtn) {
      deleteGroupBtn.addEventListener('click', (e) => {
        if (confirm('このグループを削除しますか？')) {
          const groupId = e.target.dataset.groupId;
          app.deleteGroup(groupId);
        }
      });
    }
  }
  
  // 種目のイベントリスナーを追加
  attachExerciseListeners(itemDiv) {
    // 種目名の変更
    const nameInput = itemDiv.querySelector('.exercise-name-input');
    nameInput.addEventListener('change', (e) => {
      app.updateExerciseName(e.target.dataset.exerciseId, e.target.value);
      app.saveCurrentWorkout();
    });
    
    // 器具の変更
    const equipmentSelect = itemDiv.querySelector('.equipment-select');
    equipmentSelect.addEventListener('change', (e) => {
      app.updateEquipment(e.target.dataset.exerciseId, e.target.value);
      app.saveCurrentWorkout();
    });
    
    // 角度の変更
    const angleSelect = itemDiv.querySelector('.angle-select');
    angleSelect.addEventListener('change', (e) => {
      app.updateAngle(e.target.dataset.exerciseId, e.target.value);
      app.saveCurrentWorkout();
    });
    
    // セット追加
    const addSetLink = itemDiv.querySelector('.add-set-link');
    addSetLink.addEventListener('click', (e) => {
      app.addSet(e.target.dataset.exerciseId);
    });
    
    // 種目削除
    const deleteBtn = itemDiv.querySelector('.delete-exercise-btn');
    deleteBtn.addEventListener('click', (e) => {
      if (confirm('この種目を削除しますか？')) {
        const exerciseId = e.target.dataset.exerciseId;
        app.deleteExercise(exerciseId);
      }
    });
  }
  
  // セット行のイベントリスナーを追加
  attachSetRowListeners(rowDiv) {
    // 重量入力
    const weightInput = rowDiv.querySelector('.weight-input');
    weightInput.addEventListener('change', () => {
      this.autoCalculateRPE(rowDiv);
      app.saveCurrentWorkout();
    });
    
    // レップ数入力
    const repsInput = rowDiv.querySelector('.reps-input');
    repsInput.addEventListener('change', () => {
      this.autoCalculateRPE(rowDiv);
      app.saveCurrentWorkout();
    });
    
    // 補助レップ数入力（色を変更）
    const assistedInput = rowDiv.querySelector('.assisted-input');
    assistedInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      if (value > 0) {
        e.target.style.color = '#FF9800';
        e.target.style.borderBottomColor = 'rgba(255, 152, 0, 0.5)';
      } else {
        e.target.style.color = 'white';
        e.target.style.borderBottomColor = 'rgba(255, 107, 53, 0.3)';
      }
    });
    assistedInput.addEventListener('change', () => {
      this.autoCalculateRPE(rowDiv);
      app.saveCurrentWorkout();
    });
    
    // RPE編集
    const rpeBadge = rowDiv.querySelector('.rpe-badge');
    rpeBadge.addEventListener('blur', () => {
      app.saveCurrentWorkout();
    });
    
    // セット削除
    const removeBtn = rowDiv.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      if (confirm('このセットを削除しますか？')) {
        rowDiv.remove();
        app.recalculateSetNumbers(rowDiv.closest('.exercise-item'));
        app.saveCurrentWorkout();
      }
    });
  }
  
  // ========== 過去データ表示 ==========
  
  // 過去データを読み込んで表示
  loadHistoryForExercise(itemDiv, exerciseData) {
    // 種目名が空の場合はスキップ
    if (!exerciseData.exerciseName) {
      const historyDiv = itemDiv.querySelector('.history-compact');
      historyDiv.innerHTML = '種目名を入力すると過去データが表示されます';
      return;
    }
    
    // 過去データを取得
    const history = storage.getExerciseHistory(
      exerciseData.exerciseName,
      {
        equipment: exerciseData.equipment,
        benchAngle: exerciseData.benchAngle,
        attachment: exerciseData.attachment
      }
    );
    
    const historyDiv = itemDiv.querySelector('.history-compact');
    
    if (history.length === 0) {
      historyDiv.innerHTML = '初回の記録です 🎉';
      return;
    }
    
    // 最新のエントリ
    const lastEntry = history[0];
    
    // 最大セットを取得
    const lastMaxSet = this.getMaxSet(lastEntry.sets);
    const comparison = this.comparePerformance(exerciseData, lastEntry);
    
    historyDiv.innerHTML = `
      前回: ${lastMaxSet.weight}kg×${lastMaxSet.repsUnassisted}+${lastMaxSet.repsAssisted} 
      (${formatDate(lastEntry.date)}) → <strong>${comparison}</strong>
    `;
  }
  
  // 最大セットを取得
  getMaxSet(sets) {
    if (!sets || sets.length === 0) {
      return { weight: 0, repsUnassisted: 0, repsAssisted: 0 };
    }
    
    return sets.reduce((max, set) => {
      if (set.weight > max.weight) return set;
      if (set.weight === max.weight) {
        const totalReps = set.repsUnassisted + set.repsAssisted;
        const maxTotalReps = max.repsUnassisted + max.repsAssisted;
        if (totalReps > maxTotalReps) return set;
      }
      return max;
    }, sets[0]);
  }
  
  // パフォーマンス比較
  comparePerformance(current, previous) {
    if (!current.sets || current.sets.length === 0) {
      return '記録待ち';
    }
    
    const currentMax = this.getMaxSet(current.sets);
    const previousMax = this.getMaxSet(previous.sets);
    
    const messages = [];
    
    // 重量の変化
    const weightDiff = currentMax.weight - previousMax.weight;
    if (weightDiff > 0) {
      messages.push(`+${weightDiff}kg`);
    } else if (weightDiff < 0) {
      messages.push(`${weightDiff}kg`);
    }
    
    // 自力レップ数の変化
    const repsDiff = currentMax.repsUnassisted - previousMax.repsUnassisted;
    if (repsDiff > 0) {
      messages.push(`自力+${repsDiff}`);
    } else if (repsDiff < 0) {
      messages.push(`自力${repsDiff}`);
    }
    
    // 補助の変化
    const assistedDiff = currentMax.repsAssisted - previousMax.repsAssisted;
    if (assistedDiff < 0 && previousMax.repsAssisted > 0) {
      messages.push('補助減 👍');
    } else if (assistedDiff > 0) {
      messages.push('補助増 ⚠️');
    }
    
    if (messages.length === 0) {
      return '前回と同じ';
    }
    
    return messages.join(' ');
  }
  
  // RPE自動計算
  autoCalculateRPE(rowDiv) {
    const weightInput = rowDiv.querySelector('.weight-input');
    const repsInput = rowDiv.querySelector('.reps-input');
    const assistedInput = rowDiv.querySelector('.assisted-input');
    const rpeBadge = rowDiv.querySelector('.rpe-badge');
    
    const weight = parseFloat(weightInput.value) || 0;
    const selfReps = parseInt(repsInput.value) || 0;
    const assistedReps = parseInt(assistedInput.value) || 0;
    
    // 入力がない場合は計算しない
    if (weight === 0 || selfReps === 0) {
      return;
    }
    
    let rpe = 5; // デフォルト値
    
    // レップ数でRPEを推定
    if (selfReps >= 12) {
      rpe = 6; // 高レップ
    } else if (selfReps >= 8) {
      rpe = 7; // 中レップ
    } else if (selfReps >= 5) {
      rpe = 8; // 低レップ
    } else if (selfReps >= 3) {
      rpe = 9; // 高重量
    } else {
      rpe = 9.5; // 最大重量
    }
    
    // 補助がある場合はRPEを上げる
    if (assistedReps > 0) {
      rpe = Math.min(10, rpe + 0.5 + (assistedReps * 0.2));
    }
    
    // RPEを表示
    rpeBadge.textContent = `RPE ${rpe.toFixed(1)}`;
  }
}

// グローバルインスタンスを作成
const ui = new UIComponents();
