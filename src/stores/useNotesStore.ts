import { create } from 'zustand';
import { Note, NavSection, FolderId, DiaryEntry, UserProfile } from '../types';
// db imports removed — cloud sync is permanently disabled (no tenant isolation,
// credentials were bundled in client JS). All storage is local-only.
import { Language, translations } from '../lib/i18n';

export const INITIAL_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'diary-1',
    date: '2026-09-09',
    mood: 'sleepy',
    weather: 'cozy',
    title: 'Góc làm việc nhỏ & ly trà thơm ☕',
    content: 'Hôm nay trời mưa mát mẻ. Ngồi nhâm nhi tách trà ấm và hoàn thành xong các kế hoạch trong ngày. Cảm thấy lòng thật nhẹ nhõm, bình yên và biết ơn vì những điều giản dị quanh mình. ♡',
    photoUrl: 'coffee',
    tapeStyle: 'mint',
    tapePosition: 'center',
    createdAt: '2026-09-09T20:30:00Z',
    updatedAt: '2026-09-09T20:30:00Z',
  },
  {
    id: 'diary-2',
    date: '2026-09-10',
    mood: 'sparkle',
    weather: 'sunny',
    title: 'Một ngày nhiều cảm hứng mới 🌼',
    content: 'Bắt đầu ngày mới tràn đầy năng lượng cùng FrogiNotes! Rất nhiều ý tưởng sáng tạo đang nở hoa. Bạn xứng đáng với những điều tốt đẹp và tươi sáng nhất! Hãy luôn yêu thương bản thân nhé. ♡',
    photoUrl: 'daisy',
    tapeStyle: 'pink',
    tapePosition: 'corners',
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z',
  },
];

export const INITIAL_NOTES_VI: Note[] = [
  {
    id: 'note-1',
    title: 'Chào buổi sáng! ☀️',
    content: 'Một ngày mới là một khởi đầu mới.\nBạn làm được mà! Cố lên nhé ♡',
    type: 'text',
    color: 'yellow',
    icon: 'pin',
    chip: { icon: 'clock', text: 'Hôm nay, 8:00 AM' },
    doodle: 'sun',
    mascot: 'love',
    folderId: 'personal',
    isPinned: true,
    isToday: true,
    createdAt: '2024-04-23T08:00:00Z',
    updatedAt: '2024-04-23T08:00:00Z',
  },
  {
    id: 'note-2',
    title: 'Kế hoạch hôm nay',
    type: 'checklist',
    color: 'mint',
    icon: 'leaf',
    checklist: [
      { id: 'tp-1', text: 'Hoàn thành dự án', completed: true },
      { id: 'tp-2', text: 'Đọc 10 trang sách', completed: false },
      { id: 'tp-3', text: 'Đi dạo hít thở', completed: false },
      { id: 'tp-4', text: 'Uống đủ 2 lít nước', completed: false },
      { id: 'tp-5', text: 'Tự hào về bản thân! ♡', completed: false },
    ],
    doodle: 'none',
    mascot: 'confident',
    folderId: 'work',
    isToday: true,
    createdAt: '2024-04-23T08:30:00Z',
    updatedAt: '2024-04-23T08:30:00Z',
  },
  {
    id: 'note-3',
    title: 'Nhắc hẹn',
    content: 'Khám nha khoa định kỳ',
    type: 'text',
    color: 'peach',
    icon: 'bell',
    chip: { icon: 'calendar', text: '25 Th4, 10:00 AM' },
    hasReminder: true,
    mascot: 'surprised',
    folderId: 'health',
    createdAt: '2024-04-23T09:00:00Z',
    updatedAt: '2024-04-23T09:00:00Z',
  },
  {
    id: 'note-4',
    title: 'Ghi chú nhanh',
    content: 'Những điều tốt đẹp\nluôn cần thời gian. ♡',
    type: 'text',
    color: 'lime',
    icon: 'leaf',
    doodle: 'sprout',
    mascot: 'wink',
    folderId: 'personal',
    createdAt: '2024-04-23T09:15:00Z',
    updatedAt: '2024-04-23T09:15:00Z',
  },
  {
    id: 'note-5',
    title: 'Ý tưởng mới',
    type: 'bullets',
    color: 'blush',
    icon: 'lightbulb',
    bullets: [
      'Ý tưởng ứng dụng mới',
      'Chuyến dã ngoại cuối tuần',
      'Học một điều thú vị',
      'Sống hạnh phúc hơn mỗi ngày ♡',
    ],
    mascot: 'thinking',
    folderId: 'ideas',
    createdAt: '2024-04-23T09:30:00Z',
    updatedAt: '2024-04-23T09:30:00Z',
  },
  {
    id: 'note-6',
    title: 'Những ngày tươi sáng\nphía trước. ♡',
    type: 'photo',
    color: 'photo',
    doodle: 'photo-daisy',
    photoUrl: 'daisy',
    tapeStyle: 'mint',
    tapePosition: 'center',
    mascot: 'sparkle',
    folderId: 'ideas',
    createdAt: '2024-04-23T09:45:00Z',
    updatedAt: '2024-04-23T09:45:00Z',
  },
  {
    id: 'note-7',
    title: 'Đồ cần mua',
    type: 'checklist',
    color: 'pink',
    icon: 'cart',
    checklist: [
      { id: 'gr-1', text: 'Sữa tươi', completed: false },
      { id: 'gr-2', text: 'Trứng gà', completed: false },
      { id: 'gr-3', text: 'Chuối chín', completed: false },
      { id: 'gr-4', text: 'Trà xanh thơm', completed: false },
    ],
    mascot: 'happy',
    folderId: 'personal',
    createdAt: '2024-04-23T10:00:00Z',
    updatedAt: '2024-04-23T10:00:00Z',
  },
  {
    id: 'note-8',
    title: 'Kế hoạch du lịch',
    type: 'bullets',
    color: 'blue',
    icon: 'plane',
    bullets: [
      'Nhật Bản ngắm hoa ♡',
      'Hàn Quốc mùa thu',
      'Một căn cabin ấm cúng ở rừng',
      'Về nơi nhiều cây xanh',
      'Xách ba lô lên và đi! ♡',
    ],
    doodle: 'cloud',
    mascot: 'sparkle',
    folderId: 'travel',
    createdAt: '2024-04-23T10:15:00Z',
    updatedAt: '2024-04-23T10:15:00Z',
  },
  {
    id: 'note-9',
    title: 'Gửi chính mình',
    content: 'Bạn đang làm tốt hơn\nbạn nghĩ rất nhiều đấy. ♡',
    type: 'text',
    color: 'butter',
    icon: 'heart',
    mascot: 'sleepy',
    folderId: 'personal',
    isStarred: true,
    createdAt: '2024-04-23T10:20:00Z',
    updatedAt: '2024-04-23T10:20:00Z',
  },
];

