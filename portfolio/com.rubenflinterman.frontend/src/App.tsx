import './App.css';
import React, {lazy} from 'react';
import IAppProps from "./components/IAppProps";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import FooterComponent from "./components/FooterComponent";

const Home = lazy(() => import('./views/Home'));
const About = lazy(() => import('./views/About'));
const Projects = lazy(() => import('./views/Projects'));
const PrivacyPolicy = lazy(() => import('./views/PrivacyPolicy'));
const NotFound = lazy(() => import('./views/NotFound'));

const App: React.FC<IAppProps> = ({mode, setMode}) => {
    const toggleTheme = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        sessionStorage.setItem('theme', newMode);
    };

    return (
        <>
            <BrowserRouter>
                <HeaderComponent mode={mode} setMode={toggleTheme}/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/about" element={<About/>}/>
                    <Route path="/projects" element={<Projects mode={sessionStorage.getItem("theme") as "light" | "dark" || "dark" }/>}/>
                    <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
                    {(
                        <Route path="*" element={<NotFound/>}/>
                    )}
                </Routes>
                <FooterComponent mode={mode} setMode={toggleTheme}/>
            </BrowserRouter>
        </>
    );
};

export default App;