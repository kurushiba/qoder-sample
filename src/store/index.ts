import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AppState, 
  Board, 
  List, 
  Card, 
  CreateBoardData, 
  CreateListData, 
  CreateCardData,
  UpdateBoardData,
  UpdateListData,
  UpdateCardData
} from '../types';
import { StorageService } from '../services/storage';
import { generateId, reorder } from '../utils';

interface AppActions {
  // Board actions
  loadBoards: () => Promise<void>;
  createBoard: (data: CreateBoardData) => Promise<void>;
  updateBoard: (id: string, data: UpdateBoardData) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setCurrentBoard: (boardId: string | null) => void;

  // List actions
  loadLists: (boardId: string) => Promise<void>;
  createList: (data: CreateListData) => Promise<void>;
  updateList: (id: string, data: UpdateListData) => Promise<void>;
  deleteList: (id: string, boardId: string) => Promise<void>;
  reorderLists: (boardId: string, startIndex: number, endIndex: number) => Promise<void>;

  // Card actions
  loadCards: (listId: string) => Promise<void>;
  createCard: (data: CreateCardData) => Promise<void>;
  updateCard: (id: string, data: UpdateCardData) => Promise<void>;
  deleteCard: (id: string, listId: string) => Promise<void>;
  moveCard: (cardId: string, sourceListId: string, destListId: string, destIndex: number) => Promise<void>;
  reorderCards: (listId: string, startIndex: number, endIndex: number) => Promise<void>;

  // UI actions
  setDragState: (state: Partial<AppState['dragState']>) => void;
  setModal: (modal: Partial<AppState['modal']>) => void;
  setLoading: (loading: Partial<AppState['loading']>) => void;
  setError: (error: string | null) => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      boards: [],
      lists: {},
      cards: {},
      currentBoard: null,
      dragState: {
        activeId: null,
        activeType: null,
        overId: null,
      },
      modal: {
        isOpen: false,
        type: null,
        data: undefined,
      },
      loading: {
        boards: false,
        saving: false,
        error: null,
      },

