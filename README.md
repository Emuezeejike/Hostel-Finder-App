# Off-Campus Hostel Finder

A guest-first student accommodation discovery app built with Expo, React Native, TypeScript, and Expo Router.

## Features in this phase

- Guest-first browsing experience
- Splash screen
- Home screen with school selection and discovery cards
- Search and explore screens
- Property detail screen
- School selection flow
- Distance calculation using property and school coordinates
- Mock local property data for Nigerian accommodation listings

## Getting started

1. Install dependencies:
   npm install
2. Start the dev server:
   npx expo start
3. Run Android:
   npx expo run:android
4. Run iOS:
   npx expo run:ios

## Environment

Create a local environment file if needed:

EXPO_PUBLIC_API_URL=https://your-api.example.com

This project is designed so the mock data layer can later be replaced with real API endpoints while keeping the UI reusable.

## Mock data architecture

Data is organized under `src/data` and is separated from API logic. The user-facing UI uses local mock data until backend endpoints are connected.

## Useful commands

- `npm install`
- `npx expo start`
- `npx expo run:android`
- `npx expo run:ios`
- `npx expo export --platform web --clear`

## Notes

- Authentication is intentionally deferred until a protected action is attempted.
- Distance from the selected school is calculated using the Haversine formula and displayed clearly in the app.
