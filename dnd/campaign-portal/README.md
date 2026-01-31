# Campaign Portal

A D&D campaign management tool built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- 🎭 Role-based authentication (Player/Dungeon Master)
- 📚 Campaign management with multiple worlds
- 🗺️ Track party members, quests, lore, and quotes
- 🎨 Dynamic theming (amber/blue)
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (app)/              # Protected app routes
│   │   │   ├── layout.tsx      # App layout with sidebar
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── party/          # Party management
│   │   │   ├── quotes/         # Quotes page
│   │   │   ├── lore/           # Lore page
│   │   │   └── map/            # Map page
│   │   ├── (auth)/             # Auth routes
│   │   │   └── login/          # Login page
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── Card.tsx
│   │   └── SidebarItem.tsx
│   ├── lib/                    # Context providers
│   │   ├── UserContext.tsx
│   │   └── CampaignContext.tsx
│   └── types/                  # TypeScript types
│       └── index.ts
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Context API** - State management

## License

MIT
