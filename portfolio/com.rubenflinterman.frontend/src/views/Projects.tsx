import React from "react";
import {Box, Typography} from "@mui/material";
import Grid from '@mui/material/Grid2';
import GradientContainer from "../theme/GradientContainer";
import GlassEffect from "../theme/GlassEffect";

interface ThemeProps {
    mode: "light" | "dark";
}

const Projects: React.FC<ThemeProps> = ({mode}) => {
    return (
        <>
            <GradientContainer>
                <GlassEffect
                    sx={{
                        position: "relative", // Remove absolute positioning
                        width: "90vw", // Slightly smaller width for mobile
                        height: "auto", // Let the height adjust dynamically
                        marginTop: "7vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center", // Center vertically
                        alignItems: "center", // Center horizontally
                        mx: "auto", // Center horizontally in the viewport
                        overflow: "auto",
                        '&::-webkit-scrollbar': {
                            width: '12px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: mode === 'light' ? 'rgba(136, 136, 136, 0.6)' : 'rgba(68, 68, 68, 0.6)',
                            borderRadius: '6px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: mode === 'light' ? 'rgba(85, 85, 85, 0.8)' : 'rgba(34, 34, 34, 0.8)',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: mode === 'light' ? 'rgba(241, 241, 241, 0.4)' : 'rgba(51, 51, 51, 0.6)',
                            borderRadius: '6px',
                        },
                    }}
                >
                    <Box
                        sx={{
                            p: 5,
                            height: {xs: "85vh", sm: "70vh", md: "80vh", lg: "80vh", xl: "77vh"}, // Allow the Box height to grow dynamically
                            display: "flex", // Use flex to align grid inside
                            flexDirection: "column",
                            maxHeight: "-webkit-fill-available",
                        }}
                    >
                        <Grid container spacing={5} alignItems="center" justifyContent="center">
                            <Grid
                                size={{xs: 12, sm: 8, md: 8, lg: 9, xl: 9}} // Adjusted for all screen sizes
                            >
                                <Typography variant="h3" gutterBottom textAlign="left" fontWeight="bold" sx={{mb: 1}}>
                                    My Projects
                                </Typography>
                                <Box sx={{mb: 2}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', width: 'fit-content'}}>
                                        <Typography variant="h5" textAlign="left" fontWeight="bold">
                                            Patiënt-ID/Expert-By-Experience, sponsored by Sogeti
                                        </Typography>
                                        {/*<Typography variant="body1" fontSize="0.87rem" textAlign="right"*/}
                                        {/*            fontWeight="bold" alignContent="end">*/}
                                        {/*    Apr 2023 - Jul 2023*/}
                                        {/*</Typography>*/}
                                    </Box>
                                    <Typography variant="body1" textAlign="left">
                                        The Patiënt-ID/Expert-By-Experience project, sponsored by Sogeti, is currently
                                        in the research phase and has not yet moved to the coding stage. The project
                                        focuses on two innovative concepts aimed at improving patient care and data
                                        management. The Patiënt-ID system is designed to simplify the management and
                                        sharing of medical data, making it easily accessible to both patients and
                                        healthcare providers without the burden of complex login procedures or
                                        unnecessary administration. This system will comply with existing standards like
                                        MedMij and GDPR. The Expert-By-Experience platform will provide a secure space
                                        for patients to share their experiences and access verified information from
                                        trusted sources such as Erasmus UMC and WHO. The project is still in
                                        development, with ongoing market research, expert interviews, and technical
                                        evaluations to guide the design of solutions that enhance healthcare
                                        accessibility and quality, particularly for individuals with disabilities.
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', width: 'fit-content'}}>
                                        <Typography variant="h5" textAlign="left" fontWeight="bold">
                                            CargoHub
                                        </Typography>
                                        {/*<Typography variant="body1" fontSize="0.87rem" textAlign="right"*/}
                                        {/*            fontWeight="bold" alignContent="end">*/}
                                        {/*    Apr 2023 - Jul 2023*/}
                                        {/*</Typography>*/}
                                    </Box>
                                    <Typography variant="body1" textAlign="left">
                                        CargoHub is a project developed as part of my studies, where we rewrote an
                                        existing logistics management system. Originally built in Python, the system was
                                        redeveloped in C# and enhanced with a custom-built JWT-based permission system.
                                        The project simulated a production environment, ensuring that both the old and
                                        new versions of the system could run in parallel and sync data for clients
                                        transitioning between versions. Hosted in a scalable Kubernetes environment, the
                                        project successfully maintained a 99% Service Level Agreement (SLA) throughout
                                        its development.
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', width: 'fit-content'}}>
                                        <Typography variant="h5" textAlign="left" fontWeight="bold">
                                            Airline Booking System
                                        </Typography>
                                        {/*<Typography variant="body1" fontSize="0.87rem" textAlign="right"*/}
                                        {/*            fontWeight="bold" alignContent="end">*/}
                                        {/*    Apr 2023 - Jul 2023*/}
                                        {/*</Typography>*/}
                                    </Box>
                                    <Typography variant="body1" textAlign="left">
                                        This project was a project for my study where we needed to make a booking system
                                        for the terminal, with C#. This system would need to include Unit Tests and
                                        beyond the expectations of the study I've made a complete mockconsole. This
                                        solution simulated the functionalies from 'System.Console' which made Github
                                        Actions able to run all our tests, including GUI tests, instead. This saved our
                                        project group hours of work.
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', width: 'fit-content'}}>
                                        <Typography variant="h5" textAlign="left" fontWeight="bold">
                                            PostForward
                                        </Typography>
                                        {/*<Typography variant="body1" fontSize="0.87rem" textAlign="right"*/}
                                        {/*            fontWeight="bold" alignContent="end">*/}
                                        {/*    Apr 2023 - Jun 2023*/}
                                        {/*</Typography>*/}
                                    </Box>
                                    <Typography variant="body1" textAlign="left">
                                        This project was a fun, quick, project where I made a simple redirect system
                                        using only ExpressJS. The problem was that we had around 5 different nodes which
                                        each had their own API implementation as they were made by different development
                                        teams. This custom adapter I wrote was the perfect fit as this made us able to
                                        communicate to any outside server which allowed POST requests.
                                    </Typography>
                                </Box>
                                <Box sx={{mb: 2}}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', width: 'fit-content'}}>
                                        <Typography variant="h5" textAlign="left" fontWeight="bold">
                                            Serverless-AWS-GCP
                                        </Typography>
                                        {/*<Typography variant="body1" fontSize="0.87rem" textAlign="right"*/}
                                        {/*            fontWeight="bold" alignContent="end">*/}
                                        {/*    Apr 2020 - Jul 2020*/}
                                        {/*</Typography>*/}
                                    </Box>
                                    <Typography variant="body1" textAlign="left">
                                        Serverless-AWS-GCP was the project I needed to create for my internship from my
                                        1st study. The thought was that the company I worked for at the time liked to
                                        explore different cloud solutions to see if one of them would be a viable
                                        alternative for customer data. The goal was to be able to easily switch between
                                        cloud providers in case it was needed. That's why I created a serverless adapter
                                        which you can change from 'mode' to deploy the same data somewhere else within a
                                        reasonable timeframe. This was an awesome project to work on considering I never
                                        really touched cloud solutions. I finished my internship with a 10 out of a
                                        possible 10.
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </GlassEffect>
            </GradientContainer>
        </>
    );
};

export default Projects;
