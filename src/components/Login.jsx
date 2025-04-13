import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBInput,
    MDBIcon,
    MDBNavbar,
    MDBContainer as MDBNavContainer,
    MDBNavbarBrand
} from 'mdb-react-ui-kit';
import track from '../assets/1.png';
    

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
<>
 {/* Header */}
            <MDBNavbar light bgColor='dark' className='shadow-sm'>
                <MDBNavContainer fluid>
                    <MDBNavbarBrand href='/' className='text-white fw-bold fs-4'>
                      <img
                        className="max-h-10 mt-1 w-auto align-middle"
                        src={track}
                        alt="Trackify"
                      />
                    </MDBNavbarBrand>
                </MDBNavContainer>
            </MDBNavbar>

        
        <MDBContainer fluid>
            <MDBRow className='d-flex justify-content-center align-items-center h-100'>
                <MDBCol col='12'>
                    <MDBCard className='bg-dark text-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '400px' }}>
                        <MDBCardBody className='p-5 d-flex flex-column align-items-center mx-auto w-100'>
                            <h2 className='fw-bold mb-2 text-uppercase'>Log In</h2>
                            <p className='text-white-50 mb-4'>Sign in to your account</p>

                            <form onSubmit={handleLogin} className='w-100'>
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
                                    Log In
                                </MDBBtn>
                            </form>

                            <p className='text-white-50 mt-3'>or</p>

                            <MDBBtn
                                onClick={handleGoogleLogin}
                                className='w-100 mt-2'
                                color='danger'
                                size='lg'
                            >
                                <MDBIcon fab icon='google' className='me-2' />
                                Log In with Google
                            </MDBBtn>

                            
                            <div className='mt-4'>
                                <p className='mb-0'>
                                    Don't have an account?{' '}
                                    <a href='/' className='text-white-50 fw-bold'>
                                        Sign Up
                                    </a>
                                </p>
                            </div>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
        </>
    );
};

export default Login;