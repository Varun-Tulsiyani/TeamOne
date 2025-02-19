import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import DetailReport from "./pages/DetailReport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Report from "./pages/Report";
import GetStarted from "./pages/GetStarted";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/dashboard" element={<Dashboard className={undefined}/>}/>
                    <Route path="/report/detail" element={<DetailReport className={undefined}/>}/>
                    <Route path="/faq" element={<FAQ className={undefined}/>}/>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/report" element={<Report className={undefined}/>}/>
                    <Route path="/get-started" element={<GetStarted className={undefined} />}/>
                    {/*
                    <Route path="/" element={<Home />}/>
                    <Route path="/" element={<Home />}/>
                    <Route path="/" element={<Home />}/>
*/}
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
