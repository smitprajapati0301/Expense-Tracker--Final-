import React, { useState } from 'react';
import { Google as GoogleIcon } from '@mui/icons-material';
import { Alert, Box, Button, Divider, Stack, TextField } from '@mui/material';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import AuthLayout from './AuthLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (loginError) {
            console.error(loginError);
            setError(loginError.message);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setError('');

        try {
            await signInWithPopup(auth, provider);
            navigate('/dashboard');
        } catch (loginError) {
            console.error(loginError);
            setError(loginError.message);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to review your spending, manage budgets, and keep your dashboard in sync."
            helperTitle="Login"
            helperText="Use your email or Google account to continue."
            eyebrow="Trackify"
        >
            <Box component="form" onSubmit={handleLogin}>
                <Stack spacing={2}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        fullWidth
                    />

                    <Button type="submit" variant="contained" size="large" fullWidth sx={{ py: 1.4, fontWeight: 700 }}>
                        Log In
                    </Button>

                    <Divider sx={{ my: 0.5 }}>or</Divider>

                    <Button
                        onClick={handleGoogleLogin}
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<GoogleIcon />}
                        sx={{ py: 1.2, fontWeight: 700 }}
                    >
                        Continue with Google
                    </Button>

                    <Box sx={{ textAlign: 'center', pt: 1 }}>
                        <Link to="/signup" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
                            Don&apos;t have an account? Sign up
                        </Link>
                    </Box>
                </Stack>
            </Box>
        </AuthLayout>
    );
};

export default Login;