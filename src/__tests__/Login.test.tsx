import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '@/pages/Login';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

describe('Login Component', () => {
  it('renders login form', () => {
    const { getByText, getByLabelText } = render(<Login />, { wrapper: Wrapper });
    expect(getByText('Admin Portal')).toBeInTheDocument();
    expect(getByLabelText('Email')).toBeInTheDocument();
    expect(getByLabelText('Password')).toBeInTheDocument();
  });

  it('allows user to type credentials', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<Login />, { wrapper: Wrapper });
    const emailInput = getByLabelText('Email') as HTMLInputElement;
    const passwordInput = getByLabelText('Password') as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('has submit button', () => {
    const { getByRole } = render(<Login />, { wrapper: Wrapper });
    const submitButton = getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
  });
});
