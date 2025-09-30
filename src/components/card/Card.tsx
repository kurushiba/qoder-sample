import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, UpdateCardData } from '../../types';
import { useAppStore } from '../../store';
import { formatDate, truncateText } from '../../utils';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

interface CardProps {
  card: CardType;
}

const Card: React.FC<CardProps> = ({ card }) => {
  const { updateCard, deleteCard, loading, modal, setModal } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateCardData>({
    title: card.title,
    description: card.description,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      cardId: card.id,
      listId: card.listId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditCard = () => {
    setIsEditing(true);
    setModal({ 
      isOpen: true, 
      type: 'editCard', 
      data: { cardId: card.id } 
    });
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.title?.trim()) return;

    await updateCard(card.id, {
      title: editData.title.trim(),
      description: editData.description?.trim() || '',
    });

    setIsEditing(false);
    setModal({ isOpen: false, type: null });
  };

  const handleDeleteCard = async () => {
    if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
      await deleteCard(card.id, card.listId);
      setModal({ isOpen: false, type: null });
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      title: card.title,
      description: card.description,
    });
    setIsEditing(false);
    setModal({ isOpen: false, type: null });
  };

  const isModalOpen = modal.isOpen && modal.type === 'editCard' && modal.data?.cardId === card.id;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white rounded-lg shadow-card border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-shadow duration-200 group ${
          isDragging ? 'opacity-50' : ''
        }`}
        onClick={handleEditCard}
      >
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-medium text-gray-900 flex-1 leading-5">
            {truncateText(card.title, 100)}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCard();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 ml-2 flex-shrink-0"
            title="Delete card"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {card.description && (
          <p className="text-xs text-gray-600 mt-2 leading-4">
            {truncateText(card.description, 150)}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>
            {formatDate(card.createdAt)}
          </span>
          {card.description && (
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Edit Card Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title="Edit Card"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCard} className="space-y-4">
          <div>
            <label htmlFor="card-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="card-title"
              className="input"
              placeholder="Enter card title"
              value={editData.title || ''}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              required
              autoFocus
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="card-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="card-description"
              className="textarea"
              placeholder="Enter card description (optional)"
              rows={6}
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {editData.description?.length || 0} / 2000 characters
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Card Information</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Created: {formatDate(card.createdAt)}</div>
              {card.updatedAt && card.updatedAt.getTime() !== card.createdAt.getTime() && (
                <div>Updated: {formatDate(card.updatedAt)}</div>
              )}
              <div>Position: {card.position + 1}</div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDeleteCard}
              className="btn-danger"
            >
              Delete Card
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editData.title?.trim() || loading.saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Card;