# 🎮 Valorant Crate Simulator

An immersive web application that simulates opening Valorant weapon skin crates. Experience the thrill of crate opening with smooth animations, sound effects, and build your collection of rare skins.

![Valorant](https://img.shields.io/badge/Valorant-FF4655?style=for-the-badge&logo=valorant&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- **🎁 Crate Opening Experience** - Smooth sliding animation with realistic deceleration
- **🎵 Immersive Audio** - Background music and sound effects for enhanced experience
- **📦 Inventory System** - Collect and manage weapon skins with localStorage persistence
- **🎨 Valorant Theme** - Authentic black and red design matching Valorant's aesthetic
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **🔍 Browse Content** - Explore all Valorant agents and weapon skins

## 🛠️ Tech Stack

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## 📁 Project Structure

```
valorant-app/
├── public/
│   ├── sounds/              # Sound effects (tick, whoosh, reveal, success)
│   └── favicon.png          # Valorant logo favicon
├── src/
│   ├── api/
│   │   └── valorant.jsx     # API functions for fetching data
│   ├── assets/
│   │   └── valo.png         # Valorant logo
│   ├── components/
│   │   ├── AgentsList.jsx   # Agents display page
│   │   ├── CrateModal.jsx   # Crate opening modal
│   │   ├── Inventory.jsx    # Inventory page
│   │   ├── LandingPage.jsx  # Homepage with crate opening
│   │   ├── Navbar.jsx       # Navigation bar
│   │   └── WeaponSkinsList.jsx  # Weapon skins display
│   ├── hooks/
│   │   └── useInventory.js # Custom hook for inventory management
│   ├── utils/
│   │   └── sounds.js        # Sound effects manager
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles and Tailwind imports
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── vercel.json             # Vercel deployment configuration
```

## 🌐 API

This project uses the [Valorant API](https://valorant-api.com/) - a free, community-driven API that provides:

- **Agents** - `https://valorant-api.com/v1/agents`
- **Weapons** - `https://valorant-api.com/v1/weapons`
- **Weapon Skins** - `https://valorant-api.com/v1/weapons/skins`

All API endpoints support language parameters and return comprehensive data including display icons, names, and metadata.

## 📄 License

This project is for educational and entertainment purposes only.

**Valorant** is a trademark of Riot Games, Inc. This project is not affiliated with or endorsed by Riot Games.

---

Made with ❤️ for Valorant fans
