import '@testing-library/jest-dom'

// Mock window.location for routing tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
  },
  writable: true,
}) 