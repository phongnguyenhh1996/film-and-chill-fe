import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/appRouter";
import ErrorBoundary from "./resuableComponents/errorBoundary/ErrorBoundary";
import NavBar from "./resuableComponents/navbar/navbar";

const App = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <NavBar>
                    <AppRouter />    
                </NavBar>
            </ErrorBoundary>
        </BrowserRouter>
    )
}

export default App;