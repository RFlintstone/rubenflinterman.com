import React from "react";
import {Box, CardMedia, Chip, Typography} from "@mui/material";
import Grid from '@mui/material/Grid2';
import GradientContainer from "../theme/GradientContainer";
import GlassEffect from "../theme/GlassEffect";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TranslateIcon from '@mui/icons-material/Translate';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

interface ThemeProps {
    mode: "light" | "dark";
}

const About: React.FC<ThemeProps> = ({mode}) => {
    return (
        <>
            <GradientContainer>
                <GlassEffect
                    sx={{
                        position: "relative", // Remove absolute positioning
                        width: "90vw", // Slightly smaller width for mobile
                        height: "auto", // Let the height adjust dynamically
                        marginTop: {xs: "32vh", sm: "7vh"},
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
                        <Grid container spacing={5} alignItems="flex-start" justifyContent="center">
                            {/* Left: Image */}
                            <Grid
                                size={{xs: 12, sm: 4, md: 4, lg: 3, xl: 3}} // Adjusted for all screen sizes
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    textAlign: "center",
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: "200px",  // Smaller size for mobile
                                        height: "200px", // Keep it a perfect circle
                                        borderRadius: "50%", // Makes it a circle
                                        objectFit: "cover", // Ensures the image fills the circle properly
                                    }}
                                    image="RubenFlinterman.png"
                                    alt="Ruben Flinterman"
                                />
                                <br/>
                                <Box sx={{display: 'flex', justifyContent: 'center', marginBottom: 1}}>
                                    <LocationOnIcon sx={{marginRight: 1}}/>
                                    <Typography>Europe/Rotterdam</Typography>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'center', marginBottom: 1}}>
                                    <TranslateIcon sx={{marginRight: 1}}/>
                                    <Typography>Dutch, English</Typography>
                                </Box>
                            </Grid>

                            {/* Right: Text Content */}
                            <Grid
                                size={{xs: 12, sm: 8, md: 8, lg: 9, xl: 9}} // Adjusted for all screen sizes
                            >
                                <Typography variant="h3" gutterBottom textAlign="left" fontWeight="bold" sx={{mb: 1}}>
                                    Ruben Flinterman
                                </Typography>
                                <Box sx={{mb: 2}}>
                                    <Typography variant="h4" textAlign="left" fontWeight="bold">
                                        Full-Stack Developer
                                    </Typography>
                                    <Chip
                                        avatar={<LinkedInIcon/>}
                                        label="LinkedIn"
                                        variant="outlined"
                                        onClick={() => window.open("https://www.linkedin.com/in/ruben-flinterman/", "_blank")}
                                        sx={{
                                            fontSize: "1rem",
                                            height: "38px",
                                            padding: "0 7px",
                                            marginTop: "1vh",
                                        }}
                                    />
                                    <Chip
                                        avatar={<GitHubIcon/>}
                                        label="GitHub"
                                        variant="outlined"
                                        onClick={() => window.open("https://github.com/RFlintstone", "_blank")}
                                        sx={{
                                            fontSize: "1rem",
                                            height: "38px",
                                            padding: "0 7px",
                                            marginTop: "1vh",
                                            marginLeft: "0.5vh",
                                        }}
                                    />
                                </Box>
                                <Box sx={{mb: 2}}>
                                    <Typography variant="body1" textAlign="left">
                                        I’m Ruben Flinterman, a dedicated Computer Science student from Rotterdam
                                        University of Applied Sciences, based in the vibrant city of Rotterdam,
                                        Netherlands. Currently, I am fully immersed in my studies, with a strong focus
                                        on advancing my knowledge in the field of computer science and software
                                        development.<br/><br/>
                                        Previously, I had the opportunity to work as a software developer and student
                                        researcher at both Datalab Rotterdam and the Department of Chemical Engineering.
                                        During my time at these institutions, I developed tailored software solutions
                                        aimed at automating and optimizing repetitive tasks, ultimately enhancing
                                        workflow efficiency. At Chemical Engineering, I also had the privilege of
                                        co-authoring a research paper, which is currently in the process of being
                                        published.<br/><br/>
                                        Throughout the years, I’ve had the chance to take part in several competitions
                                        with friends, which resulted in us winning some exciting prizes in 2019, 2022,
                                        and 2023. These experiences have only deepened my passion for creative
                                        problem-solving and innovation. Outside of my studies, I also devote time to
                                        personal projects, where I can experiment with new ideas and continue to refine
                                        my skills.<br/><br/>
                                        I have am proficient in programming languages and tools including C#, Java,
                                        TypeScript (NodeJS), and Docker, which I have used extensively in various projects. In
                                        addition to these, I am also familiar with Python, C++, PHP, and SQL, and have gained
                                        hands-on experience working with container orchestration platforms like
                                        Kubernetes (both K8S and K3S). These skills allow me to develop scalable and
                                        efficient solutions across a range of technologies.<br/><br/>
                                        I am always eager to expand my skill set and deepen my knowledge. My approach to
                                        learning involves exploring multiple languages and technologies at once to gain
                                        a broad understanding, but once I feel comfortable, I focus on mastering that
                                        aspect. This method allows me to build a solid foundation in various
                                        technologies before dedicating myself fully to becoming an expert in a specific
                                        area.
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

export default About;
