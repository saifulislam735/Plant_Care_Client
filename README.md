# PlantCare - Plant Disease Detection and Dataset Collection

PlantCare is a full-stack application for plant disease detection and dataset collection, with a focus on potato diseases. The application uses AI to detect diseases in plant images and allows agricultural experts to provide personalized advice to farmers.

## Features

- AI-powered disease detection
- Expert help system
- Dataset collection and curation
- Blog system for agricultural tips
- User authentication and role-based access control

## Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: FastAPI
- **Database**: MongoDB
- **AI Model**: TensorFlow

## Project Structure

\`\`\`
plantcare/
├── backend/             # FastAPI backend
│   ├── main.py          # Main application file
│   ├── config.py        # Configuration settings
│   ├── models.py        # Pydantic models
│   ├── requirements.txt # Python dependencies
│   └── .env             # Environment variables
│
└── src/                 # React frontend
    ├── components/      # Reusable components
    ├── context/         # React context providers
    ├── pages/           # Application pages
    └── App.jsx          # Main application component
\`\`\`

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB

### Backend Setup

1. **Install MongoDB**:
   - [Download and install MongoDB](https://www.mongodb.com/try/download/community)
   - Start MongoDB service

2. **Set up Python environment**:
   \`\`\`bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   \`\`\`

3. **Configure environment variables**:
   - Review and update the `.env` file with your settings

4. **Download the AI model**:
   - Download the potato disease detection model
   - Place it in the backend directory as `potato_disease_model_kag_1.keras`

5. **Start the backend server**:
   \`\`\`bash
   uvicorn main:app --reload
   \`\`\`
   The API will be available at http://localhost:8000

### Frontend Setup

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   The application will be available at http://localhost:5173

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Default Admin User

The system creates a default admin user on startup:
- Email: admin@example.com
- Password: adminpassword

You can change these credentials in the `.env` file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