interface NotesState {
  notes: Note[];
  activeNav: NavSection;
  activeFolder: FolderId | null;
  searchQuery: string;
  isCollapsed: boolean;
  viewMode: 'grid' | 'list' | 'calendar';
  floatingPos: { x: number; y: number };
  showNoteModal: boolean;
  editingNote: Note | null;
  environmentMode: boolean;
  isLandingView: boolean;
  setIsLandingView: (val: boolean) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['vi'];

  // Cloud Sync
  cloudSyncEnabled: boolean;
  syncKey: string;
  showSyncModal: boolean;
  isDbConnected: boolean;
  isSyncing: boolean;

  // Actions
  setActiveNav: (nav: NavSection) => void;
  setActiveFolder: (folder: FolderId | null) => void;
  setSearchQuery: (query: string) => void;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setViewMode: (mode: 'grid' | 'list' | 'calendar') => void;
  setFloatingPos: (pos: { x: number; y: number }) => void;
  openNewNoteModal: (folderId?: FolderId) => void;
  openEditNoteModal: (note: Note) => void;
  closeNoteModal: () => void;
  setEnvironmentMode: (env: boolean) => void;

  // Note Actions
  moveToTrash: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;

  // Floating Quick Note
  showQuickNote: boolean;
  setShowQuickNote: (show: boolean) => void;

  // Cloud Sync Actions
  setShowSyncModal: (show: boolean) => void;
  activateCloudSync: (key: string) => Promise<boolean>;
  disableCloudSync: () => void;
  syncFromDB: () => Promise<void>;

  // Diary Entries & Actions
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  // User Auth & Account
  currentUser: UserProfile | null;
  login: (email: string, name?: string, plan?: 'free' | 'pro') => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showAccountModal: boolean;
  setShowAccountModal: (show: boolean) => void;

  // Note CRUD
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  toggleChecklistItem: (noteId: string, itemId: string) => void;
  toggleStar: (id: string) => void;
  togglePin: (id: string) => void;
  resetToDefault: () => void;

  // Pending folder for new note (set by CalendarView or folder context)
  _pendingNewNoteFolderId: FolderId | null;
}

const STORAGE_KEY = 'froginotes_data_v7_empty';
const DIARY_STORAGE_KEY = 'froginotes_diary_v2_empty';
const USER_STORAGE_KEY = 'froginotes_user_v1';
const LANG_KEY = 'froginotes_lang';
const SYNC_ENABLED_KEY = 'froginotes_cloud_sync';
const SYNC_KEY_STORAGE = 'froginotes_sync_key';

