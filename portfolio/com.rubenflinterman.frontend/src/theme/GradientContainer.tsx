import {Stack, styled} from "@mui/material";

const GradientContainer = styled(Stack)(({theme}) => ({
    position: 'relative',
    height: '100vh',
    width: '100vw',
    maxWidth: '100%',
    minHeight: '100vh',
    // padding: theme.spacing(2),
    // [theme.breakpoints.up('sm')]: {
    //     padding: theme.spacing(4),
    // },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        display: 'flex',
        position: 'absolute',
        zIndex: -1,
        inset: '-1%',
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%) 0%, hsl(0, 0%, 100%) 70%)',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.7) 0%, hsla(220, 50%, 10%, 0.6) 50%, hsl(220, 30%, 5%) 100%)',
        }),
        ...theme.applyStyles('light', {
            backgroundImage: 'radial-gradient(at 50% 50%, hsla(200, 100%, 95%, 0.6) 0%, hsla(210, 100%, 85%, 0.5) 50%, hsl(210, 45%, 75%) 110%)',
        }),
    },
    '@media (orientation: landscape)': {
        height: '100vh',
        minHeight: 'fit-content'
    },
}));

export default GradientContainer;