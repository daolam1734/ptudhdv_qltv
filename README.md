# PTUDHDV - QLTV
## Library Management System

Full-stack application with React frontend and Node.js/Express backend connected to MongoDB Atlas.

## 🏗️ Project Structure

```
ptudhdv_qltv/
├── backend/          # Node.js + Express + MongoDB
│   ├── config/       # Database configuration
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth & validation
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   └── server.js     # Entry point
│
└── frontend/         # React application
    ├── public/       # Static files
    ├── src/
    │   ├── components/  # React components
    │   ├── services/    # API service layer
    │   ├── App.js       # Main component
    │   └── index.js     # Entry point
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/daolam1734/ptudhdv_qltv.git
   cd ptudhdv_qltv
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB Atlas credentials
   npm run dev
   ```

3. **Setup Frontend (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_secret_key
```

### Frontend Environment Variables (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

## 📚 API Endpoints

### Health & Info
- `GET /` - Root endpoint
- `GET /health` - Health check

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `PATCH /api/items/:id/stock` - Update stock

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- CORS
- Helmet
- Express Rate Limit

### Frontend
- React 18
- Axios
- Modern CSS

## 📝 Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart with nodemon
```

### Frontend Development
```bash
cd frontend
npm start  # Hot reload enabled
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend (set NODE_ENV=production in .env)
cd backend
npm start
```

## 🔒 Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation
- Environment-based configuration
- MongoDB injection protection

## 👤 Author

**daolam1734**
- GitHub: [@daolam1734](https://github.com/daolam1734)
- Email: daolam1734@gmail.com

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues or questions, please open an issue on GitHub.
