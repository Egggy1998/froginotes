import { create } from 'zustand';
import { Note, NavSection, FolderId, DiaryEntry } from '../types';
import {
  initDatabase,
  fetchNotesFromDB,
  insertNoteToDB,
  updateNoteInDB,
  deleteNoteFromDB,
  fetchDiaryEntriesFromDB,
  insertDiaryEntryToDB,
  deleteDiaryEntryFromDB,
} from '../lib/db';
import { Language, translations } from '../lib/i18n';

export const INITIAL_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'diary-1',
    date: '2026-09-09',
    mood: 'chill',
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
  viewMode: 'grid' | 'list';
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
  setViewMode: (mode: 'grid' | 'list') => void;
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

  // Note CRUD
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  toggleChecklistItem: (noteId: string, itemId: string) => void;
  toggleStar: (id: string) => void;
  togglePin: (id: string) => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'froginotes_data_v6_vi';
const DIARY_STORAGE_KEY = 'froginotes_diary_v1';
const LANG_KEY = 'froginotes_lang';
const SYNC_ENABLED_KEY = 'froginotes_cloud_sync';
const SYNC_KEY_STORAGE = 'froginotes_sync_key';

const getInitialNotes = (): Note[] => {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
  }
  return INITIAL_NOTES_VI;
};

