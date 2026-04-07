🚀 Real-Time Video Meeting App (MERN + WebRTC)
📌 Overview

A full-stack real-time video conferencing application built using the MERN stack and WebRTC. This app allows users to create or join meeting rooms and communicate via video, audio, and chat in real time — similar to Google Meet.

✨ Features
🔐 User Authentication (JWT-based)
🎥 Real-time Video & Audio Communication (WebRTC)
💬 Live Chat using Socket.IO
🏠 Create / Join Rooms via Room Code
👥 Multiple Participants Support
🔄 Real-time Updates (join/leave notifications)
📱 Responsive UI (works on desktop & mobile)
⚡ Low latency communication
🛠️ Tech Stack
Frontend:
React.js
Tailwind CSS
Axios
Socket.IO Client
Backend:
Node.js
Express.js
MongoDB
Socket.IO
JWT Authentication
Real-Time Communication:
WebRTC (Peer-to-Peer connection)
🏗️ Architecture
Frontend (React) → UI + Media handling
Backend (Express) → API + Auth
Socket Server → Real-time signaling
WebRTC → Direct peer-to-peer media streaming
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
2️⃣ Install dependencies
Backend:
cd backend
npm install
Frontend:
cd frontend
npm install
3️⃣ Environment Variables

Create a .env file in backend:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
4️⃣ Run the app
Start backend:
cd backend
npm run dev
Start frontend:
cd frontend
npm run dev
🔌 Socket Events
Event Name	Description
user-join-request	User requests to join room
user-joined	Broadcast when user joins
offer	WebRTC offer
answer	WebRTC answer
ice-candidate	ICE candidate exchange
send-message	Chat message
receive-message	Receive message
🧠 How It Works
User creates or joins a room
Socket.IO handles signaling
WebRTC establishes peer connection
Media streams are shared directly
Chat & events handled via sockets
📸 Screenshots

Add your UI screenshots here

🚀 Future Improvements
Screen Sharing
Recording Meetings
Raise Hand Feature
AI Noise Cancellation
Sentiment Detection (🔥 for your Outword idea)
🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a PR.

📜 License

This project is licensed under the MIT License.
