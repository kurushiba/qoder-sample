export interface Board {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  listId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DragState {
  activeId: string | null;
  activeType: 'card' | 'list' | null;
  overId: string | null;
}

export interface ModalState {
  isOpen: boolean;
  type: 'createBoard' | 'editBoard' | 'createList' | 'editCard' | null;
  data?: any;
}

export interface LoadingState {
  boards: boolean;
  saving: boolean;
  error: string | null;
}

export interface AppState {
  boards: Board[];
  lists: Record<string, List[]>;
  cards: Record<string, Card[]>;
  currentBoard: string | null;
  dragState: DragState;
  modal: ModalState;
  loading: LoadingState;
}

export type CreateBoardData = Omit<Board, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateListData = Omit<List, 'id' | 'createdAt' | 'position'>;
export type CreateCardData = Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'position'>;

export type UpdateBoardData = Partial<Omit<Board, 'id' | 'createdAt'>>;
export type UpdateListData = Partial<Omit<List, 'id' | 'boardId' | 'createdAt'>>;
export type UpdateCardData = Partial<Omit<Card, 'id' | 'listId' | 'createdAt'>>;