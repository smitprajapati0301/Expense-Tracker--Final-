import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';

const Signup = () => {
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) navigate('/dashboard');
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, 'users', user.uid), { name, email });
            navigate('/dashboard');
        } catch (signupError) {
            console.log(signupError);
            setError(signupError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        setError('');
        setLoading(true);
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
        } finally {
            setLoading(false);
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
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Error alert */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: '#ffdad6',
                        color: '#93000a',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#424754', letterSpacing: '0.01em' }}>
                        Full name
                    </label>
                    <input
                        className="input-trackify"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        autoComplete="name"
                        required
                    />
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#424754', letterSpacing: '0.01em' }}>
                        Email address
                    </label>
                    <input
                        className="input-trackify"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#424754', letterSpacing: '0.01em' }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            className="input-trackify"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            autoComplete="new-password"
                            required
                            style={{ width: '100%', paddingRight: 40 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                color: '#727785',
                            }}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Primary CTA */}
                <button
                    className="btn-primary"
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: 8, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
                >
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#727785', fontSize: '0.8125rem' }}>
                    <div style={{ flex: 1, height: 1, background: '#c2c6d6' }} />
                    or
                    <div style={{ flex: 1, height: 1, background: '#c2c6d6' }} />
                </div>

                {/* Google */}
                <button
                    type="button"
                    className="btn-outlined"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>

                {/* Footer link */}
                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#424754', margin: '4px 0 0' }}>
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        style={{ color: '#0058be', fontWeight: 700, textDecoration: 'none' }}
                    >
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;
