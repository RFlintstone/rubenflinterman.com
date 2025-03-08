import React from "react";

export default interface IAppProps {
    mode: 'light' | 'dark';
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}