# Chromium Issues A² (Chromium Issues Auto Analysis)

<div align="center">
  <img src="src/app/favicon.ico" alt="CIAA Logo" width="100" height="100">
  <h3>Chromium Issues A²</h3>
  <p>A modern web application for visualizing and analyzing Chromium security issues</p>
</div>

## Overview

 Chromium Issues A² is a web application designed to help security researchers, developers, and analysts visualize and explore Chromium security issues data. The application provides an intuitive interface for searching, filtering, and analyzing security vulnerabilities in the Chromium browser.

## Features

- **Dashboard**: Get a quick overview of security issues with statistics and visualizations
- **Search Functionality**: Search by CVE ID, issue ID, component, version, and vulnerability type
- **Advanced Filtering**: Filter issues by severity, priority, status, component, OS, and vulnerability type
- **Detailed Analysis**: View comprehensive details about each security issue

## Technology Stack

- **Frontend**: Next.js 15 with Turbopack, React, and Tailwind CSS
- **Backend**: FastAPI with Python
- **UI Design**: Material Design 3 principles

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Python 3.8 or higher (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ciaa-frontend.git
   cd ciaa-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.