import React from 'react';
import Cookies from 'js-cookie';
import './App.css';

class App extends React.Component {
    state = {
        users: [],
        isLoggedIn: false,
        isRegistered: false,
        loginEmail: '',
        loginPassword: '',
        registerData: {
            firstName: '',
            lastName: '',
            email: '',
            department: '',
            password: ''
        },
        error: null
    };

    componentDidMount() {
        const registeredEmails = JSON.parse(localStorage.getItem('registeredEmails') || '[]');
        this.setState({ isRegistered: registeredEmails.length > 0 });
    }

    handleInputChange = (e, type) => {
        const { name, value } = e.target;
        
        if (type === 'login') {
            this.setState({ [name]: value });
        } else if (type === 'register') {
            this.setState(prevState => ({
                registerData: {
                    ...prevState.registerData,
                    [name]: value
                }
            }));
        }
    };

    login = async (e) => {
        e.preventDefault();
        const { loginEmail, loginPassword } = this.state;
        const registeredEmails = JSON.parse(localStorage.getItem('registeredEmails') || '[]');

        if (!registeredEmails.includes(loginEmail)) {
            this.setState({ error: 'Email not registered. Please register first.' });
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });

            const data = await response.json();

            if (response.ok) {
                Cookies.set('token', data.token);
                this.setState({ 
                    isLoggedIn: true, 
                    error: null 
                });
                this.fetchUsers(data.token);
            } else {
                this.setState({ error: data.error });
            }
        } catch (error) {
            this.setState({ error: 'Login failed' });
        }
    };

    register = async (e) => {
        e.preventDefault();
        const { registerData } = this.state;

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store registered emails in localStorage
                const registeredEmails = JSON.parse(localStorage.getItem('registeredEmails') || '[]');
                registeredEmails.push(registerData.email);
                localStorage.setItem('registeredEmails', JSON.stringify(registeredEmails));

                this.setState({ 
                    error: null,
                    isRegistered: true,
                    registerData: {
                        firstName: '',
                        lastName: '',
                        email: '',
                        department: '',
                        password: ''
                    }
                });
                alert('Registration successful! Please login.');
            } else {
                this.setState({ error: data.error });
            }
        } catch (error) {
            this.setState({ error: 'Registration failed' });
        }
    };

    toggleRegistration = () => {
        this.setState(prevState => ({
            isRegistered: !prevState.isRegistered,
            error: null
        }));
    };

    fetchUsers = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/users', {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.setState({ users: data, error: null });
            } else {
                this.setState({ error: 'Failed to fetch users' });
            }
        } catch (error) {
            this.setState({ error: 'Network error' });
        }
    };

    render() {
        const { 
            isLoggedIn, 
            isRegistered,
            // eslint-disable-next-line 
            users, 
            error, 
            loginEmail, 
            loginPassword,
            registerData 
        } = this.state;

        return (
            <div className="App">
                {!isLoggedIn ? (
                    <div className="auth-container">
                        {isRegistered ? (
                            <div className="login-form">
                                <h2>Login</h2>
                                {error && <p className="error">{error}</p>}
                                <form onSubmit={this.login}>
                                    <input
                                        type="email"
                                        name="loginEmail"
                                        placeholder="Email"
                                        value={loginEmail}
                                        onChange={(e) => this.handleInputChange(e, 'login')}
                                        required
                                    />
                                    <input
                                        type="password"
                                        name="loginPassword"
                                        placeholder="Password"
                                        value={loginPassword}
                                        onChange={(e) => this.handleInputChange(e, 'login')}
                                        required
                                    />
                                    <button type="submit">Login</button>
                                    <p className="toggle-link" onClick={this.toggleRegistration}>
                                        Not registered? Register here
                                    </p>
                                </form>
                            </div>
                        ) : (
                            <div className="register-form">
                                <h2>Register</h2>
                                {error && <p className="error">{error}</p>}
                                <form onSubmit={this.register}>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={registerData.firstName}
                                        onChange={(e) => this.handleInputChange(e, 'register')}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={registerData.lastName}
                                        onChange={(e) => this.handleInputChange(e, 'register')}
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={registerData.email}
                                        onChange={(e) => this.handleInputChange(e, 'register')}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="department"
                                        placeholder="Department"
                                        value={registerData.department}
                                        onChange={(e) => this.handleInputChange(e, 'register')}
                                        required
                                    />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={registerData.password}
                                        onChange={(e) => this.handleInputChange(e, 'register')}
                                        required
                                    />
                                    <button type="submit">Register</button>
                                    <p className="toggle-link" onClick={this.toggleRegistration}>
                                        Already registered? Login here
                                    </p>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="users-container">
                        {/* Existing users container code remains the same */}
                    </div>
                )}
            </div>
        );
    }
}

export default App;