const getInitialDiaryEntries = (): DiaryEntry[] => {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(DIARY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load diary from localStorage', e);
    }
  }
  return INITIAL_DIARY_ENTRIES;
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
  setIsLandingView: (val: boolean) => set({ isLandingView: val }),

  language: getInitialLanguage(),
  t: translations[getInitialLanguage()],
  setLanguage: (lang: Language) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANG_KEY, lang);
    }
    set({ language: lang, t: translations[lang] });
  },

  cloudSyncEnabled: typeof localStorage !== 'undefined' && localStorage.getItem(SYNC_ENABLED_KEY) === 'true',
  syncKey: typeof localStorage !== 'undefined' ? localStorage.getItem(SYNC_KEY_STORAGE) || '' : '',
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
    const updated = get().notes.filter((n) => !n.isTrash);
    set({ notes: updated });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    // Delete in DB
    const trashIds = get().notes.filter((n) => n.isTrash).map((n) => n.id);
    if (get().cloudSyncEnabled) {
      for (const id of trashIds) {
        deleteNoteFromDB(id).catch(console.error);
      }
    }
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
  openNewNoteModal: (folderId) =>
    set({ showNoteModal: true, editingNote: null }),
  openEditNoteModal: (note) =>
    set({ showNoteModal: true, editingNote: note }),
  closeNoteModal: () =>
    set({ showNoteModal: false, editingNote: null }),
  setEnvironmentMode: (env) => set({ environmentMode: env }),

  setShowSyncModal: (show) => set({ showSyncModal: show }),

  activateCloudSync: async (key: string) => {
    if (!key.trim()) return false;
    const cleanKey = key.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SYNC_ENABLED_KEY, 'true');
      localStorage.setItem(SYNC_KEY_STORAGE, cleanKey);
    }
    set({ cloudSyncEnabled: true, syncKey: cleanKey, isDbConnected: true, isSyncing: true, showSyncModal: false });

    // Sync all current notes & diary entries to Turso
    try {
      const state = get();
      for (const n of state.notes) {
        await insertNoteToDB(n);
      }
      for (const d of state.diaryEntries) {
        await insertDiaryEntryToDB(d);
      }
      await state.syncFromDB();
      return true;
    } catch (e) {
      console.error('Failed to sync to Turso on activation:', e);
      set({ isSyncing: false });
      return false;
    }
  },

  disableCloudSync: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SYNC_ENABLED_KEY);
      localStorage.removeItem(SYNC_KEY_STORAGE);
    }
    set({ cloudSyncEnabled: false, syncKey: '', isDbConnected: false, isSyncing: false, showSyncModal: false });
  },

  syncFromDB: async () => {
    const { cloudSyncEnabled } = get();
    if (!cloudSyncEnabled) return;

    set({ isSyncing: true });

    try {
      await initDatabase(INITIAL_NOTES_VI);
      const [remoteNotes, remoteDiary] = await Promise.all([
        fetchNotesFromDB(),
        fetchDiaryEntriesFromDB(),
      ]);

      const localNotes = get().notes;
      const localDiary = get().diaryEntries;

      // 1. Bidirectional Merge for Notes
      const mergedNotesMap = new Map<string, Note>();
      for (const rn of remoteNotes) {
        mergedNotesMap.set(rn.id, rn);
      }
      for (const ln of localNotes) {
        const rn = mergedNotesMap.get(ln.id);
        if (!rn) {
          mergedNotesMap.set(ln.id, ln);
          insertNoteToDB(ln).catch(console.error);
        } else {
          const localTime = new Date(ln.updatedAt || 0).getTime();
          const remoteTime = new Date(rn.updatedAt || 0).getTime();
          if (localTime > remoteTime) {
            mergedNotesMap.set(ln.id, ln);
            insertNoteToDB(ln).catch(console.error);
          }
        }
      }
      const finalNotes = Array.from(mergedNotesMap.values());

      // 2. Bidirectional Merge for Diary Entries
      const mergedDiaryMap = new Map<string, DiaryEntry>();
      for (const rd of remoteDiary) {
        mergedDiaryMap.set(rd.date, rd);
      }
      for (const ld of localDiary) {
        const rd = mergedDiaryMap.get(ld.date);
        if (!rd) {
          mergedDiaryMap.set(ld.date, ld);
          insertDiaryEntryToDB(ld).catch(console.error);
        } else {
          const localTime = new Date(ld.updatedAt || 0).getTime();
          const remoteTime = new Date(rd.updatedAt || 0).getTime();
          if (localTime > remoteTime) {
            mergedDiaryMap.set(ld.date, ld);
            insertDiaryEntryToDB(ld).catch(console.error);
          }
        }
      }
      const finalDiary = Array.from(mergedDiaryMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      set({
        notes: finalNotes,
        diaryEntries: finalDiary,
        isDbConnected: true,
        isSyncing: false,
      });

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalNotes));
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(finalDiary));
      }
    } catch (e) {
      console.warn('Could not sync with Turso DB, working offline:', e);
      set({ isDbConnected: false, isSyncing: false });
    }
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

    if (get().cloudSyncEnabled) {
      insertNoteToDB(newNote).catch(console.error);
    }
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

    if (get().cloudSyncEnabled) {
      updateNoteInDB(id, updates).catch(console.error);
    }
  },

  deleteNote: (id) => {
    set((state) => {
      const updated = state.notes.filter((n) => n.id !== id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return { notes: updated, showNoteModal: false, editingNote: null };
    });

    if (get().cloudSyncEnabled) {
      deleteNoteFromDB(id).catch(console.error);
    }
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

    if (get().cloudSyncEnabled) {
      insertNoteToDB(dup).catch(console.error);
    }
  },

  toggleChecklistItem: (noteId, itemId) => {
    let updatedChecklist: ChecklistItem[] | undefined = undefined;
    const updated = get().notes.map((note) => {
      if (note.id !== noteId || !note.checklist) return note;
      const newChecklist = note.checklist.map((item, idx) =>
        String(item.id) === String(itemId) || String(idx) === String(itemId)
          ? { ...item, completed: !item.completed }
          : item
      );
      updatedChecklist = newChecklist;
      // Do not update updatedAt here so the card stays stably in its position on the board
      return { ...note, checklist: newChecklist };
    });
    set({ notes: updated });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    if (updatedChecklist && get().cloudSyncEnabled) {
      updateNoteInDB(noteId, { checklist: updatedChecklist }).catch(console.error);
    }
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
    if (get().cloudSyncEnabled) {
      updateNoteInDB(id, { isStarred, updatedAt: now }).catch(console.error);
    }
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
    if (get().cloudSyncEnabled) {
      updateNoteInDB(id, { isPinned, updatedAt: now }).catch(console.error);
    }
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

    if (get().cloudSyncEnabled) {
      insertDiaryEntryToDB(newEntry).catch(console.error);
    }
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

    if (get().cloudSyncEnabled && targetEntry) {
      insertDiaryEntryToDB(targetEntry).catch(console.error);
    }
  },

  deleteDiaryEntry: (id) => {
    set((state) => {
      const updated = state.diaryEntries.filter((e) => e.id !== id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updated));
      }
      return { diaryEntries: updated };
    });

    if (get().cloudSyncEnabled) {
      deleteDiaryEntryFromDB(id).catch(console.error);
    }
  },

  resetToDefault: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ notes: INITIAL_NOTES_VI });
    if (get().cloudSyncEnabled) {
      initDatabase(INITIAL_NOTES_VI).catch(console.error);
    }
  },
}));