const getInitialUser = (): UserProfile | null => {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user profile', e);
    }
  }
  return null;
};

const getInitialNotes = (): Note[] => {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
  }
  return []; // Default empty board for fresh install
};

const getInitialDiaryEntries = (): DiaryEntry[] => {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(DIARY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load diary from localStorage', e);
    }
  }
  return []; // Default empty diary for fresh install
};

const getInitialLandingView = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'app') return false;
  if (params.get('view') === 'landing') return true;
  if (!!(window as any).electronAPI) return false;
  return true; // Default to Landing Page on the web
};

const getInitialLanguage = (): Language => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  }
  return 'vi'; // Default to Tiếng Việt as primary!
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: getInitialNotes(),
  diaryEntries: getInitialDiaryEntries(),
  activeNav: 'notes',
  activeFolder: null,
  searchQuery: '',
  isCollapsed: false,
  viewMode: 'grid',
  floatingPos: { x: 1460, y: 770 },
  showNoteModal: false,
  editingNote: null,
  environmentMode: true,
  isLandingView: getInitialLandingView(),
  _pendingNewNoteFolderId: null,
  setIsLandingView: (val: boolean) => set({ isLandingView: val }),

  language: getInitialLanguage(),
  t: translations[getInitialLanguage()],
  setLanguage: (lang: Language) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANG_KEY, lang);
    }
    set({ language: lang, t: translations[lang] });
  },

  currentUser: getInitialUser(),
  showAuthModal: false,
  setShowAuthModal: (show: boolean) => set({ showAuthModal: show }),
  showAccountModal: false,
  setShowAccountModal: (show: boolean) => set({ showAccountModal: show }),

  login: (email: string, name?: string, plan: 'free' | 'pro' = 'free') => {
    const cleanEmail = email.trim();
    const cleanName = name?.trim() || cleanEmail.split('@')[0] || 'Frogi Friend';
    const profile: UserProfile = {
      id: 'user-' + Date.now(),
      email: cleanEmail,
      name: cleanName,
      plan,
      syncKey: 'FROGI-' + cleanName.toUpperCase().replace(/\s+/g, '') + '-2026',
      createdAt: new Date().toISOString().split('T')[0],
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    }
    set({ currentUser: profile, showAuthModal: false });
  },

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    set({ currentUser: null, showAccountModal: false });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    const curr = get().currentUser;
    if (!curr) return;
    const updated = { ...curr, ...updates };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    }
    set({ currentUser: updated });
  },

  // Cloud sync is permanently disabled — shared DB had no tenant isolation and
  // credentials were bundled client-side. Force false regardless of any stale
  // localStorage value so existing persisted 'true' cannot re-enable DB access.
  cloudSyncEnabled: false,
  syncKey: '',
  showSyncModal: false,
  isDbConnected: false,
  isSyncing: false,
  showQuickNote: false,

  setShowQuickNote: (show) => set({ showQuickNote: show }),

  moveToTrash: (id) => {
    get().updateNote(id, { isTrash: true, isArchived: false });
  },

  restoreFromTrash: (id) => {
    get().updateNote(id, { isTrash: false, isArchived: false });
  },

  emptyTrash: () => {
    // Capture trashIds BEFORE filtering so we still have them for DB deletion
    const trashIds = get().notes.filter((n) => n.isTrash).map((n) => n.id);
    const updated = get().notes.filter((n) => !n.isTrash);
    set({ notes: updated });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Delete from DB only if cloud sync is enabled
    // Cloud sync disabled — no remote deletes
  },

  archiveNote: (id) => {
    get().updateNote(id, { isArchived: true, isTrash: false });
  },

  unarchiveNote: (id) => {
    get().updateNote(id, { isArchived: false, isTrash: false });
  },

  setActiveNav: (nav) => set({ activeNav: nav, activeFolder: null, searchQuery: '' }),
  setActiveFolder: (folder) => set({ activeFolder: folder, activeNav: 'notes', searchQuery: '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setFloatingPos: (pos) => set({ floatingPos: pos }),
  openNewNoteModal: (folderId?: FolderId) =>
    set({ showNoteModal: true, editingNote: null, _pendingNewNoteFolderId: folderId ?? null }),
  openEditNoteModal: (note) =>
    set({ showNoteModal: true, editingNote: note }),
  closeNoteModal: () =>
    set({ showNoteModal: false, editingNote: null, _pendingNewNoteFolderId: null }),
  setEnvironmentMode: (env) => set({ environmentMode: env }),

  setShowSyncModal: (show) => set({ showSyncModal: show }),

  activateCloudSync: async (_key: string) => {
    // Cloud sync is permanently disabled. The shared Turso DB had no tenant
    // isolation and the auth token was bundled in the JS bundle. No key is
    // accepted — this always fails closed.
    console.warn('[store] Cloud sync activation rejected: feature disabled for security.');
    return false;
  },

  disableCloudSync: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SYNC_ENABLED_KEY);
      localStorage.removeItem(SYNC_KEY_STORAGE);
    }
    set({ cloudSyncEnabled: false, syncKey: '', isDbConnected: false, isSyncing: false, showSyncModal: false });
  },

  syncFromDB: async () => {
    // Cloud sync is permanently disabled — always a no-op.
    console.warn('[store] syncFromDB called but cloud sync is disabled.');
    set({ isDbConnected: false, isSyncing: false });
  },

  addNote: (newNoteData) => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'note-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    const newNote: Note = {
      ...newNoteData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newNote, ...state.notes];
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { notes: updated, showNoteModal: false, editingNote: null };
    });
    // Cloud sync disabled — no remote write
  },

  updateNote: (id, updates) => {
    set((state) => {
      const updated = state.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      );
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { notes: updated, showNoteModal: false, editingNote: null };
    });
    // Cloud sync disabled — no remote write
  },

  deleteNote: (id) => {
    set((state) => {
      const updated = state.notes.filter((n) => n.id !== id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { notes: updated, showNoteModal: false, editingNote: null };
    });
    // Cloud sync disabled — no remote write
  },

  duplicateNote: (id) => {
    const state = get();
    const target = state.notes.find((n) => n.id === id);
    if (!target) return;
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'note-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    const dup: Note = {
      ...target,
      id: newId,
      title: target.title + ' (Bản sao)',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [dup, ...state.notes];
    set({ notes: updated });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Cloud sync disabled — no remote write (duplicateNote)
  },

  toggleChecklistItem: (noteId, itemId) => {
    const updated = get().notes.map((note) => {
      if (note.id !== noteId || !note.checklist) return note;
      const newChecklist = note.checklist.map((item, idx) =>
        String(item.id) === String(itemId) || String(idx) === String(itemId)
          ? { ...item, completed: !item.completed }
          : item
      );
      // NOTE: Do NOT update updatedAt here — that would change the sort order
      // and cause the card to jump position in the grid. Checklist toggles are
      // lightweight in-place edits, not full note edits.
      return { ...note, checklist: newChecklist };
    });
    set({ notes: updated });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Cloud sync disabled — no remote write
  },

  toggleStar: (id) => {
    let isStarred = false;
    const now = new Date().toISOString();
    const updated = get().notes.map((n) => {
      if (n.id === id) {
        isStarred = !n.isStarred;
        return { ...n, isStarred, updatedAt: now };
      }
      return n;
    });
    set({ notes: updated });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Cloud sync disabled — no remote write (toggleStar)
  },

  togglePin: (id) => {
    let isPinned = false;
    const now = new Date().toISOString();
    const updated = get().notes.map((n) => {
      if (n.id === id) {
        isPinned = !n.isPinned;
        return { ...n, isPinned, updatedAt: now };
      }
      return n;
    });
    set({ notes: updated });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Cloud sync disabled — no remote write (togglePin)
  },

  // Diary Actions
  addDiaryEntry: (entryData) => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'diary-' + Date.now();
    const now = new Date().toISOString();
    const newEntry: DiaryEntry = {
      ...entryData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      // Check if entry for this date already exists; if so, replace it, else prepend
      const filtered = state.diaryEntries.filter((e) => e.date !== entryData.date);
      const updated = [newEntry, ...filtered];
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updated));
      }
      return { diaryEntries: updated };
    });
    // Cloud sync disabled — no remote write (addDiaryEntry)
  },

  updateDiaryEntry: (id, updates) => {
    let targetEntry: DiaryEntry | undefined = undefined;
    set((state) => {
      const updated = state.diaryEntries.map((e) => {
        if (e.id === id) {
          targetEntry = { ...e, ...updates, updatedAt: new Date().toISOString() };
          return targetEntry;
        }
        return e;
      });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updated));
      }
      return { diaryEntries: updated };
    });
    // Cloud sync disabled — no remote write (updateDiaryEntry)
  },

  deleteDiaryEntry: (id) => {
    set((state) => {
      const updated = state.diaryEntries.filter((e) => e.id !== id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updated));
      }
      return { diaryEntries: updated };
    });
    // Cloud sync disabled — no remote write (deleteDiaryEntry)
  },

  resetToDefault: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ notes: INITIAL_NOTES_VI });
    // Cloud sync disabled — no remote write
  },
}));
