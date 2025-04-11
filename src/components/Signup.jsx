import React, { useState } from 'react';
import { auth, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBInput,
    MDBIcon,
} from 'mdb-react-ui-kit';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: name,
                email: email,
            });

            navigate('/Hello');
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
            navigate('/Hello');
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return (
        <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>
                    <MDBCard className='bg-dark text-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '400px' }}>
                        <MDBCardBody className='p-5 d-flex flex-column align-items-center mx-auto w-100'>
                            <h2 className='fw-bold mb-2 text-uppercase'>Sign Up</h2>
                            <p className='text-white-50 mb-4'>Create your account</p>

                            <form onSubmit={handleSignup} className='w-100'>
                                <MDBInput
                                    wrapperClass='mb-4 mx-1 w-100'
                                    labelClass='text-white'
                                    label='Full Name'
                                    type='text'
                                    size='lg'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <MDBInput
                                    wrapperClass='mb-4 mx-1 w-100'
                                    labelClass='text-white'
                                    label='Email'
                                    type='email'
                                    size='lg'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <MDBInput
                                    wrapperClass='mb-4 mx-1 w-100'
                                    labelClass='text-white'
                                    label='Password'
                                    type='password'
                                    size='lg'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <MDBBtn outline className='mx-2 w-100' color='white' size='lg' type='submit'>
                                    Sign Up
                                </MDBBtn>
                            </form>

                            <p className='text-white-50 mt-3'>or</p>

                            <MDBBtn
                                onClick={handleGoogleSignup}
                                className='w-100 mt-2'
                                color='danger'
                                size='lg'
                            >
                                <MDBIcon fab icon='google' className='me-2' />
                                Sign Up with Google
                            </MDBBtn>

                            <div className='mt-4'>
                                <p className='mb-0'>
                                    Already have an account?{' '}
                                    <Link to='/login' className='text-white-50 fw-bold'>
                                        Log In
                                    </Link>
                                </p>
                            </div>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default Signup;
