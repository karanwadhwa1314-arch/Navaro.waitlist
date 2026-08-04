# Navaro - Transfer Pricing Reports Platform

A modern web application for automating transfer pricing reports, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Landing Page**: Comprehensive homepage with hero section, benchmark discovery, and feature highlights
- **Navigation**: Responsive navbar with mobile menu support
- **Pages**: Products, Resources, About, Contact, Sign Up, and Login pages
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean and professional interface using Tailwind CSS

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React**: UI library

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
Navaro/
├── app/
│   ├── about/
│   ├── contact/
│   ├── login/
│   ├── products/
│   ├── resources/
│   ├── signup/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Footer.tsx
│   └── Navbar.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Pages

- **Home** (`/`): Landing page with hero, benchmark discovery, and features
- **Products** (`/products`): Product offerings and features
- **Resources** (`/resources`): Helpful guides and documentation
- **About** (`/about`): Company information and mission
- **Contact** (`/contact`): Contact form and information
- **Sign Up** (`/signup`): User registration page
- **Login** (`/login`): User authentication page

## Development

The project uses:
- Next.js App Router for routing
- TypeScript for type safety
- Tailwind CSS for styling
- Client components for interactive elements

## License

This project is private and proprietary.

