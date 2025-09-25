# Student-Buddy

A comprehensive learning assistant that integrates with popular coding platforms to enhance your learning experience.

## 🌟 Features

- Browser extension integration with:
  - LeetCode
  - HackerRank
  - CodeForces
- AI-powered question assistance
- Dark/Light theme support
- Responsive design for mobile and desktop
- Real-time problem-solving support

## 🏗️ Project Structure

The project consists of two main parts:

### Frontend

- Built with React + Vite + TypeScript
- Shadcn/UI components for modern UI
- Browser extension capabilities
- Theme customization

### Backend

- Node.js Express server
- OpenAI integration for AI assistance
- Error logging and monitoring
- RESTful API architecture

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun package manager
- Docker (for containerization)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IndraJeet-09/Student-buddy.git
cd Student-buddy
```

2. Backend Setup:
```bash
cd backend
npm install
# Create .env file with necessary environment variables
npm run dev
```

3. Frontend Setup:
```bash
cd frontend
bun install
bun run dev
```

4. Browser Extension Setup:
```bash
cd frontend
bun run build
# Load the dist folder as an unpacked extension in your browser
```

## 🔧 Environment Variables

### Backend
```env
PORT=3000
OPENAI_API_KEY=your_api_key
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
```

## 🐳 Docker Support

Run the entire application using Docker Compose:

```bash
docker-compose up
```

## 📝 API Documentation

The backend provides RESTful APIs for:
- Health checks
- Question processing
- AI assistance

Base URL: `http://localhost:3000`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- IndraJeet-09

## 🙏 Acknowledgments

- Thanks to OpenAI for AI capabilities
- Shadcn/UI for beautiful components
- All contributors and supporters