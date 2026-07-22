import React, { useState } from 'react';
import { Google as GoogleIcon } from '@mui/icons-material';
import { Alert, Box, Button, Divider, Stack, TextField } from '@mui/material';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
            });

            navigate('/dashboard');
        } catch (signupError) {
            console.log(signupError);
            setError(signupError.message);
        }
    };

    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        setError('');

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName || name || 'New user',
                email: user.email,
            });

            navigate('/dashboard');
        } catch (signupError) {
            console.log(signupError);
            setError(signupError.message);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Set up Trackify once and start logging expenses, goals, and savings in a single place."
            helperTitle="Sign up"
            helperText="Use your name, email, and a password to get started in minutes."
            eyebrow="Trackify"
        >
            <Box component="form" onSubmit={handleSignup}>
                <Stack spacing={2}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                        fullWidth
                    />
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
                        autoComplete="new-password"
                        required
                        fullWidth
                    />

                    <Button type="submit" variant="contained" size="large" fullWidth sx={{ py: 1.4, fontWeight: 700 }}>
                        Create Account
                    </Button>

                    <Divider sx={{ my: 0.5 }}>or</Divider>

                    <Button
                        onClick={handleGoogleSignup}
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<GoogleIcon />}
                        sx={{ py: 1.2, fontWeight: 700 }}
                    >
                        Continue with Google
                    </Button>

                    <Box sx={{ textAlign: 'center', pt: 1 }}>
                        <Link to="/login" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
                            Already have an account? Log in
                        </Link>
                    </Box>
                </Stack>
            </Box>
        </AuthLayout>
    );
};

export default Signup;
