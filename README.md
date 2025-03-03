# SplitRight

SplitRight is an expense splitting application that helps groups of people track and settle shared expenses. It's perfect for roommates, trips, events, or any situation where expenses need to be shared among multiple people.

## Features

- Create and manage expense groups
- Add and track expenses within groups
- Automatically calculate settlements between group members
- View detailed expense history
- Works offline with local storage
- Optional backend API for data persistence

## Technology Stack

### Frontend

- React.js
- Material-UI for the user interface
- React Router for navigation
- Axios for API requests
- Local storage for offline functionality

### Backend (Optional)

- Flask (Python)
- JSON file storage
- RESTful API design

## Getting Started

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

4. The application will be available at http://localhost:3000

### Backend Setup (Optional)

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Create and activate a virtual environment:

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Start the Flask server:

   ```
   python app.py
   ```

5. The API will be available at http://localhost:5000

## Usage

1. Create a new expense group
2. Add members to the group
3. Add expenses, specifying who paid and how to split the cost
4. View the settlements page to see who owes whom

## License

MIT

## Acknowledgements

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
- UI components from [Material-UI](https://mui.com/)
