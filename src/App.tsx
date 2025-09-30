import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useAppStore } from './store';
import BoardList from './components/BoardList';
import Board from './components/Board';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';

function App() {
  const { setDragState, loading } = useAppStore();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeType = active.data.current?.type || null;
    
    setDragState({
      activeId: active.id as string,
      activeType,
      overId: null,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setDragState({
      overId: over?.id as string || null,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragState({
        activeId: null,
        activeType: null,
        overId: null,
      });
      return;
    }

    // This will be handled by the specific drag handlers in components
    setDragState({
      activeId: null,
      activeType: null,
      overId: null,
    });
  };

  return (
    <ErrorBoundary>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<BoardList />} />
              <Route path="/board/:boardId" element={<Board />} />
              <Route 
                path="*" 
                element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Page not found</p>
                      <a href="/" className="btn-primary">
                        Go Home
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </div>
        </Router>
        
        {/* Global error toast */}
        {loading.error && (
          <Toast
            message={loading.error}
            type="error"
            onClose={() => useAppStore.getState().setError(null)}
          />
        )}
      </DndContext>
    </ErrorBoundary>
  );
}

export default App;