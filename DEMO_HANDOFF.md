# Student Hostel Checker Demo Handoff

## Demo login accounts

- Student: `student@example.com` / `password123`
- Provider: `provider@example.com` / `password123`
- Admin: `admin@example.com` / `password123`

## Role entry

The app now starts on a role-selection landing screen so the demo can be presented by audience:

- Student path: browse listings, request inspections, and manage verification
- Provider path: add properties, review inspection requests, and view property status
- Admin path: approve providers, review reports, and inspect user metrics

## App state persistence

The Zustand store persists key demo data in AsyncStorage, including:

- selected school
- auth session
- inspection requests
- reviews and reports
- provider properties
- admin approvals and user list

This makes the UX feel consistent during a live demo and across restarts.

## Demo flow recommendations

1. Start on the role selection screen.
2. Choose Student and browse the default listings.
3. Open a property detail and request an inspection.
4. Switch to Provider to review the request and property list.
5. Switch to Admin to inspect approvals and reports.
6. Use the guest path to show the open browsing mode.

## Notes

- The app is a mock MVP and intentionally uses seeded demo data.
- Real API integration can replace the Zustand mock layer later without changing the navigation model.
- The Expo export build was verified successfully as the final validation step.
