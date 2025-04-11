import React, { useState } from 'react';
import { auth, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: name,
                email: email,
            });

            alert('Signup Successful');
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: user.displayName,
                email: user.email,
            });

            alert('Google Signup Successful');
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Sign Up</h2>
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Sign Up
                </button>
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="bg-red-500 text-white p-2 rounded"
                >
                    Sign Up with Google
                </button>
            </form>
        </div>
    );
};

export default Signup;
