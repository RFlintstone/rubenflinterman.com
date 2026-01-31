# Migration Guide: Refactored Campaign Portal

## Overview
Your React app has been successfully refactored into a proper Next.js 14 application with TypeScript, following best practices for project structure and component organization.

## Key Changes

### 1. File Structure
- **Before**: Single monolithic file
- **After**: Organized Next.js app structure with proper separation of concerns

### 2. Type Safety
- Added TypeScript throughout the application
- Created comprehensive type definitions in `src/types/index.ts`
- All components now have proper type annotations

### 3. State Management
- Extracted state into React Context providers:
  - `UserContext`: Handles authentication state
  - `CampaignContext`: Manages campaign data, quotes, lore, party, and quests

### 4. Routing
- Implemented Next.js App Router with route groups:
  - `(auth)`: Login page (public)
  - `(app)`: Protected routes with shared layout
  
### 5. Components
- Separated reusable components:
  - `Card.tsx`: Reusable card component
  - `SidebarItem.tsx`: Navigation item component

## File Mapping

| Original | New Location |
|----------|-------------|
| Single App.js | Multiple organized files |
| Login UI | `src/app/(auth)/login/page.tsx` |
| Dashboard | `src/app/(app)/page.tsx` |
| Party Tab | `src/app/(app)/party/page.tsx` |
| Quotes Tab | `src/app/(app)/quotes/page.tsx` |
| Lore Tab | `src/app/(app)/lore/page.tsx` |
| Map Tab | `src/app/(app)/map/page.tsx` |
| Card Component | `src/components/Card.tsx` |
| SidebarItem | `src/components/SidebarItem.tsx` |
| Auth State | `src/lib/UserContext.tsx` |
| Campaign State | `src/lib/CampaignContext.tsx` |
| Types | `src/types/index.ts` |

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd campaign-portal
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access the App**
   - Open http://localhost:3000
   - Default route redirects to login if not authenticated
   - After login, you'll be taken to the dashboard

## Features Preserved

✅ Role-based login (Player/Dungeon Master)
✅ Campaign selection dropdown
✅ Dynamic theming (amber/blue)
✅ Sidebar navigation
✅ Dashboard with cards
✅ Empty states for all sections
✅ Logout functionality
✅ Responsive design

## New Features

✨ Type safety with TypeScript
✨ Proper routing with Next.js App Router
✨ Protected routes (automatic redirect to login)
✨ Better code organization and maintainability
✨ Separation of concerns (UI, state, types)
✨ Development/production build optimization

## Navigation Flow

1. **Unauthenticated**: Redirected to `/login`
2. **After Login**: Redirected to `/` (dashboard)
3. **Sidebar Links**: Navigate between different sections
4. **Logout**: Clears user state and returns to login

## Context Providers

### UserContext
```typescript
const { user, login, logout } = useUser();
```

### CampaignContext
```typescript
const { 
  campaigns, 
  activeCampaign, 
  setActiveCampaign,
  quotes,
  lore,
  party,
  quests 
} = useCampaign();
```

## Future Enhancements

To extend this app, you can:

1. **Add Data Persistence**: Integrate a database or localStorage
2. **Implement Add/Edit Forms**: For characters, quests, quotes, etc.
3. **Add Map Component**: Interactive campaign map
4. **Campaign Creation**: Allow users to create new campaigns
5. **Real Authentication**: Replace mock auth with real auth provider
6. **API Routes**: Add Next.js API routes for backend logic

## Development Tips

- Use the context hooks to access global state
- Create new pages by adding files to `src/app/(app)/`
- Add new components to `src/components/`
- Update types in `src/types/index.ts`
- Tailwind classes are available throughout the app

## Troubleshooting

**Port already in use?**
```bash
npm run dev -- -p 3001
```

**Build errors?**
```bash
rm -rf .next
npm install
npm run dev
```

---

Your app is now production-ready and follows Next.js best practices! 🎉
