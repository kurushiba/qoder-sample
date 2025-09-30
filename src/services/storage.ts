import { Board, List, Card } from '../types';

const STORAGE_KEYS = {
  BOARDS: 'trello_boards',
  LISTS: 'trello_lists',
  CARDS: 'trello_cards',
} as const;

export class StorageService {
  private static isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private static getData<T>(key: string, defaultValue: T): T {
    if (!this.isStorageAvailable()) {
      console.warn('LocalStorage is not available');
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        })) as T;
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  }

  private static setData<T>(key: string, data: T): void {
    if (!this.isStorageAvailable()) {
      console.warn('LocalStorage is not available');
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}:`, error);
    }
  }

  // Board operations
  static async loadBoards(): Promise<Board[]> {
    return this.getData<Board[]>(STORAGE_KEYS.BOARDS, []);
  }

  static async saveBoard(board: Board): Promise<void> {
    const boards = await this.loadBoards();
    const existingIndex = boards.findIndex(b => b.id === board.id);
    
    if (existingIndex >= 0) {
      boards[existingIndex] = board;
    } else {
      boards.push(board);
    }
    
    this.setData(STORAGE_KEYS.BOARDS, boards);
  }

  static async deleteBoard(boardId: string): Promise<void> {
    const boards = await this.loadBoards();
    const filteredBoards = boards.filter(b => b.id !== boardId);
    this.setData(STORAGE_KEYS.BOARDS, filteredBoards);
    
    // Also delete associated lists and cards
    await this.deleteBoardData(boardId);
  }

  // List operations
  static async loadLists(): Promise<Record<string, List[]>> {
    return this.getData<Record<string, List[]>>(STORAGE_KEYS.LISTS, {});
  }

  static async saveList(list: List): Promise<void> {
    const listsData = await this.loadLists();
    const boardLists = listsData[list.boardId] || [];
    const existingIndex = boardLists.findIndex(l => l.id === list.id);
    
    if (existingIndex >= 0) {
      boardLists[existingIndex] = list;
    } else {
      boardLists.push(list);
    }
    
    listsData[list.boardId] = boardLists;
    this.setData(STORAGE_KEYS.LISTS, listsData);
  }

  static async deleteList(listId: string, boardId: string): Promise<void> {
    const listsData = await this.loadLists();
    const boardLists = listsData[boardId] || [];
    const filteredLists = boardLists.filter(l => l.id !== listId);
    
    if (filteredLists.length === 0) {
      delete listsData[boardId];
    } else {
      listsData[boardId] = filteredLists;
    }
    
    this.setData(STORAGE_KEYS.LISTS, listsData);
    
    // Also delete associated cards
    await this.deleteListCards(listId);
  }

  // Card operations
  static async loadCards(): Promise<Record<string, Card[]>> {
    return this.getData<Record<string, Card[]>>(STORAGE_KEYS.CARDS, {});
  }

  static async saveCard(card: Card): Promise<void> {
    const cardsData = await this.loadCards();
    const listCards = cardsData[card.listId] || [];
    const existingIndex = listCards.findIndex(c => c.id === card.id);
    
    if (existingIndex >= 0) {
      listCards[existingIndex] = card;
    } else {
      listCards.push(card);
    }
    
    cardsData[card.listId] = listCards;
    this.setData(STORAGE_KEYS.CARDS, cardsData);
  }

  static async deleteCard(cardId: string, listId: string): Promise<void> {
    const cardsData = await this.loadCards();
    const listCards = cardsData[listId] || [];
    const filteredCards = listCards.filter(c => c.id !== cardId);
    
    if (filteredCards.length === 0) {
      delete cardsData[listId];
    } else {
      cardsData[listId] = filteredCards;
    }
    
    this.setData(STORAGE_KEYS.CARDS, cardsData);
  }

  // Utility operations
  private static async deleteBoardData(boardId: string): Promise<void> {
    const listsData = await this.loadLists();
    const cardsData = await this.loadCards();
    
    // Delete all lists for this board
    delete listsData[boardId];
    this.setData(STORAGE_KEYS.LISTS, listsData);
    
    // Delete all cards for lists in this board
    const boardLists = listsData[boardId] || [];
    boardLists.forEach(list => {
      delete cardsData[list.id];
    });
    this.setData(STORAGE_KEYS.CARDS, cardsData);
  }

  private static async deleteListCards(listId: string): Promise<void> {
    const cardsData = await this.loadCards();
    delete cardsData[listId];
    this.setData(STORAGE_KEYS.CARDS, cardsData);
  }

  // Bulk operations for drag and drop
  static async updateListPositions(boardId: string, lists: List[]): Promise<void> {
    const listsData = await this.loadLists();
    listsData[boardId] = lists;
    this.setData(STORAGE_KEYS.LISTS, listsData);
  }

  static async updateCardPositions(listId: string, cards: Card[]): Promise<void> {
    const cardsData = await this.loadCards();
    cardsData[listId] = cards;
    this.setData(STORAGE_KEYS.CARDS, cardsData);
  }

  // Clear all data (for testing/development)
  static async clearAllData(): Promise<void> {
    if (!this.isStorageAvailable()) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}