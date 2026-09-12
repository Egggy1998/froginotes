export type NoteType = 'text' | 'checklist' | 'bullets' | 'photo';

export type NoteColor =
  | 'yellow'
  | 'mint'
  | 'peach'
  | 'lime'
  | 'blush'
  | 'photo'
  | 'pink'
  | 'blue'
  | 'butter';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoteChip {
  icon: 'clock' | 'calendar';
  text: string;
}

export type MascotMood =
  | 'happy'
  | 'wink'
  | 'sleepy'
  | 'sparkle'
  | 'thinking'
  | 'surprised'
  | 'love'
  | 'confident'
  | 'bunny'
  | 'smart'
  | 'music'
  | 'party'
  | 'crown'
  | 'sleepcap';

export type TapeStyle = 'mint' | 'pink' | 'yellow' | 'checkered' | 'scotch';
export type TapePosition = 'center' | 'corners' | 'tilted';

export interface Note {
  id: string;
  title: string;
  content?: string;
  type: NoteType;
  color: NoteColor;
  icon?: 'pin' | 'leaf' | 'bell' | 'lightbulb' | 'cart' | 'plane' | 'heart' | 'none';
  iconBg?: string;
  iconColor?: string;
  chip?: NoteChip;
  checklist?: ChecklistItem[];
  bullets?: string[];
  doodle?: 'sun' | 'frog-mint' | 'sprout' | 'photo-daisy' | 'frog-tea' | 'cloud' | 'frog-paws' | 'none';
  mascot?: MascotMood;
  photoUrl?: string;
  tapeStyle?: TapeStyle;
  tapePosition?: TapePosition;
  /** Decor pack asset ID applied to the tape (optional; overrides tapeStyle CSS class when set) */
  decorAssetId?: string;
  folderId: string;
  isPinned?: boolean;
  isStarred?: boolean;
  isToday?: boolean;
  hasReminder?: boolean;
  isArchived?: boolean;
  isTrash?: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NavSection = 'notes' | 'today' | 'starred' | 'reminders' | 'calendar' | 'diary' | 'archive' | 'trash';

export type DiaryWeather = 'sunny' | 'cloudy' | 'rainy' | 'cozy';

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MascotMood;
  weather?: DiaryWeather;
  title?: string;
  content: string;
  photoUrl?: string;
  tapeStyle?: TapeStyle;
  tapePosition?: TapePosition;
  createdAt: string;
  updatedAt: string;
}

export type FolderId = 'personal' | 'work' | 'ideas' | 'health' | 'travel';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  avatar?: string;
  syncKey?: string;
  createdAt: string;
}

export interface Folder {
  id: FolderId;
  name: string;
  color: string;
  count: number;
}
