# KEC Shield - Termination Without Cause Documentation System

KEC Shield is a web-based application designed to help organizations document and manage Termination Without Cause (TWC) incidents. It provides a structured approach to gathering the necessary documentation and evidence for employment termination decisions.

## Features

- **Incident Logging**: Record detailed incident information with date, time, crew assignment, and category classification
- **Multiple Categories**: Supports various termination categories including:
  - Attendance Violations
  - Insubordination
  - Safety Violations
  - Job Abandonment
  - Policy Violations
  - Theft or Dishonesty
  - Harassment or Conduct
  - Drug or Alcohol Violations
  - Excessive Performance Issues
  - Voluntary Quit

- **Documentation Tracking**: Manages required documentation for each incident type
- **Dashboard View**: Overview of all recorded incidents with risk level indicators
- **Export Functionality**: Generate comprehensive TWC reports

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── main.tsx          # React entry point
├── App.tsx           # Main app component wrapper
├── KecShield.tsx     # Main KecShield component
└── index.css         # Global styles
index.html           # HTML template
vite.config.ts       # Vite build configuration
tsconfig.json        # TypeScript configuration
package.json         # Project dependencies
```

## Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling (via inline styles)

## Deployment

The application is configured for deployment on GitHub Pages or any static hosting platform.

### GitHub Pages Deployment

1. Build the application: `npm run build`
2. The `dist` folder contains the static files ready for deployment
3. Configure your GitHub repository settings to deploy from the `dist` folder

## License

All rights reserved.
