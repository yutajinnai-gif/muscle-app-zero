/**
 * データ構造定義
 * 筋トレアプリのコアデータモデル
 */

// LocalStorageのキー定義
const STORAGE_KEYS = {
  WORKOUTS: 'muscle_app_workouts',
  EXERCISES_MASTER: 'muscle_app_exercises_master',
  TRAINERS: 'muscle_app_trainers',
  SETTINGS: 'muscle_app_settings',
  CURRENT_WORKOUT: 'muscle_app_current_workout'
};

// ワークアウトエントリのテンプレート
function createWorkoutEntry() {
  return {
    id: generateId('entry'),
    date: getCurrentDate(),
    startTime: getCurrentTime(),
    endTime: null,
    trainer: null, // トレーナーID、nullの場合は自主トレ
    
    exercises: [],
    
    condition: {
      sleep: 7,
      sleepQuality: 3,
      fatigue: 3,
      stress: 3,
      mood: 3,
      caffeine: false
    },
    
    sessionNotes: '',
    
    // 統計情報（自動計算）
    stats: {
      totalExercises: 0,
      totalSets: 0,
      totalVolume: 0,
      duration: 0
    }
  };
}

// 種目グループのテンプレート
function createExerciseGroup(type = 'normal') {
  return {
    groupId: generateId('group'),
    groupType: type, // 'superset' or 'normal'
    order: 0, // セッション内での順序
    exercises: []
  };
}

// 種目のテンプレート
function createExercise() {
  return {
    exerciseId: generateId('exercise'),
    exerciseName: '',
    equipment: 'barbell', // barbell, dumbbell, smith_machine, cable, machine
    benchAngle: 'flat', // decline, flat, incline_30, incline_45
    attachment: null, // ケーブル系種目で使用
    gripWidth: 'standard', // narrow, standard, wide
    notes: '',
    sets: []
  };
}

// セットのテンプレート
function createSet(setNumber = 1) {
  return {
    setNumber: setNumber,
    weight: 0,
    repsUnassisted: 0, // 自力レップ数
    repsAssisted: 0, // 補助レップ数
    rpe: 8,
    restSeconds: 90,
    notes: ''
  };
}

// トレーナー情報のテンプレート
function createTrainer(name) {
  return {
    id: generateId('trainer'),
    name: name,
    createdAt: new Date().toISOString()
  };
}

// ID生成関数
function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

// 現在の日付を取得 (YYYY-MM-DD)
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 現在の時刻を取得 (HH:MM)
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 日付のフォーマット
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '昨日';
  } else if (diffDays <= 7) {
    return `${diffDays}日前`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}週間前`;
  } else if (diffDays <= 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}ヶ月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}年前`;
  }
}

// 曜日を取得
function getWeekday(dateString) {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(dateString);
  return weekdays[date.getDay()];
}

// 器具の日本語名
const EQUIPMENT_LABELS = {
  'barbell': 'バーベル',
  'dumbbell': 'ダンベル',
  'smith_machine': 'スミスマシン',
  'cable': 'ケーブル',
  'machine': 'マシン',
  'leg_press': 'レッグプレス',
  'trap_bar': 'トラップバー'
};

// ベンチ角度の日本語名
const BENCH_ANGLE_LABELS = {
  'decline': 'デクライン',
  'flat': 'フラット',
  'incline_30': 'インクライン30°',
  'incline_45': 'インクライン45°'
};

// アタッチメントの日本語名
const ATTACHMENT_LABELS = {
  'wide_bar': 'ワイドバー',
  'parallel': 'パラレル',
  'mag_grip': 'MAGグリップ',
  'rope': 'ロープ',
  'd_handle': 'Dハンドル',
  'single_handle': 'シングルハンドル',
  'straight_bar': 'ストレートバー',
  'v_bar': 'Vバー'
};

// グリップ幅の日本語名
const GRIP_WIDTH_LABELS = {
  'narrow': '狭い',
  'standard': '標準',
  'wide': '広い'
};

// データバリデーション
function validateWorkoutEntry(entry) {
  const errors = [];
  
  if (!entry.id) {
    errors.push('IDが必要です');
  }
  
  if (!entry.date) {
    errors.push('日付が必要です');
  }
  
  if (!Array.isArray(entry.exercises)) {
    errors.push('exercisesは配列である必要があります');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// デフォルトトレーナーリスト
const DEFAULT_TRAINERS = [
  { id: 'self', name: '自主', createdAt: new Date().toISOString() },
  { id: 'trainer_yamada', name: '山田T', createdAt: new Date().toISOString() },
  { id: 'trainer_tanaka', name: '田中T', createdAt: new Date().toISOString() },
  { id: 'trainer_suzuki', name: '鈴木T', createdAt: new Date().toISOString() }
];
