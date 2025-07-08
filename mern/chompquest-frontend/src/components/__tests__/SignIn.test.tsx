import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SignIn from '../SignIn'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in form', () => {
    renderWithRouter(<SignIn />)
    
    expect(screen.getByText('Welcome to ChompQuest!')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows "Please fill out this field." when no fields are inputted', async () => {
    renderWithRouter(<SignIn />)
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    fireEvent.click(submitButton)
    
    // Check for HTML5 validation message
    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement
    expect(usernameInput.validity.valueMissing).toBe(true)
  })

  it('shows "Please fill out this field." when username is filled but password is empty', async () => {
    renderWithRouter(<SignIn />)
    
    const usernameInput = screen.getByLabelText('Username')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.click(submitButton)
    
    // Check for HTML5 validation message on password field
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    expect(passwordInput.validity.valueMissing).toBe(true)
  })

  it('shows "Please fill out this field." when password is filled but username is empty', async () => {
    renderWithRouter(<SignIn />)
    
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // Check for HTML5 validation message on username field
    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement
    expect(usernameInput.validity.valueMissing).toBe(true)
  })

  it('shows sign up link that redirects to signup page', () => {
    renderWithRouter(<SignIn />)
    
    const signUpLink = screen.getByText('Sign Up')
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup')
  })

  it('submits form with valid data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    })
    ;(window as any).fetch = mockFetch

    renderWithRouter(<SignIn />)
    
    const usernameInput = screen.getByLabelText('Username')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5050/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
      })
    })
  })
}) 