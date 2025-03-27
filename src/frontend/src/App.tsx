import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Report from "./pages/Report";
import GetStarted from "./pages/GetStarted";
import ForgotPassword from './pages/ForgotPassword';
import {AuthProvider, Protected} from "./components/AuthProvider";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="App">
                    <Routes>
                        <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
                        <Route path="/faq" element={<FAQ/>}/>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/report" element={<Protected><Report/></Protected>}/>
                        <Route path="/get-started" element={<Protected><GetStarted/></Protected>}/>
                        <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
