import React from "react";
import GradientContainer from "../theme/GradientContainer";
import {Box, Typography} from "@mui/material";

const NotFound: React.FC = () => {
    return (
        <>
            <GradientContainer>
                <Box sx={{flexGrow: 1}}>
                    <Box
                        sx={{
                            position: 'relative',
                            mt: 'calc(var(--template-frame-height, 0px) + 350px)',
                            left: '1vw',
                            display: 'flex',
                            flexDirection: 'row', // Change to row layout for horizontal alignment
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '2rem', // Add space between text and image
                            textAlign: 'center',
                        }}
                    >
                        <Box sx={{flexDirection: 'column', display: 'flex', alignItems: 'center'}}>
                            <Typography
                                variant="h1"
                                color="inherit"
                                component="h1"
                                sx={{
                                    display: 'inline',
                                    padding: 0,
                                    margin: 0,
                                    fontSize: {xs: '2rem', sm: '4rem', md: '6rem'},
                                }}
                            >
                                404 Not Found
                            </Typography>
                            <Typography
                                variant="h4"
                                color="inherit"
                                component="h2"
                                sx={{
                                    display: 'inline',
                                    padding: 0,
                                    margin: 0,
                                    fontSize: {xs: '1.5rem', sm: '2rem', md: '3rem'},
                                    fontStyle: 'italic',
                                    mt: 2,
                                    wordBreak: 'break-word', // Ensure text breaks when needed
                                    textAlign: 'center', // Centers the text
                                    maxWidth: '60rem',
                                }}
                            >
                                Where did the page go?
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </GradientContainer>
        </>
    );
};

export default NotFound;