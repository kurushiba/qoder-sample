import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { CreateBoardData } from '../types';
import Modal from './common/Modal';
import LoadingSpinner from './common/LoadingSpinner';

const BOARD_COLORS = [
  'blue', 'green', 'red', 'purple', 'indigo', 'pink', 'orange', 'gray'
];

const BoardList: React.FC = () => {
  const { 
    boards, 
    loading, 
    loadBoards, 
    createBoard, 
    deleteBoard,
    modal,
    setModal 
  } = useAppStore();

  const [formData, setFormData] = useState<CreateBoardData>({
    title: '',
    description: '',
    color: 'blue'
  });

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await createBoard(formData);
    setFormData({ title: '', description: '', color: 'blue' });
    setModal({ isOpen: false, type: null });
  };

  const handleDeleteBoard = async (boardId: string, boardTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${boardTitle}"? This action cannot be undone.`)) {
      await deleteBoard(boardId);
    }
  };

  const openCreateModal = () => {
    setModal({ isOpen: true, type: 'createBoard' });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null });
    setFormData({ title: '', description: '', color: 'blue' });
  };

  if (loading.boards) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Trello Clone
              </h1>
            </div>
            <button
              onClick={openCreateModal}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Board
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {boards.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No boards yet</h2>
            <p className="text-gray-600 mb-6">Get started by creating your first board</p>
            <button
              onClick={openCreateModal}
              className="btn-primary"
            >
              Create Your First Board
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Your Boards ({boards.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="group relative bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden"
                >
                  <Link 
                    to={`/board/${board.id}`}
                    className="block"
                  >
                    <div className={`h-32 board-color-${board.color} relative`}>
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-200" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg text-shadow truncate">
                          {board.title}
                        </h3>
                        {board.description && (
                          <p className="text-white text-sm text-shadow truncate mt-1 opacity-90">
                            {board.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Created {new Date(board.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteBoard(board.id, board.title);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete board"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      <Modal
        isOpen={modal.isOpen && modal.type === 'createBoard'}
        onClose={closeModal}
        title="Create New Board"
      >
        <form onSubmit={handleCreateBoard} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Board Title *
            </label>
            <input
              type="text"
              id="title"
              className="input"
              placeholder="Enter board title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              className="textarea"
              placeholder="Enter board description (optional)"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board Color
            </label>
            <div className="flex flex-wrap gap-2">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-lg board-color-${color} ring-2 ring-offset-2 transition-all duration-200 ${
                    formData.color === color 
                      ? 'ring-gray-800 scale-110' 
                      : 'ring-transparent hover:ring-gray-400'
                  }`}
                  onClick={() => setFormData({ ...formData, color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || loading.saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Board'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BoardList;