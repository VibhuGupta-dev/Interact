## 📌 Overview
 
Interact leverages **WebRTC** for peer-to-peer media streaming and **Socket.IO** for real-time signaling and chat — giving users low-latency, high-quality video and audio communication directly in the browser. No plugins. No downloads.
 
---
 
## ✨ Features
 
| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based secure login & signup |
| 🎥 **Video & Audio** | Real-time P2P communication via WebRTC |
| 💬 **Live Chat** | In-room messaging powered by Socket.IO |
| 🏠 **Room Management** | Create or join rooms using a unique room code |
| 👥 **Multi-Participant** | Supports multiple users per room |
| 🔔 **Live Notifications** | Real-time join/leave alerts |
| 📱 **Responsive UI** | Works seamlessly on desktop and mobile |
| ⚡ **Low Latency** | Direct peer connections for minimal delay |
 
---
 
## 🛠️ Tech Stack
 
**Frontend**
- [React.js](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Socket.IO Client](https://socket.io/docs/v4/client-api/) — Real-time events
- [Axios](https://axios-http.com/) — HTTP requests
**Backend**
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) — REST API server
- [MongoDB](https://www.mongodb.com/) — Database
- [Socket.IO](https://socket.io/) — WebSocket signaling server
- [JWT](https://jwt.io/) — Authentication tokens
**Real-Time Communication**
- [WebRTC](https://webrtc.org/) — Peer-to-peer audio/video streaming
---
 
## 🏗️ Architecture
 
```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│          UI Rendering · Media Controls · Chat UI             │
└────────────────────────┬───────────────┬────────────────────┘
                         │               │
              HTTP/REST  │               │  WebSocket
                         ▼               ▼
┌──────────────────┐   ┌────────────────────────────┐
│  Express Server  │   │     Socket.IO Server        │
│  Auth · API      │   │  Signaling · Chat · Events  │
└──────────────────┘   └────────────────────────────┘
         │
         ▼
┌──────────────────┐         ┌───────────────────────────┐
│     MongoDB      │         │         WebRTC            │
│  Users · Rooms   │         │  Direct P2P Media Stream  │
└──────────────────┘         └───────────────────────────┘
```
 
---
 
## ⚙️ Installation & Setup
 
### Prerequisites
 
- Node.js `v18+`
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- npm or yarn
### 1️⃣ Clone the repository
 
```bash
git clone https://github.com/VibhuGupta-dev/Interact.git
cd Interact
```
 
### 2️⃣ Install dependencies
 
```bash
# Backend
cd Backend
npm install
 
# Frontend
cd ../Frontend
npm install
```
 
### 3️⃣ Configure environment variables
 
Create a `.env` file inside the `Backend/` directory:
 
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```
 
### 4️⃣ Run the application
 
```bash
# Start backend (from /Backend)
npm run dev
 
# Start frontend (from /Frontend)
npm run dev
```
 
App will be live at **http://localhost:5173** 🚀
 
---
 
## 🔌 Socket Events
 
| Event | Direction | Description |
|---|---|---|
| `user-join-request` | Client → Server | User requests to join a room |
| `user-joined` | Server → Client | Broadcast when a user joins |
| `user-ready-rtc` | Client → Server | Client ready to initiate WebRTC |
| `user-join-rtc` | Server → Client | Trigger peer connection setup |
| `offer` | Peer → Peer | WebRTC SDP offer |
| `answer` | Peer → Peer | WebRTC SDP answer |
| `ice-candidate` | Peer → Peer | ICE candidate exchange |
| `media-state` | Client → Room | Broadcast mic/camera toggle state |
| `send-message` | Client → Server | Send a chat message |
| `receive-message` | Server → Client | Deliver a chat message |
| `user-left` | Server → Client | Notify room when a user disconnects |
 
---
 
## 🧠 How It Works
 
```
1. User creates or joins a room → authenticated via JWT
        │
2. Socket.IO signals room entry → triggers user-joined event
        │
3. WebRTC handshake begins:
   Offer → Answer → ICE candidates exchanged via Socket
        │
4. P2P connection established → media streams shared directly
        │
5. Chat & notifications routed through Socket.IO in parallel
```
 
---
 
## 📸 Screenshots
 
> _Screenshots coming soon — contributions welcome!_
 
---
 
## 🚀 Future Improvements
 
- [ ] 🖥️ Screen Sharing
- [ ] 🎙️ Recording Meetings
- [ ] ✋ Raise Hand Feature
- [ ] 🔇 AI Noise Cancellation
- [ ] 😊 Sentiment Detection in live meetings
- [ ] 🔗 Shareable invite links
- [ ] 📊 Meeting analytics dashboard
---
 
## 🤝 Contributing
 
Contributions are welcome! Here's how to get started:
 
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request
Please make sure your code follows the existing style and that all features are tested before submitting.
 
---
 
## 📜 License
 
This project is licensed under the [MIT License](LICENSE).
 
---
 
<div align="center">
Made with ❤️ by [Vibhu Gupta](https://github.com/VibhuGupta-dev)
