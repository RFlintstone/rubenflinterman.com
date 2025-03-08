import React from 'react';
import IAppProps from "./IAppProps";
import {Box, Container, Link, Typography} from "@mui/material";

const FooterComponent: React.FC<IAppProps> = () => {
    const items = [
        {label: 'Home', href: '/', isEnabled: true},
        {label: 'About', href: '/about-us', isEnabled: true},
        {label: 'Terms of Service', href: '/terms-of-service', isEnabled: false},
        {label: 'Privacy Policy', href: '/privacy-policy', isEnabled: false},
        {label: 'Item 3', href: '/item3', isEnabled: false},
        {label: 'Item 4', href: '/item4', isEnabled: false},
    ];

    return (
        <Box style={{
            position: 'inherit',
            left: 0,
            bottom: 0,
            width: '100%',
        }}>
            <Container
                maxWidth={false}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 5,
                    bgcolor: 'background.default',
                    width: '100%',
                    maxWidth: {xs: '100%', sm: '85%', md: '45%', lg: '45%', xl: '45%'},
                    paddingY: 1,
                }}
                disableGutters
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'space-between',
                        '@media (max-width:600px)': {  // Mobile breakpoint
                            flexDirection: 'row',  // Stack items vertically on small screens
                            gap: 2,  // Increase gap between sections
                            alignItems: 'center',  // Center items horizontally on small screens
                        }
                    }}
                >
                    {/* Left-aligned ProjectsIncluded text */}
                    <Typography variant="body1" component="div" sx={{textAlign: 'center'}}>
                        2025 © Ruben Flinterman. All Rights Reserved.
                    </Typography>

                    {/* Right-aligned items with margin to the left */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1,
                            marginLeft: 3,  // Increased gap and margin
                            '@media (max-width:600px)': {  // Mobile breakpoint
                                marginLeft: 0,  // No margin on mobile
                                flexDirection: 'row',  // Stack the items vertically on mobile
                                gap: 1,  // Adjust gap between items
                                textAlign: 'center',
                                alignItems: 'center',  // Center the items on mobile
                            }
                        }}
                    >
                        {items
                            .filter(item => item.isEnabled)
                            .map((item, index, filteredItems) => (
                                <React.Fragment key={item.label}>
                                    {item.href ? (
                                        <Link href={item.href} underline="hover" color="inherit"
                                              aria-label={item.label}>
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <Typography>{item.label}</Typography>
                                    )}
                                    {index < filteredItems.length - 1 && (
                                        <Typography variant="body1" component="div" sx={{marginX: 0.5}}>
                                            |
                                        </Typography>
                                    )}
                                </React.Fragment>
                            ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default FooterComponent;
