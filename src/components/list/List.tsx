import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { List as ListType, Card as CardType, CreateCardData } from '../../types';
import { useAppStore } from '../../store';
import Card from '../card/Card';
import LoadingSpinner from '../common/LoadingSpinner';

interface ListProps {
  list: ListType;
  cards: CardType[];
}

const List: React.FC<ListProps> = ({ list, cards }) => {
  const {
    createCard,
    updateList,
    deleteList,
    loading
  } = useAppStore();

  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  // Sortable list setup
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'list',
      listId: list.id,
    },
  });

  // Droppable zone for cards
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      listId: list.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const cardData: CreateCardData = {
      title: newCardTitle.trim(),
      description: '',
      listId: list.id
    };

    await createCard(cardData);
    setNewCardTitle('');
    setIsCreatingCard(false);
  };

  const handleUpdateListTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || editTitle === list.title) {
      setEditTitle(list.title);
      setIsEditingTitle(false);
      return;
    }

    await updateList(list.id, { title: editTitle.trim() });
    setIsEditingTitle(false);
  };

  const handleDeleteList = async () => {
    if (cards.length > 0) {
      if (!window.confirm(`Are you sure you want to delete "${list.title}"? This will also delete all ${cards.length} cards in this list.`)) {
        return;
      }
    } else if (!window.confirm(`Are you sure you want to delete "${list.title}"?`)) {
      return;
    }

    await deleteList(list.id, list.boardId);
  };

  const handleCancelCreateCard = () => {
    setNewCardTitle('');
    setIsCreatingCard(false);
  };

  const handleCancelEditTitle = () => {
    setEditTitle(list.title);
    setIsEditingTitle(false);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`w-72 bg-gray-100 rounded-lg flex flex-col max-h-full ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* List Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing"
      >
        {isEditingTitle ? (
          <form onSubmit={handleUpdateListTitle} className="flex-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleCancelEditTitle}
              className="w-full px-2 py-1 text-sm font-medium bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              autoFocus
              maxLength={100}
            />
          </form>
        ) : (
          <h3
            className="flex-1 text-sm font-medium text-gray-900 truncate cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
            onClick={() => setIsEditingTitle(true)}
            title="Click to edit title"
          >
            {list.title}
          </h3>
        )}

        <div className="flex items-center space-x-1 ml-2">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {cards.length}
          </span>
          <button
            onClick={handleDeleteList}
            className="text-gray-400 hover:text-red-500 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
            title="Delete list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setDroppableRef}
        className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto scrollbar-thin min-h-[100px]"
      >
        <SortableContext
          items={sortedCards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedCards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>

        {/* Create Card Form */}
        {isCreatingCard && (
          <div className="bg-white rounded-lg shadow-card p-3">
            <form onSubmit={handleCreateCard}>
              <textarea
                placeholder="Enter a title for this card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                autoFocus
                maxLength={500}
              />
              <div className="flex items-center space-x-2 mt-3">
                <button
                  type="submit"
                  disabled={!newCardTitle.trim() || loading.saving}
                  className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-1" />
                      Adding...
                    </>
                  ) : (
                    'Add Card'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelCreateCard}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Card Button */}
        {!isCreatingCard && (
          <button
            onClick={() => setIsCreatingCard(true)}
            className="w-full text-left text-gray-600 hover:text-gray-800 hover:bg-gray-200 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">Add a card</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default List;