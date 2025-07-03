# Multi-Agent System with Memory

A sophisticated multi-agent system with memory capabilities, featuring support and dashboard agents that can retain context across conversations and handle multilingual queries.

## 🚀 Features

- **Memory-Enabled Agents**: Agents remember conversation context and can resolve references like "that client" or "the order"
- **Multilingual Support**: Handle queries in English, Hindi, Bengali, and other languages
- **Smart Context Resolution**: Automatically resolve pronouns and references using conversation history
- **Session Management**: Automatic session creation and cleanup with 60-minute expiry
- **Cross-Agent Memory**: Context is shared between support and dashboard agents
- **Real-time Chat Interface**: Interactive web interface with message history

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
- **Support Agent**: Handles client searches, order creation, status checks, and customer service
- **Dashboard Agent**: Provides business analytics, revenue reports, and insights
- **Memory Service**: Manages session-based context and conversation history
- **MongoDB Integration**: Data persistence and analytics
- **RESTful API**: Express.js endpoints for agent communication

### Frontend (React + TypeScript)
- **Interactive Chat Interface**: Real-time messaging with both agents
- **Session Management**: Automatic session handling with memory context
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Multi-Agent Tabs**: Switch between support and dashboard agents

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-agent-system
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   CORS_ORIGIN= https://your-frotend-url.com
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the `client` directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## 🔧 API Endpoints

### Support Agent
- `POST /api/agents/support/query` - Process support queries
- `POST /api/agents/support/orders/create` - Create new orders
- `GET /api/agents/support/classes/weekly` - Get weekly class schedule
- `GET /api/agents/support/orders/:orderId/status` - Check order status

### Dashboard Agent
- `POST /api/agents/dashboard/query` - Process dashboard queries
- `GET /api/agents/dashboard/summary` - Get business summary
- `GET /api/agents/dashboard/courses/top-enrollment` - Top performing courses
- `GET /api/agents/dashboard/attendance` - Attendance statistics

### Memory Management
- `GET /api/agents/support/memory/sessions/:sessionId` - Get session context
- `DELETE /api/agents/support/memory/sessions/:sessionId` - Clear session memory
- `GET /api/agents/support/memory/sessions` - List active sessions

## 💬 Query Examples

### Support Agent Examples

#### Client Management
```
# English
"Find client john@example.com"
"Create client John Smith with email john@example.com and phone +1234567890"
"Search for client named Sarah Johnson"

# Hindi
"ग्राहक john@example.com खोजें"
"नया ग्राहक John Smith बनाएं"

# Bengali
"ক্লায়েন্ট john@example.com খুঁজুন"
"নতুন ক্লায়েন্ট তৈরি করুন"
```

#### Order Management
```
# English
"Create an order for Yoga Course for client priya@example.com"
"What is the status of order ABC123?"
"Check payment status for order XYZ789"

# Hindi
"योग कोर্स के लिए ऑर्डर बनाएं"
"ऑर्डर ABC123 का स्टेटस क्या है?"

# Bengali
"যোগ কোর্সের জন্য অর্ডার তৈরি করুন"
"অর্ডার ABC123 এর অবস্থা কী?"
```

#### Contextual Queries (Memory-Enabled)
```
# First, search for a client
"Find client john@example.com"

# Then reference that client
"Create an order for Yoga Course for that client"
"What orders does that client have?"
"Check payment status for that client"
```

#### Class & Schedule Information
```
"Show me classes this week"
"What classes are available today?"
"इस सप्ताह कौन सी कक्षाएं उपलब्ध हैं?"
```

### Dashboard Agent Examples

#### Revenue Analytics
```
"Show me monthly revenue"
"How much money did we make this month?"
"मासिक राजस्व दिखाएं"
"এই মাসের আয় কত?"
```

#### Enrollment Statistics
```
"What are the top performing services?"
"Which course has the highest enrollment?"
"Most popular classes this month"
"শীর্ষ কোর্স কোনগুলো?"
```

#### Payment & Order Analytics
```
"Outstanding payments"
"Pending orders"
"बकाया भुगतान"
"অমীমাংসিত পেমেন্ট"
```

#### Client Insights
```
"How many active clients do we have?"
"Show me inactive clients"
"Client birthday reminders"
"New clients this month"
```

#### Attendance Reports
```
"Show attendance statistics"
"Attendance report for Yoga class"
"उपस्थिति रिपोर्ट"
"উপস্থিতির রিপোর্ট"
```

#### Dashboard Summary
```
"Generate dashboard summary"
"Business overview"
"ড্যাশবোর্ড সামারি"
"व्यवसाय सारांश"
```

## 🧠 Memory System Features

### Automatic Session Management
- Sessions are automatically created and managed by the backend
- 60-minute session expiry with automatic cleanup
- No authentication required - sessions are ephemeral

### Context Retention
- Remembers recent client searches and interactions
- Stores order information and service contexts
- Maintains conversation history across both agents

### Reference Resolution
- Resolves "that client", "the order", "same service" references
- Works across different languages
- Maintains context even when switching between agents

### Example Memory Flow
```
1. User: "Find client john@example.com"
   → Agent finds client, stores in memory

2. User: "Create order for Yoga Course for that client"
   → Agent resolves "that client" to "john@example.com"

3. User: "What's the status of that order?"
   → Agent resolves "that order" to the recently created order
```

## 🌍 Multilingual Support

The system supports queries in multiple languages:

- **English**: Full support for all features
- **Hindi**: Devanagari script support
- **Bengali**: Bengali script support
- **Mixed Languages**: Can handle mixed language conversations

### Language Detection
- Automatic language detection and translation
- Context preservation across language switches
- Unified response format regardless of input language

## 🔒 Session Management

### Automatic Session Creation
- Sessions are created automatically on first interaction
- No manual session management required
- Unique session IDs generated server-side

### Session Expiry
- Sessions automatically expire after 60 minutes of inactivity
- Expired sessions are cleaned up automatically
- Memory is cleared when sessions expire

### Session Persistence
- Context is maintained throughout the session
- Cross-agent memory sharing
- Recent interaction history preservation

## 🛠️ Development 

### Development Mode
```bash
# Start backend in development mode
cd server
npm run dev

# Start frontend in development mode
cd client
npm run dev
```

## 📊 Database Schema

### Collections
- `clients` - Client information and contact details
- `orders` - Order records and status tracking
- `payments` - Payment information and status
- `classes` - Class schedules and information
- `courses` - Course catalog and details
- `attendance` - Attendance tracking records

## 🚀 Deployment

### Backend Deployment (Render)
- The backend is deployed on Render's free tier
- First request may take 30-60 seconds (cold start)
- Subsequent requests are much faster
- Automatic scaling and sleep mode

### Frontend Deployment
- Deployed to Vercel .
- Environment variables need to be configured
- Build process: `npm run build`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
CORS_ORIGIN= https://your-frotend-url.com
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_api_key
NODE_ENV=production
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=https://your-backend-url.com
```
