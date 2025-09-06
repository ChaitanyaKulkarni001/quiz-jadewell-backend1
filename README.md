# TCM Body Type Quiz

A comprehensive Traditional Chinese Medicine (TCM) body type assessment quiz built with React, Node.js, and SQLite. The application features a beautiful, modern UI inspired by jadewell.me and Hims.com, with AI-powered personalized responses using Google's Gemini 1.5 Flash.

## Features

- **Interactive TCM Quiz**: 7 comprehensive questions about daily energy, digestion, sleep, emotions, stress response, skin condition, and eating habits
- **Beautiful UI**: Modern, responsive design with Tailwind CSS inspired by jadewell.me and Hims.com
- **AI-Powered Results**: Personalized insights generated using Google Gemini 1.5 Flash
- **Comprehensive Results**: Detailed body type analysis with food recommendations, lifestyle tips, and herbal suggestions
- **Smooth Transitions**: Elegant intro sequence and seamless quiz flow
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## TCM Body Types

The quiz identifies 6 different TCM body constitutions:

1. **Qi Deficient** - Low energy, weak immunity, shortness of breath
2. **Yang Deficient** - Coldness, low energy, prefers warm environments  
3. **Yin Deficient** - Heat, dryness, restlessness, night sweats
4. **Liver Qi Stagnation** - Emotional tension, mood swings, digestive issues
5. **Damp Heat** - Internal dampness, oily skin, digestive sluggishness
6. **Balanced** - Good energy, stable moods, healthy digestion

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **AI**: Google Gemini 1.5 Flash
- **Styling**: Tailwind CSS with custom gradients and animations

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rezoomex_dev_arias_project
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up the database**
   ```bash
   node create_tcm_quiz_db.js
   ```

5. **Configure Gemini AI API Key**
   
   Create a `.env` file in the frontend directory:
   ```bash
   cd frontend
   echo "REACT_APP_GEMINI_API_KEY=your-gemini-api-key-here" > .env
   ```
   
   Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Running the Application

1. **Start the backend server**
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

## API Endpoints

### TCM Quiz API

- `GET /api/tcm/quiz` - Get all quiz questions with options
- `POST /api/tcm/quiz/submit` - Submit quiz answers and get results

### Legacy API (Original Quiz)

- `GET /api/quiz` - Get 10 random questions
- `POST /api/quiz/submit` - Submit answers and get TCM type result

## Database Schema

### TCM Questions Table
```sql
CREATE TABLE tcm_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_text TEXT NOT NULL,
  question_description TEXT,
  question_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### TCM Options Table
```sql
CREATE TABLE tcm_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_letter TEXT NOT NULL,
  option_text TEXT NOT NULL,
  option_image_url TEXT,
  body_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES tcm_questions (id)
);
```

### TCM Results Table
```sql
CREATE TABLE tcm_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body_type TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendations TEXT,
  foods_to_avoid TEXT,
  foods_to_eat TEXT,
  lifestyle_tips TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TCMApp.jsx          # Main app orchestrator
│   │   │   ├── TCMIntro.jsx        # Intro transition screen
│   │   │   ├── TCMQuiz.jsx         # Quiz interface
│   │   │   └── TCMResults.jsx      # Results display
│   │   ├── services/
│   │   │   └── geminiService.js    # Gemini AI integration
│   │   ├── App.jsx                 # Main app component
│   │   └── main.jsx                # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── server.js                       # Express server
├── create_tcm_quiz_db.js          # Database setup script
├── tcm_quiz.db                    # SQLite database
└── README.md
```

## Customization

### Adding New Questions

1. Edit `create_tcm_quiz_db.js`
2. Add new question to the `questions` array
3. Add corresponding options to the options arrays
4. Run `node create_tcm_quiz_db.js` to update the database

### Styling

The application uses Tailwind CSS with custom configurations. Key design elements:

- **Color Scheme**: Emerald/teal gradients inspired by jadewell.me
- **Typography**: Clean, modern fonts with proper hierarchy
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

### AI Responses

Customize AI responses by modifying the prompts in `frontend/src/services/geminiService.js`:

- `generateTCMResponse()` - Main result explanation
- `generatePersonalizedTips()` - Additional personalized tips

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For questions or support, please open an issue in the repository.

---

**Note**: Make sure to keep your Gemini API key secure and never commit it to version control. The application includes fallback responses in case the AI service is unavailable.
