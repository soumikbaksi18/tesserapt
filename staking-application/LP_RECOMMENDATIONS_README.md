# LP Recommendations Integration

This document describes the integration of the BitmaxAI LP recommendations API into the DeFi Dashboard.

## Features Added

### 1. AI Investment Modal Integration
- **Location**: `src/components/dashboard/modals/AiInvestmentModal.tsx`
- **Functionality**: 
  - Integrates with BitmaxAI API to fetch real LP recommendations
  - Shows top 2 LP recommendations based on user's risk profile and investment amount
  - Displays key metrics: APY, expected profit, TVL, and pool score
  - Redirects to trading page for more pools
  - Each recommendation has a "View Details" button that navigates to the detailed LP page

### 2. LP Details Page
- **Location**: `src/pages/LPDetails.tsx`
- **Route**: `/trading/:id` (e.g., `/trading/3790c3e5-8644-4f6b-8feb-12434d8b99f9`)
- **Functionality**:
  - Comprehensive view of LP pool details
  - Pool metrics (APY, TVL, expected returns, risk scores)
  - Risk analysis (exposure type, impermanent loss risk, style)
  - AI-generated explanation of the recommendation
  - Quick actions (invest, add to watchlist, share)
  - Pool information and underlying tokens

### 3. Trading Page Updates
- **Location**: `src/pages/Trading.tsx`
- **Functionality**:
  - Right sidebar now shows LP recommendations instead of AI steps
  - Sample recommendations with key metrics
  - "Get AI Analysis" button redirects to dashboard for full analysis
  - "View All Pools" button for exploring more options

### 4. API Integration
- **Location**: `src/api/lprecommendations.ts`
- **Functionality**:
  - TypeScript interfaces for API responses
  - Functions to fetch recommendations from production and local endpoints
  - Error handling and response parsing

### 5. Custom Hook
- **Location**: `src/hooks/useLPRecommendations.ts`
- **Functionality**:
  - Manages LP recommendations state
  - Provides utility functions for filtering and accessing data
  - Handles loading states and errors

## API Endpoints

### Production
- **Base URL**: `https://fastapi-on-render-0s0u.onrender.com`
- **Endpoint**: `GET /recommend`

### Local Development
- **Base URL**: `http://localhost:9000` (or `http://localhost:8000`)
- **Endpoint**: `GET /recommend`

## API Parameters

- `amountAvax` (float, required): Capital in AVAX
- `horizonMonths` (int, required): Investment horizon (3, 6, 9, 12)
- `riskTolerance` (str, required): conservative | moderate | aggressive
- `topN` (int, optional): Number of results (default: 2 for modal)
- `project` (str, optional): Restrict to specific protocol
- `search` (str, optional): DeFiLlama search term

## Usage Examples

### 1. Get AI Investment Recommendations
1. Navigate to Dashboard
2. Click "AI Investment Advisor" button
3. Fill in investment amount, risk profile, and time horizon
4. Click "Get AI Recommendation"
5. View top 2 LP recommendations
6. Click "View Details" to see full pool information

### 2. View LP Details
1. From AI modal or trading page, click "View Details" on any recommendation
2. Navigate to `/trading/{pool-id}` route
3. View comprehensive pool information and metrics
4. Use quick actions to interact with the pool

### 3. Explore More Pools
1. Click "View More Pools" in AI modal to go to trading page
2. Click "View All Pools" button to explore additional options
3. Use "Get AI Analysis" button to return to dashboard for new analysis

## Data Flow

1. **User Input** → AI Investment Modal
2. **API Call** → BitmaxAI Recommender API
3. **Response Processing** → LP recommendations with explanations
4. **Display** → Top 2 recommendations in modal
5. **Navigation** → Detailed view or trading page
6. **Further Exploration** → Additional pools and analysis

## Styling

All components maintain consistency with the existing UI:
- Glass morphism effects
- Purple and yellow accent colors
- Responsive grid layouts
- Hover effects and transitions
- Consistent spacing and typography

## Error Handling

- API failures are gracefully handled with user-friendly error messages
- Loading states provide visual feedback during API calls
- Fallback content when recommendations are unavailable
- Network error handling with retry options

## Future Enhancements

- Real-time pool data updates
- Historical performance charts
- Portfolio integration for tracking investments
- Social features (pool ratings, reviews)
- Advanced filtering and sorting options
- Mobile-optimized interfaces 