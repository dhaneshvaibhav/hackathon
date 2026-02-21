# Club Hub - Frontend

This is the frontend application for the Club Hub project, built with React and Vite.

## 🚀 Features

- **Component-Based Architecture**: Reusable components in `src/components`.
- **React Router**: Client-side routing with `react-router-dom`.
- **State Management**: Using React Hooks (`useState`, `useEffect`, `useContext`).
- **Styling**: Custom CSS with responsive design.
- **API Integration**: Axios for communicating with the Flask backend.

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components (Navbar, Footer, etc.)
├── layouts/        # Page layouts (DashboardLayout)
├── pages/          # Application pages (Home, Login, Dashboard, etc.)
├── functions/      # API service functions (auth, club, event, etc.)
├── assets/         # Static assets
└── App.jsx         # Main application component
```

## 🛠️ Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## 🔗 Environment Variables

This project uses a `config.js` file for API configuration. Ensure the backend URL matches your server setup.
