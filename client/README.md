# Frontend - React Application

A React frontend application that connects to the Express backend API.

## Features

- ✅ React 18 with functional components and hooks
- ✅ Axios for API communication
- ✅ Health check display with auto-refresh
- ✅ User list management
- ✅ Item list management
- ✅ Responsive design with modern UI
- ✅ Error handling and loading states
- ✅ API service layer

## Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── HealthCheck.js   # Health check component
│   │   ├── UserList.js      # User list component
│   │   └── ItemList.js      # Item list component
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.js               # Main App component
│   ├── App.css              # App styles
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:5000

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

The app will automatically reload when you make changes.

## Available Scripts

### `npm start`
Runs the app in development mode on http://localhost:3000

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

## API Configuration

The frontend connects to the backend at `http://localhost:5000` by default.

To change the API URL, you can:

1. **Set environment variable:**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

2. **Or modify the proxy in package.json:**
   Already configured to proxy API requests to the backend.

## Features Overview

### Health Check Tab
- Displays server health status
- Shows uptime, environment, and database connection
- Auto-refreshes every 30 seconds
- Manual refresh button
- Raw JSON response display

### Users Tab
- Lists all users from the backend
- Shows user details (name, email, age, status, role)
- Refresh functionality
- Empty state with API usage instructions

### Items Tab
- Lists all items from the backend
- Shows item details (title, description, price, quantity, category)
- Stock status indicators
- Tags display
- Refresh functionality
- Empty state with API usage instructions

## API Service

The API service ([src/services/api.js](src/services/api.js)) provides:

- Centralized API calls
- Request/response interceptors
- Error handling
- Authentication support (ready for JWT tokens)

### Available API Methods:

```javascript
// Health & Root
api.getRoot()
api.getHealth()

// Users
api.getAllUsers(params)
api.getUserById(id)
api.createUser(data)
api.updateUser(id, data)
api.deleteUser(id)

// Items
api.getAllItems(params)
api.getItemById(id)
api.createItem(data)
api.updateItem(id, data)
api.deleteItem(id)
api.updateItemStock(id, quantity)
```

## Styling

The app uses custom CSS with:
- Modern gradient background
- Card-based layout
- Responsive design
- Smooth animations and transitions
- Mobile-friendly interface

## Troubleshooting

### CORS Errors
Make sure the backend has CORS enabled (already configured in backend/server.js)

### Connection Refused
Ensure the backend server is running on http://localhost:5000

### Proxy Errors
The `proxy` in package.json handles API routing. If issues occur:
1. Restart the development server
2. Clear browser cache
3. Check backend server status

## Development Tips

1. **Keep the backend running** while developing the frontend
2. **Use browser DevTools** to inspect network requests
3. **Check Console** for error messages
4. **Test API endpoints** with Postman before integrating

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

To serve the production build:
```bash
npm install -g serve
serve -s build
```

## Next Steps

- [ ] Add form components for creating users/items
- [ ] Implement authentication UI
- [ ] Add routing with React Router
- [ ] Add state management (Redux/Context)
- [ ] Implement real-time updates with WebSockets
- [ ] Add unit tests with Jest and React Testing Library

## License

ISC
