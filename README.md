# Protego

> **Protego** is an AI Vulnerability Scanner designed to simulate and analyze model inversion attacks on deployed CNN models during their inference phase. It helps researchers and developers understand potential vulnerabilities in their AI systems — especially where there are currently no off-the-shelf solutions for this kind of threat.


---

## Features

- Score-based & Boundary-based model inversion attacks
- Supports popular CNN architectures: ResNet, EfficientNet, MobileNet
- Backend in FastAPI for handling attack requests
- Frontend in React + TypeScript with a clean UI
- Automatic PDF report generation after each attack
- Dashboard for viewing past scan summaries

---

## Project Structure

```
TeamOne/
├── documents/           # Reports and Posters
├── src/
│   ├── backend/         # FastAPI backend logic and API routes
│   ├── frontend/        # React + TypeScript frontend
│   │   ├── public/         # Static assets
│   │   ├── src/            # Frontend source code
│   │   │   ├── components/    # Reusable React components
│   │   │   ├── pages/         # Page-level React components
│   │   │   ├── services/      # API functions
│   │   │   └── styles/        # CSS styling files
│   │   ├── package.json       # Frontend dependencies and scripts
│   │   ├── package-lock.json  # Locked versions of dependencies
│   │   └── tsconfig.json      # TypeScript configuration
│   └── models/           # CNN models
└── README.md
```

---

## Getting Started

1. **Create Database**
   - Create a PostgreSQL database named `protego`.

2. **Open Two Terminals**
   - One for backend, one for frontend.

3. **Install Dependencies**
   - **Backend:**
     ```bash
     cd src/backend  
     pip install -r requirements.txt
     ```
   - **Frontend:**
     ```bash
     cd src/frontend  
     npm install
     ```

4. **Run Servers**
   - **Backend:**
     ```bash
     python main.py
     ```
   - **Frontend:**
     ```bash
     npm start
     ```

5. **Start both frontend and backend servers.**
6. Visit `http://localhost:3000`, create an account, and log in.
7. **Log in or Register**
8. Navigate to **Dashboard** → **Get Started**.
9. Provide:
   - Model URL
   - Attack type (Score-based / Boundary-based)
   - Model type (ResNet / EfficientNet / MobileNet)
10. Click **Launch**.
11. The backend performs the attack and:
    - Triggers an automatic **PDF report download**
    - Sends the result as a dictionary for rendering on the **Report** page.

---

##  Demo

[Demo Video](https://youtu.be/wE6DxJO5-ls) on YouTube!

---
