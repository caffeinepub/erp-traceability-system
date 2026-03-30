# ERP Traceability System

## Current State
- Login page uses Internet Identity (Google/passwordless login)
- Auth managed via `useInternetIdentity` hook
- Admin role checked via `actor.isCallerAdmin()`
- Layout shows principal as user identifier
- No username/password credentials UI

## Requested Changes (Diff)

### Add
- Username/password login form on the login page
- Credential store in localStorage: default admin (TSD/TSD123) and user (TSDS/TSDS123)
- `useLocalAuth` hook that validates credentials and stores session in localStorage
- Admin can manage user credentials (change username/password) via a new User Management page
- Role labels: Admin = "Master", User = "Level 1"

### Modify
- `LoginPage.tsx`: replace Internet Identity button with username/password form fields
- `auth.ts`: replace `useInternetIdentity`-based auth with localStorage credential-based auth
- `Layout.tsx`: show username and role label (Master/Level 1) instead of principal
- `App.tsx`: add route for `/admin/users` User Management page

### Remove
- Internet Identity login button and references in LoginPage
- `useInternetIdentity` usage in auth context

## Implementation Plan
1. Create `src/frontend/src/lib/localAuth.ts` - credential store + session management using localStorage
2. Update `src/frontend/src/lib/auth.ts` to use localAuth
3. Update `src/frontend/src/pages/LoginPage.tsx` to show username/password form
4. Update `src/frontend/src/components/Layout.tsx` to show username and role (Master/Level 1)
5. Create `src/frontend/src/pages/admin/UserManagementPage.tsx` - admin can view/edit user credentials
6. Update `src/frontend/src/App.tsx` to add `/admin/users` route
7. Add User Management link to nav (admin only)
