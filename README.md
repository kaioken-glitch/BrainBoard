# 🧠 BrainBoard - Personal Productivity Dashboard

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, AI-enhanced productivity dashboard that helps you manage tasks, track learning progress, and stay motivated with intelligent reminders and insights.

## 🌟 Features

### 📱 **Responsive Design**
- **Mobile-First Approach**: Optimized for touchscreen devices and mobile interfaces
- **Adaptive Headers**: Automatic switching between desktop and mobile layouts
- **Touch-Optimized Scrolling**: Native touch gestures for smooth interaction

### 🤖 **AI Assistant Integration**
- **Smart Reminders**: Automated morning motivational messages (7-10 AM)
- **Personalized Content**: AI-generated motivational quotes and productivity tips
- **Intelligent Scheduling**: Context-aware reminder delivery system

### ✅ **Task Management**
- **Today's Focus**: Dedicated area for your primary daily objective
- **Weekly Learning Path**: Horizontal scrolling cards for week-long goals
- **Progress Tracking**: Visual progress indicators and completion status
- **Real-time Updates**: Instant synchronization across all components

### 🔔 **Notification System**
- **Bell Notifications**: System alerts and updates
- **AI Messages**: Personal assistant communications with special styling
- **Real-time Refresh**: Live data updates with smooth animations

### 🎨 **Modern UI/UX**
- **Glass Morphism**: Beautiful frosted glass effects and gradients
- **Smooth Animations**: CSS transitions and hover effects
- **Custom Icons**: Font Awesome integration with custom styling
- **Color-Coded Status**: Visual status indicators for different task states

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/brainboard.git
   cd brainboard
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Setup**
   
   **Backend** (`.env` in Backend folder):
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000,http://localhost:5173
   ```
   
   **Frontend** (`.env` in Frontend folder):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

5. **Start Development Servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd Backend
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 🏗️ Architecture

### Frontend Architecture
```
Frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.jsx     # Main layout container
│   │   ├── Header.jsx        # Desktop navigation header
│   │   ├── HeaderMobile.jsx  # Mobile navigation header
│   │   ├── FocusCard.jsx     # Today's focus & weekly tasks
│   │   └── StatsCard.jsx     # Statistics and metrics
│   ├── context/          # React Context for state management
│   │   └── DataContext.jsx   # Centralized API state
│   ├── hooks/            # Custom React hooks
│   │   └── useResponsiveHeader.js  # Responsive header logic
│   ├── services/         # API communication
│   │   └── apiService.js     # HTTP client service
│   ├── styles/           # CSS styling
│   │   └── components.css    # Component-specific styles
│   └── assets/           # Images and static files
├── .env                  # Environment configuration
└── package.json         # Dependencies and scripts
```

### Backend Architecture
```
Backend/
├── server.js            # Express server and API routes
├── data.json           # JSON file database (development)
├── utils.js            # Utility functions
├── .env               # Environment configuration
└── package.json       # Dependencies and scripts
```

## 📱 Component Breakdown

### Core Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Dashboard` | Main container | Responsive grid layout, component orchestration |
| `Header` | Desktop navigation | Search, notifications, AI messages, task creation |
| `HeaderMobile` | Mobile navigation | Touch-optimized, compact design |
| `FocusCard` | Task management | Today's focus, weekly learning path, progress tracking |
| `StatsCard` | Analytics | Task statistics, completion rates, progress metrics |

### Context & State Management

| Context | Responsibility | Data Managed |
|---------|---------------|--------------|
| `DataContext` | Centralized state | Tasks, notifications, messages, loading states |
| `useResponsiveHeader` | Device detection | Screen size, header component selection |

### API Services

| Service | Endpoint | Functionality |
|---------|----------|---------------|
| Tasks API | `/api/tasks` | CRUD operations for tasks |
| Notifications API | `/api/notifications` | System notifications management |
| Messages API | `/api/messages` | AI assistant messages |
| Search API | `/api/search` | Global content search |

## 🎯 Key Features Deep Dive

### 1. **Responsive Header System**
```javascript
// Automatic header switching based on screen size
const useResponsiveHeader = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // Returns appropriate header component
};
```

### 2. **AI Assistant Integration**
```javascript
// Automated morning reminders
const generateAIMessage = () => {
  const motivationalQuotes = [
    "Every expert was once a beginner! 🌟",
    "Progress, not perfection! Keep moving forward! 💪"
  ];
  // Returns personalized motivational content
};
```

### 3. **Touch-Optimized Scrolling**
```css
/* Mobile-first scrolling optimization */
.weekTopicsGrid {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
  touch-action: pan-x !important;
}
```

## 🚀 Deployment

### Render.com Deployment

1. **Backend Deployment**
   - Create new Web Service on Render
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

2. **Frontend Deployment**
   - Create new Static Site on Render
   - Set build command: `npm install && npm run build`
   - Set publish directory: `dist`
   - Update API endpoints

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
```

### Code Style & Conventions

- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes with custom CSS
- **State Management**: React Context API
- **API Communication**: Async/await with error handling
- **File Naming**: PascalCase for components, camelCase for utilities

## 🔧 Customization

### Adding New Features

1. **New Task Types**: Extend task schema in `data.json`
2. **Custom AI Messages**: Modify message arrays in `server.js`
3. **Additional Notifications**: Use `addNotification` API
4. **UI Themes**: Customize CSS variables in `components.css`

### Configuration Options

- **AI Reminder Timing**: Modify schedule in `checkAndSendAIReminders()`
- **Mobile Breakpoints**: Update responsive queries in CSS
- **API Endpoints**: Configure in environment variables

## 🐛 Troubleshooting

### Common Issues

1. **Touch Scrolling Not Working**
   - Ensure `touch-action: pan-x` is applied
   - Check mobile CSS breakpoints

2. **Notifications Not Appearing**
   - Verify API endpoints are accessible
   - Check DataContext refresh functionality

3. **Mobile Layout Issues**
   - Validate responsive CSS rules
   - Test on different screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for utility-first styling
- **Font Awesome** for beautiful icons
- **Express.js** for robust backend framework

## 📞 Support

- Create an issue for bug reports
- Star the repository if you find it helpful
- Follow for updates and new features

---

**Built with ❤️ for productivity enthusiasts and lifelong learners**
