# React Trello Clone

A modern, responsive Trello clone built with React, TypeScript, and Tailwind CSS. Features drag-and-drop functionality, local data persistence, and a clean, intuitive interface.

## Features

### 🎯 Core Functionality
- **Board Management**: Create, edit, and delete boards with custom colors
- **List Management**: Add, reorder, and delete lists within boards
- **Card Management**: Create, edit, delete, and move cards between lists
- **Drag & Drop**: Smooth drag-and-drop for both cards and lists
- **Local Storage**: All data persists locally in your browser

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Immediate visual feedback for all actions
- **Keyboard Navigation**: Full accessibility support
- **Error Handling**: Graceful error states and user feedback
- **Loading States**: Clear loading indicators for all async operations

### 🛠 Technical Features
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Modular, reusable component design
- **State Management**: Zustand for efficient global state
- **Modern Routing**: React Router for seamless navigation
- **Testing Ready**: Vitest and React Testing Library setup

## Technology Stack

- **React 18+** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Fast development and optimized production builds
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Powerful drag-and-drop library
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-trello-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Reusable UI components
│   ├── board/           # Board-related components
│   ├── list/            # List-related components
│   └── card/            # Card-related components
├── store/               # Zustand state management
├── services/            # Data services (localStorage)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── test/                # Test files and setup
└── index.css            # Global styles

```

## Key Components

### BoardList
- Displays all user boards in a responsive grid
- Board creation with color selection
- Board deletion with confirmation

### Board
- Individual board view with lists and cards
- Horizontal scrolling for many lists
- Drag-and-drop context for reordering

### List
- Vertical container for cards
- Inline editing for list titles
- Card creation and management

### Card
- Individual task representation
- Click to edit with modal interface
- Drag-and-drop between lists

## State Management

The application uses Zustand for state management with the following structure:

- **Boards**: Array of all user boards
- **Lists**: Organized by board ID
- **Cards**: Organized by list ID
- **UI State**: Modal states, drag states, loading states

## Data Persistence

All data is stored locally using the browser's localStorage API:

- **Automatic Saving**: Changes save immediately
- **Error Handling**: Graceful fallback when storage unavailable
- **Data Migration**: Version management for future updates

## Drag & Drop

Implemented with @dnd-kit for:

- **Card Reordering**: Within the same list
- **Card Movement**: Between different lists
- **List Reordering**: Within the same board
- **Visual Feedback**: Clear drop zones and animations

## Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Enhanced**: Full functionality on desktop
- **Touch Friendly**: Large touch targets and gestures

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode enabled

### Testing
- Vitest for test runner
- React Testing Library for component testing
- jsdom for DOM environment

### Performance
- Code splitting with React.lazy
- Optimized bundle with Vite
- Efficient re-renders with proper memoization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Run tests and linting
6. Submit a pull request

## Future Enhancements

- [ ] User authentication and cloud sync
- [ ] Board collaboration features
- [ ] Card due dates and labels
- [ ] File attachments
- [ ] Activity history
- [ ] Keyboard shortcuts
- [ ] Dark mode theme
- [ ] Export/import functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Trello's excellent user experience
- Built with modern React best practices
- Uses accessibility-first design principles

---

**Built with ❤️ using React and TypeScript**