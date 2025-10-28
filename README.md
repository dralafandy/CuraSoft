# CuraSoft - Dental Clinic Management System

This is a modern, responsive web application for managing a dental clinic named CuraSoft. It's built with React and TypeScript and uses Tailwind CSS for styling. The application runs entirely in the browser and uses `localStorage` for data persistence.

## Features

- **Patient Management:** Add, edit, and view patient details, including medical history, contact information, and financial records.
- **Appointment Scheduler:** A visual calendar to schedule and manage appointments for different dentists.
- **Doctor Management:** Manage a list of dentists in the clinic.
- **Financial Tracking:** Includes modules for managing expenses, treatment pricing, supplier invoices, and patient payments.
- **Inventory Management:** Track clinic supplies and materials.
- **Lab Case Tracking:** Manage dental lab cases sent for patients.
- **Reporting:** Generate reports on patient statistics, financials, and more.
- **Data Persistence:** All data is saved in your browser's `localStorage`, allowing you to close and reopen the app without losing information.
- **Backup & Restore:** Easily backup all your clinic data to a file and restore it later.
- **Multi-language Support:** Supports both Arabic (RTL) and English.

## How to Use

1.  Clone this repository to your local machine.
2.  Open the `index.html` file in your web browser.

That's it! The application is designed to run directly from the files without needing a build step or a local server.

## Deployment to GitHub Pages

This repository is configured for automatic deployment to GitHub Pages.

### Setup Instructions

1.  **Go to Repository Settings:** In your GitHub repository, navigate to `Settings` > `Pages`.
2.  **Select Deployment Source:** Under "Build and deployment", for the "Source" option, select **GitHub Actions**.
3.  **Push a Change:** Make any small change to the `main` branch (e.g., update this README) and push it to GitHub.
4.  **Check Actions:** Go to the `Actions` tab in your repository. You should see a workflow named "Deploy static content to Pages" running.
5.  **Access Your Site:** Once the workflow is complete, your application will be live at the URL provided in the `github-pages` environment (e.g., `https://<your-username>.github.io/<repository-name>/`). You can find this URL in the `Settings` > `Pages` section as well.

The workflow is defined in `.github/workflows/deploy.yml`. It automatically triggers on every push to the `main` branch, building and deploying the static content of this repository.
