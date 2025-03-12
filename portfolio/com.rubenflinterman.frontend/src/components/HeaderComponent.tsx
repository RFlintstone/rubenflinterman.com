import React, {useEffect} from "react";
import {AppBar, Button, Container, styled, Switch, Toolbar, Typography,} from "@mui/material";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import {useLocation} from "react-router-dom";
import GlassEffect from "../theme/GlassEffect";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    flexShrink: 0,
    flexDirection: "column", // Stack buttons on small screens
    gap: theme.spacing(1), // Add spacing between stacked items
    [theme.breakpoints.up("sm")]: {
        flexDirection: "row", // Row layout on larger screens
        gap: 0,
    },
}));


const HeaderComponent: React.FC<{ mode: string; setMode: (mode: "light" | "dark") => void; setHeaderHeight: (height: number) => void }> = ({ mode, setMode, setHeaderHeight }) => {
    const [pageName, setPageName] = React.useState<string | undefined>(undefined);
    const toggleTheme = () => setMode(mode === "light" ? "dark" : "light");
    // const [, setHeaderHeight] = useState<number>(0);

    const location = useLocation();

    useEffect(() => {
        let currentPage: string | undefined = location.pathname;
        if (currentPage === "/") currentPage = "Home";
        else currentPage = currentPage.split("/").pop();

        if (currentPage) currentPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

        setPageName(currentPage?.replaceAll("-", " "));
    }, [location]);

    useEffect(() => {
        const updateHeaderHeight = () => {
            const header = document.getElementById("header-component");
            if (header) setHeaderHeight(header.offsetHeight);
        };

        updateHeaderHeight();
        window.addEventListener("resize", updateHeaderHeight);
        return () => window.removeEventListener("resize", updateHeaderHeight);
    }, [setHeaderHeight]);

    return (
        <>
            <AppBar
                id="header-component"
                position="fixed"
                sx={{
                    boxShadow: "none",
                    bgcolor: "transparent",
                    backgroundImage: 'none',
                    zIndex: 1200,
                    paddingTop: "0.5%",
                }}
                color="default"
            >
                <Container maxWidth="lg">
                    <GlassEffect>
                        <StyledToolbar variant="dense" disableGutters sx={{height: "calc(100% + 1%)"}}>
                            <Typography variant="h6" component="div" sx={{flexGrow: 1}} color="textSecondary">
                                {pageName}
                            </Typography>
                            <Button color="inherit" variant="text" href="/">
                                <Typography variant="inherit" component="div" sx={{flexGrow: 1}} color="textSecondary">
                                    Home
                                </Typography>
                            </Button>
                            <Button color="inherit" variant="text" href="/about">
                                <Typography variant="inherit" component="div" sx={{flexGrow: 1}} color="textSecondary">
                                    About
                                </Typography>
                            </Button>
                            <Button color="inherit" variant="text" href="/projects">
                                <Typography variant="inherit" component="div" sx={{flexGrow: 1}} color="textSecondary">
                                    Projects
                                </Typography>
                            </Button>
                            <Switch
                                checked={mode === "dark"}
                                onChange={toggleTheme}
                                inputProps={{"aria-label": "controlled"}}
                                icon={<Brightness7Icon sx={{fontSize: 24, position: "relative", bottom: "2px"}}/>}
                                checkedIcon={<Brightness4Icon
                                    sx={{fontSize: 24, position: "relative", bottom: "2px"}}/>}
                            />
                        </StyledToolbar>
                    </GlassEffect>
                </Container>
            </AppBar>
        </>
    );
};

export default HeaderComponent;