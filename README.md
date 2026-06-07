# Class_Attendance_System

This project is a Face Attendance System that detects people and marks their attendance. It consists of a FastAPI backend and a Next.js frontend.

## Prerequisites

- **Node.js** (for the frontend)
- **Python 3.x** (for the backend)

## How to Start the Project Locally

You will need to run both the backend and the frontend servers simultaneously in separate terminal windows.

### 1. Start the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment (on Windows):
   ```bash
   .\venv\Scripts\activate
   ```
   *(If you are on macOS/Linux, use `source venv/bin/activate` instead)*
3. If you haven't already, install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will now be running at [http://localhost:8000](http://localhost:8000).
   You can view the interactive API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Start the Frontend (Next.js)

1. Open a **new** terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend web application will now be running at [http://localhost:3000](http://localhost:3000). Open this URL in your web browser to interact with the application.