      // Board actions
      loadBoards: async () => {
        set({ loading: { ...get().loading, boards: true, error: null } });
        try {
          const boards = await StorageService.loadBoards();
          set({ boards, loading: { ...get().loading, boards: false } });
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              boards: false, 
              error: error instanceof Error ? error.message : 'Failed to load boards' 
            } 
          });
        }
      },

      createBoard: async (data: CreateBoardData) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          const board: Board = {
            ...data,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await StorageService.saveBoard(board);
          
          set(state => ({
            boards: [...state.boards, board],
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to create board' 
            } 
          });
        }
      },

      updateBoard: async (id: string, data: UpdateBoardData) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          const state = get();
          const existingBoard = state.boards.find(b => b.id === id);
          if (!existingBoard) throw new Error('Board not found');

          const updatedBoard: Board = {
            ...existingBoard,
            ...data,
            updatedAt: new Date(),
          };

          await StorageService.saveBoard(updatedBoard);

          set(state => ({
            boards: state.boards.map(b => b.id === id ? updatedBoard : b),
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to update board' 
            } 
          });
        }
      },

      deleteBoard: async (id: string) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          await StorageService.deleteBoard(id);
          
          set(state => ({
            boards: state.boards.filter(b => b.id !== id),
            lists: { ...state.lists, [id]: undefined },
            currentBoard: state.currentBoard === id ? null : state.currentBoard,
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to delete board' 
            } 
          });
        }
      },

      setCurrentBoard: (boardId: string | null) => {
        set({ currentBoard: boardId });
      },

      // List actions
      loadLists: async (boardId: string) => {
        try {
          const allLists = await StorageService.loadLists();
          const boardLists = allLists[boardId] || [];
          
          set(state => ({
            lists: { ...state.lists, [boardId]: boardLists },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              error: error instanceof Error ? error.message : 'Failed to load lists' 
            } 
          });
        }
      },

      createList: async (data: CreateListData) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          const state = get();
          const boardLists = state.lists[data.boardId] || [];
          
          const list: List = {
            ...data,
            id: generateId(),
            position: boardLists.length,
            createdAt: new Date(),
          };

          await StorageService.saveList(list);

          set(state => ({
            lists: {
              ...state.lists,
              [data.boardId]: [...(state.lists[data.boardId] || []), list],
            },
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to create list' 
            } 
          });
        }
      },

      updateList: async (id: string, data: UpdateListData) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          const state = get();
          let updatedList: List | null = null;
          let boardId: string | null = null;

          // Find the list and its board
          Object.entries(state.lists).forEach(([bId, lists]) => {
            const list = lists.find(l => l.id === id);
            if (list) {
              updatedList = { ...list, ...data };
              boardId = bId;
            }
          });

          if (!updatedList || !boardId) throw new Error('List not found');

          await StorageService.saveList(updatedList);

          set(state => ({
            lists: {
              ...state.lists,
              [boardId!]: state.lists[boardId!].map(l => l.id === id ? updatedList! : l),
            },
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to update list' 
            } 
          });
        }
      },

      deleteList: async (id: string, boardId: string) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          await StorageService.deleteList(id, boardId);

          set(state => ({
            lists: {
              ...state.lists,
              [boardId]: state.lists[boardId]?.filter(l => l.id !== id) || [],
            },
            cards: { ...state.cards, [id]: undefined },
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to delete list' 
            } 
          });
        }
      },

      reorderLists: async (boardId: string, startIndex: number, endIndex: number) => {
        try {
          const state = get();
          const lists = state.lists[boardId] || [];
          const reorderedLists = reorder(lists, startIndex, endIndex);
          
          // Update positions
          const updatedLists = reorderedLists.map((list, index) => ({
            ...list,
            position: index,
          }));

          await StorageService.updateListPositions(boardId, updatedLists);

          set(state => ({
            lists: { ...state.lists, [boardId]: updatedLists },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              error: error instanceof Error ? error.message : 'Failed to reorder lists' 
            } 
          });
        }
      },

      // Card actions
      loadCards: async (listId: string) => {
        try {
          const allCards = await StorageService.loadCards();
          const listCards = allCards[listId] || [];

          set(state => ({
            cards: { ...state.cards, [listId]: listCards },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              error: error instanceof Error ? error.message : 'Failed to load cards' 
            } 
          });
        }
      },

      createCard: async (data: CreateCardData) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          const state = get();
          const listCards = state.cards[data.listId] || [];

          const card: Card = {
            ...data,
            id: generateId(),
            position: listCards.length,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await StorageService.saveCard(card);

          set(state => ({
            cards: {
              ...state.cards,
              [data.listId]: [...(state.cards[data.listId] || []), card],
            },
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to create card' 
            } 
          });
        }
      },

      updateCard: async (id: string, data: UpdateCardData) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          const state = get();
          let updatedCard: Card | null = null;
          let listId: string | null = null;

          // Find the card and its list
          Object.entries(state.cards).forEach(([lId, cards]) => {
            const card = cards.find(c => c.id === id);
            if (card) {
              updatedCard = { ...card, ...data, updatedAt: new Date() };
              listId = lId;
            }
          });

          if (!updatedCard || !listId) throw new Error('Card not found');

          await StorageService.saveCard(updatedCard);

          set(state => ({
            cards: {
              ...state.cards,
              [listId!]: state.cards[listId!].map(c => c.id === id ? updatedCard! : c),
            },
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to update card' 
            } 
          });
        }
      },

      deleteCard: async (id: string, listId: string) => {
        set({ loading: { ...get().loading, saving: true, error: null } });
        try {
          await StorageService.deleteCard(id, listId);

          set(state => ({
            cards: {
              ...state.cards,
              [listId]: state.cards[listId]?.filter(c => c.id !== id) || [],
            },
            loading: { ...state.loading, saving: false },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              saving: false, 
              error: error instanceof Error ? error.message : 'Failed to delete card' 
            } 
          });
        }
      },

      moveCard: async (cardId: string, sourceListId: string, destListId: string, destIndex: number) => {
        try {
          const state = get();
          const sourceCards = state.cards[sourceListId] || [];
          const destCards = state.cards[destListId] || [];
          
          const cardToMove = sourceCards.find(c => c.id === cardId);
          if (!cardToMove) throw new Error('Card not found');

          // Remove from source
          const newSourceCards = sourceCards.filter(c => c.id !== cardId);
          
          // Add to destination
          const updatedCard = { ...cardToMove, listId: destListId, updatedAt: new Date() };
          const newDestCards = [...destCards];
          newDestCards.splice(destIndex, 0, updatedCard);

          // Update positions
          const updatedSourceCards = newSourceCards.map((card, index) => ({
            ...card,
            position: index,
          }));

          const updatedDestCards = newDestCards.map((card, index) => ({
            ...card,
            position: index,
          }));

          // Save to storage
          await Promise.all([
            StorageService.updateCardPositions(sourceListId, updatedSourceCards),
            StorageService.updateCardPositions(destListId, updatedDestCards),
          ]);

          set(state => ({
            cards: {
              ...state.cards,
              [sourceListId]: updatedSourceCards,
              [destListId]: updatedDestCards,
            },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              error: error instanceof Error ? error.message : 'Failed to move card' 
            } 
          });
        }
      },

      reorderCards: async (listId: string, startIndex: number, endIndex: number) => {
        try {
          const state = get();
          const cards = state.cards[listId] || [];
          const reorderedCards = reorder(cards, startIndex, endIndex);
          
          // Update positions
          const updatedCards = reorderedCards.map((card, index) => ({
            ...card,
            position: index,
          }));

          await StorageService.updateCardPositions(listId, updatedCards);

          set(state => ({
            cards: { ...state.cards, [listId]: updatedCards },
          }));
        } catch (error) {
          set({ 
            loading: { 
              ...get().loading, 
              error: error instanceof Error ? error.message : 'Failed to reorder cards' 
            } 
          });
        }
      },

      // UI actions
      setDragState: (dragState: Partial<AppState['dragState']>) => {
        set(state => ({
          dragState: { ...state.dragState, ...dragState },
        }));
      },

      setModal: (modal: Partial<AppState['modal']>) => {
        set(state => ({
          modal: { ...state.modal, ...modal },
        }));
      },

      setLoading: (loading: Partial<AppState['loading']>) => {
        set(state => ({
          loading: { ...state.loading, ...loading },
        }));
      },

      setError: (error: string | null) => {
        set(state => ({
          loading: { ...state.loading, error },
        }));
      },
    }),
    {
      name: 'trello-store',
    }
  )
);