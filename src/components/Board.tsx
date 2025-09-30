import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppStore } from '../store';
import { CreateListData } from '../types';
import List from './list/List';
import LoadingSpinner from './common/LoadingSpinner';

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  const {
    boards,
    lists,
    cards,
    loadBoards,
    loadLists,
    loadCards,
    createList,
    reorderLists,
    moveCard,
    reorderCards,
    setCurrentBoard,
    loading
  } = useAppStore();

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const currentBoard = boards.find(board => board.id === boardId);
  const boardLists = lists[boardId!] || [];
  const sortedLists = [...boardLists].sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (!boardId) return;

    const initializeBoard = async () => {
      setCurrentBoard(boardId);
      
      // Load boards if not already loaded
      if (boards.length === 0) {
        await loadBoards();
      }
      
      // Load lists for this board
      await loadLists(boardId);
      
      // Load cards for each list
      const boardLists = lists[boardId] || [];
      await Promise.all(
        boardLists.map(list => loadCards(list.id))
      );
    };

    initializeBoard();
  }, [boardId, loadBoards, loadLists, loadCards, setCurrentBoard, boards.length, lists]);

  // Handle drag end for both lists and cards
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    
    if (activeType === 'list') {
      // Handle list reordering
      const oldIndex = sortedLists.findIndex(list => list.id === active.id);
      const newIndex = sortedLists.findIndex(list => list.id === over.id);
      
      if (oldIndex !== newIndex) {
        await reorderLists(boardId!, oldIndex, newIndex);
      }
    } else if (activeType === 'card') {
      // Handle card movement
      const activeListId = active.data.current?.listId;
      const overListId = over.data.current?.listId || over.id;
      
      if (activeListId === overListId) {
        // Reordering within same list
        const listCards = cards[activeListId] || [];
        const oldIndex = listCards.findIndex(card => card.id === active.id);
        const newIndex = listCards.findIndex(card => card.id === over.id);
        
        if (oldIndex !== newIndex) {
          await reorderCards(activeListId, oldIndex, newIndex);
        }
      } else {
        // Moving between lists
        const sourceCards = cards[activeListId] || [];
        const destCards = cards[overListId] || [];
        const sourceIndex = sourceCards.findIndex(card => card.id === active.id);
        
        let destIndex = destCards.length;
        if (over.data.current?.type === 'card') {
          destIndex = destCards.findIndex(card => card.id === over.id);
        }
        
        await moveCard(active.id as string, activeListId, overListId as string, destIndex);
      }
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !boardId) return;

    const listData: CreateListData = {
      title: newListTitle.trim(),
      boardId
    };

    await createList(listData);
    setNewListTitle('');
    setIsCreatingList(false);
  };

  const handleCancelCreateList = () => {
    setNewListTitle('');
    setIsCreatingList(false);
  };

  if (loading.boards) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Board not found</h1>
          <p className="text-gray-600 mb-8">The board you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Go Back to Boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1"
                title="Back to boards"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded board-color-${currentBoard.color}`} />
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentBoard.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {sortedLists.length} {sortedLists.length === 1 ? 'list' : 'lists'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Board Content */}
      <main className="h-full overflow-x-auto">
        <div className="flex p-4 space-x-4 min-h-full">
          <SortableContext 
            items={sortedLists.map(list => list.id)} 
            strategy={horizontalListSortingStrategy}
          >
            {sortedLists.map((list) => (
              <List 
                key={list.id} 
                list={list} 
                cards={cards[list.id] || []}
              />
            ))}
          </SortableContext>

          {/* Create List */}
          <div className="flex-shrink-0">
            {isCreatingList ? (
              <div className="w-72 bg-gray-100 rounded-lg p-3">
                <form onSubmit={handleCreateList}>
                  <input
                    type="text"
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    autoFocus
                    maxLength={100}
                  />
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      type="submit"
                      disabled={!newListTitle.trim() || loading.saving}
                      className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.saving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-1" />
                          Adding...
                        </>
                      ) : (
                        'Add List'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCreateList}
                      className="btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingList(true)}
                className="w-72 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg p-3 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add another list</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Board;