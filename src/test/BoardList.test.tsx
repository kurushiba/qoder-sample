import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAppStore } from '../../store';
import BoardList from '../../components/BoardList';

// Mock the store
const mockStore = {
  boards: [],
  loading: { boards: false, saving: false, error: null },
  loadBoards: vi.fn(),
  createBoard: vi.fn(),
  deleteBoard: vi.fn(),
  modal: { isOpen: false, type: null },
  setModal: vi.fn(),
};

vi.mock('../../store', () => ({
  useAppStore: () => mockStore
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BoardList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.boards = [];
    mockStore.loading = { boards: false, saving: false, error: null };
    mockStore.modal = { isOpen: false, type: null };
  });

  it('renders the header with title and create button', () => {
    renderWithRouter(<BoardList />);
    
    expect(screen.getByText('Trello Clone')).toBeInTheDocument();
    expect(screen.getByText('Create Board')).toBeInTheDocument();
  });

  it('shows loading state when boards are loading', () => {
    mockStore.loading.boards = true;
    renderWithRouter(<BoardList />);
    
    expect(screen.getByText('Loading boards...')).toBeInTheDocument();
  });

  it('shows empty state when no boards exist', () => {
    renderWithRouter(<BoardList />);
    
    expect(screen.getByText('No boards yet')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first board')).toBeInTheDocument();
  });

  it('displays boards when they exist', () => {
    mockStore.boards = [
      {
        id: '1',
        title: 'Test Board',
        description: 'Test Description',
        color: 'blue',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      }
    ];

    renderWithRouter(<BoardList />);
    
    expect(screen.getByText('Test Board')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Your Boards (1)')).toBeInTheDocument();
  });

  it('calls loadBoards on mount', () => {
    renderWithRouter(<BoardList />);
    expect(mockStore.loadBoards).toHaveBeenCalledTimes(1);
  });

  it('opens create modal when create button is clicked', () => {
    renderWithRouter(<BoardList />);
    
    const createButton = screen.getByText('Create Board');
    fireEvent.click(createButton);
    
    expect(mockStore.setModal).toHaveBeenCalledWith({
      isOpen: true,
      type: 'createBoard'
    });
  });
});