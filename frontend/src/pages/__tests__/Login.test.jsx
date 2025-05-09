import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { BrowserRouter } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { auth, db } from '../../firebase/firebaseConfig';

// Mock toast and navigation
vi.mock('react-toastify', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
  }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Firebase methods
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    signInWithEmailAndPassword: vi.fn(),
    getAuth: vi.fn(() => ({})), // 👈 mock getAuth
  };
});
  

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getDoc: vi.fn(),
    doc: vi.fn(),
  };
});
  

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form inputs', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('does not submit the form if email or password is empty', async () => {
    // Render the component
    const { container } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Get the form element
    const form = container.querySelector('form');
    
    // Set empty values for inputs
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '' } });
    
    // Submit the form directly to bypass HTML validation
    fireEvent.submit(form);
    
    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText(/please fill out all fields/i)).toBeInTheDocument();
    });
    
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
  

  it('logs in and navigates student to timer', async () => {
    const fakeUser = { uid: '123' };
    signInWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'student' }),
    });
    doc.mockReturnValue('docRef');

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/timer');
    });
  });

  it('logs in and navigates parent to parent dashboard', async () => {
    const fakeUser = { uid: '456' };
    signInWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'parent' }),
    });
    doc.mockReturnValue('docRef');
  
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'parent@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
  
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/parent-dashboard');
    });
  });

  it('logs in and navigates admin to admin dashboard', async () => {
    const fakeUser = { uid: '789' };
    signInWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' }),
    });
    doc.mockReturnValue('docRef');
  
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'adminpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
  
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
    });
  });

  it('shows error if login fails', async () => {
    signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(screen.getByText(/error: invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows success toast on successful login', async () => {
    const fakeUser = { uid: '123' };
    signInWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'student' }),
    });
  
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
  
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/timer');
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
    });
  });
});
