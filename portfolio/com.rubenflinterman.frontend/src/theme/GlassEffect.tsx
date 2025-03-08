import {styled} from '@mui/material/styles';

const GlassEffect = styled('div')(({theme}) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        backdropFilter: 'blur(5px)', // Reduce blur effect
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
}));

export default GlassEffect;