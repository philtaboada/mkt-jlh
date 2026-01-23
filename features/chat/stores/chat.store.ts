import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type FilterType = 'all' | 'open' | 'pending' | 'resolved' | 'snoozed';
type SortType = 'newest' | 'oldest' | 'unread_first';
type ChannelFilter = 'all' | string;

interface ChatFilters {
  status: FilterType;
  channel: ChannelFilter;
  sortBy: SortType;
  searchQuery: string;
  pageIndex?: number;
  pageSize?: number;
}

interface ChatUIState {
  activeConversationId: string | null;
  filters: ChatFilters;
  activeChannels: any[];
  soundEnabled: boolean;

  setActiveConversationId: (id: string | null) => void;
  setFilters: (filters: Partial<ChatFilters>) => void;
  setActiveChannels: (channels: any[]) => void;
  toggleSound: () => void;
}

export const useChatStore = create<ChatUIState>()(
  devtools(
    (set) => ({
      activeConversationId: null,

      filters: {
        status: 'all',
        channel: 'all',
        sortBy: 'newest',
        searchQuery: '',
      },

      activeChannels: [],
      soundEnabled: true,

      setActiveConversationId: (id) => set({ activeConversationId: id }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setActiveChannels: (channels) => set({ activeChannels: channels }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    { name: 'chat-ui-store' }
  )
);
