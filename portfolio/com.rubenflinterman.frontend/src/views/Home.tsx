import React from "react";
import {Avatar, Box, Chip, Typography} from "@mui/material";
import GradientContainer from "../theme/GradientContainer";
import GlassEffect from "../theme/GlassEffect";

const Home: React.FC = () => {
    return (
        <>
            <GradientContainer>
                {/*<GlassEffect*/}
                {/*    sx={{*/}
                {/*        position: "relative", // Remove absolute positioning*/}
                {/*        width: "90vw", // Slightly smaller width for mobile*/}
                {/*        height: "80%",*/}
                {/*        marginTop: "7vh",*/}
                {/*        display: "flex",*/}
                {/*        flexDirection: "column",*/}
                {/*        justifyContent: "center", // Center vertically*/}
                {/*        alignItems: "center", // Center horizontally*/}
                {/*        mx: "auto", // Center horizontally in the viewport*/}
                {/*    }}*/}
                {/*>*/}
                    <Box
                        sx={{
                            p: 5,
                            height: "100%", // Ensures the Box takes full height
                            display: "flex", // Use flex to align grid inside
                            flexDirection: "column",
                            justifyContent: "center", // Center vertically
                            alignItems: "flex-start", // Center horizontally
                            textAlign: "left", // Centers the text horizontally
                            marginBottom: "5vh", // Adjust this value to raise the content higher
                        }}
                    >
                        <Typography variant={"h2"} fontWeight={"bold"}>
                            Software engineer by day,
                            creative by night.
                        </Typography>
                        <Typography variant={"h5"} fontWeight={"bold"}>
                            Building skills with every line of code.
                        </Typography>
                        <Chip
                            avatar={<Avatar alt="Ruben Flinterman" src="RubenFlinterman.png" />}
                            label="About Me"
                            variant="outlined"
                            onClick={() => window.location.href = "/about"}
                            sx={{
                                fontSize: "1.05rem",
                                height: "38px",
                                padding: "0 7px",
                                marginTop: "1vh",
                            }}
                        />
                    </Box>
                {/*</GlassEffect>*/}
            </GradientContainer>
        </>
    );
};

export default Home;
