# Backend API - Express & MongoDB Atlas

A RESTful API built with Node.js, Express, and MongoDB Atlas.

## Features

- ✅ Express.js server setup
- ✅ MongoDB Atlas integration with Mongoose
- ✅ RESTful API endpoints
- ✅ CRUD operations for Users and Items
- ✅ Error handling middleware
- ✅ Request validation
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Environment configuration
- ✅ MVC architecture
- ✅ Auto-generated API Documentation (Swagger)
- ✅ Standardized API Responses

## API Documentation

The API includes an interactive Swagger UI for testing and exploring endpoints.
1. Run the server: `npm run dev`
2. Access the documentation at: `http://localhost:5000/api-docs`

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── userController.js    # User business logic
│   └── itemController.js    # Item business logic
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validate.js          # Validation middleware
├── models/
│   ├── User.js              # User schema
│   └── Item.js              # Item schema
├── routes/
│   ├── userRoutes.js        # User API routes
│   └── itemRoutes.js        # Item API routes
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── server.js                # Main application entry point
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure MongoDB Atlas:**
   
   - Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Get your connection string
   - Update `.env` file with your MongoDB connection string:
   
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the server:**
   
   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

4. **Server should be running on:**
   ```
   http://localhost:5000
   ```

## API Endpoints

### Users API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (with pagination & filters) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

**Query Parameters for GET /api/users:**
- `status` - Filter by status (active, inactive, suspended)
- `role` - Filter by role (user, admin, moderator)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**User Schema:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "status": "active",
  "role": "user"
}
```

### Items API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items (with pagination & filters) |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| PATCH | `/api/items/:id/stock` | Update item stock |

**Query Parameters for GET /api/items:**
- `category` - Filter by category
- `inStock` - Filter by stock availability (true/false)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Text search in title and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Item Schema:**
```json
{
  "title": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "quantity": 10,
  "category": "electronics",
  "tags": ["tag1", "tag2"],
  "createdBy": "user_id_here"
}
```

## Example API Requests

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "role": "user"
  }'
```

### Get All Users
```bash
curl http://localhost:5000/api/users?page=1&limit=10&status=active
```

### Create Item
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "quantity": 5,
    "category": "electronics",
    "tags": ["laptop", "computer"]
  }'
```

### Update Item Stock
```bash
curl -X PATCH http://localhost:5000/api/items/{item_id}/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10}'
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB Atlas connection string | mongodb+srv://... |
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development/production |
| JWT_SECRET | Secret key for JWT (future use) | your_secret_key |

## Security Features

- **Helmet**: Sets security HTTP headers
- **CORS**: Enables Cross-Origin Resource Sharing
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes per IP)
- **Input Validation**: Validates and sanitizes user input
- **Error Handling**: Centralized error handling

## Development

### Adding New Routes

1. Create model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Import and use routes in `server.js`

### Testing

You can test the API using:
- **Postman**: Import the endpoints and test
- **cURL**: Use command line
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension

## Troubleshooting

### MongoDB Connection Issues

- Verify your MongoDB Atlas connection string
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your credentials are correct
- Check network connectivity

### Port Already in Use

Change the PORT in `.env` file or kill the process using the port:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Future Enhancements

- [ ] JWT Authentication
- [ ] File upload functionality
- [ ] Unit and integration tests
- [ ] API documentation with Swagger
- [ ] Logging with Winston or Morgan
- [ ] Caching with Redis
- [ ] WebSocket support
- [ ] Email notifications

## License

ISC

## Author

Your Name
