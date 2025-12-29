# Deployment Guide for Money Lender App

Follow these steps to deploy your MERN stack application to Render (Backend) and Vercel (Frontend).

## Prerequisites
- A GitHub account.
- Your project pushed to a GitHub repository.
- Accounts on [Render](https://render.com) and [Vercel](https://vercel.com).

---

## Part 1: Deploy Backend to Render

1.  **Log in to Render** and click generic **"New +"** button -> **"Web Service"**.
2.  **Connect your GitHub repository**.
3.  **Configure the Service**:
    *   **Name**: `money-lender-backend` (or similar)
    *   **Region**: Choose one close to you (e.g., Singapore, Frankfurt, Oregon).
    *   **Root Directory**: `backend` (Important! Do not leave blank).
    *   **Environment**: `Node`
    *   **Build Command**: `    `
    *   **Start Command**: `npm start`
    *   **Instance Type**: Free (if available) or Starter.

4.  **Environment Variables**:
    Scroll down to the "Environment Variables" section and add the following keys from your local `backend/.env` file:
    
    | Key | Value |
    |-----|-------|
    | `NODE_ENV` | `production` |
    | `MONGO_URI` | *Your actual MongoDB connection string* |
    | `JWT_SECRET` | *Your secret key* |
    | `RATE_LIMIT_MAX` | `100` (optional) |
    | `FRONTEND_URL` | *Leave blank for now, we will update this after Frontend deployment* |

5.  **Click "Create Web Service"**.
    *   Wait for the deployment to finish. It might take a few minutes.
    *   Once "Live", copy the **backend URL** (e.g., `https://money-lender-backend.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel

1.  **Log in to Vercel** and click **"Add New..."** -> **"Project"**.
2.  **Import your GitHub repository**.
3.  **Configure the Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Root Directory**: Click "Edit" and select `frontend`.

4.  **Environment Variables**:
    Expand the "Environment Variables" section and add:

    | Key | Value |
    |-----|-------|
    | `VITE_API_URL` | The **Backend URL** you copied from Render (e.g., `https://money-lender-backend.onrender.com`) |
    
    *Note: Do NOT add a trailing slash `/` at the end of the URL.*

5.  **Click "Deploy"**.
    *   Wait for the build to complete.
    *   Once complete, you will get a **Vercel Deployment URL** (e.g., `https://money-lender-frontend.vercel.app`).

---

## Part 3: Final Configuration

1.  Go back to your **Render Dashboard**.
2.  Go to the **Environment** tab of your backend service.
3.  Add/Update the `FRONTEND_URL` variable:
    *   **Key**: `FRONTEND_URL`
    *   **Value**: Your new **Vercel Deployment URL** (e.g., `https://money-lender-frontend.vercel.app`).
4.  **Save Changes**. Render will automatically redeploy.

## Done! 🚀
Your application should now be live. Open the Vercel URL to test it.

---

### Troubleshooting
- **CORS Errors**: If you see CORS errors in the browser console, ensure the `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slashes).
- **Network Errors**: If the frontend says it cannot connect, check that `VITE_API_URL` in Vercel is correct and starts with `https://`.
