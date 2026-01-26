import React, {useState} from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography
} from '@mui/material';

const MailListSignUpComponent = () => {
    const [openModal, setOpenModal] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [stayUpdated, setStayUpdated] = useState(false);  // Changed to a boolean for checkbox
    const [howFindUs, setHowFindUs] = useState('');

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleAgreeChange = (event: { target: { checked: boolean } }) => setAgreed(event.target.checked);
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);
    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
    const handleStayUpdatedChange = (event: { target: { checked: boolean } }) => setStayUpdated(event.target.checked);
    const handleHowFindUsChange = (event: SelectChangeEvent<string>) => {
        setHowFindUs(event.target.value);
    };

    const handleSignup = async () => {
        if (!agreed) {
            alert("You must agree to the privacy policy!");
            return;
        }
        if (!email) {
            alert("Please provide your email!");
            return;
        }
        if (!stayUpdated || !howFindUs) {
            alert("Please answer the questions!");
            return;
        }

        try {
            const response = await fetch(`/mail/mail-list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    howFindUs: howFindUs,
                    stayUpdated: stayUpdated,
                    agreed: agreed
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Signup successful:', data);
                handleCloseModal();
            } else {
                const errorText = await response.text();
                console.error('Signup failed:', errorText);
            }
        } catch (error) {
            console.error('Error during API call:', error);
        }
    };

    return (
        <div>
            {/* Signup Button */}
            <Button onClick={handleOpenModal} variant="contained"
                    sx={{width: {xs: "40vw", sm: "40vw", md: "40vw", lg: "40vw", xl: "30vw"}}}>
                Signup for the Newsletter
            </Button>

            {/* Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="signup-modal-title"
                aria-describedby="signup-modal-description"
            >
                <Stack sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'primary.main',
                    padding: 4,
                    boxShadow: 24,
                    borderRadius: 2,
                    width: {xs: "95vw", sm: "95vw", md: "95vw", lg: "40vw", xl: "40vw"}
                }}>
                    <Typography id="signup-modal-title" variant="h6" component="h2" color='textPrimary'>
                        Sign Up for the Newsletter
                    </Typography>
                    <Typography id="signup-modal-description" sx={{mt: 2}} color='textPrimary'>
                        By signing up, you agree to our <a href="/privacy-policy" target="_blank"
                                                           rel="noopener noreferrer">Privacy Policy</a>.
                    </Typography>

                    {/* Name input */}
                    <TextField
                        label="Your Name"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={handleNameChange}
                        required
                        variant="outlined"
                        color="secondary"
                    />

                    {/* Email input */}
                    <TextField
                        label="Your Email"
                        fullWidth
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        variant="outlined"
                        color="secondary"
                    />

                    {/* How did you find us dropdown */}
                    <FormControl fullWidth margin="normal" variant="outlined" color="secondary">
                        <InputLabel id="how-find-us-label">How did you find us?</InputLabel>
                        <Select
                            labelId="how-find-us-label"
                            value={howFindUs}
                            onChange={handleHowFindUsChange}  // Corrected to pass the handler function
                            label="How did you find us?"
                            required
                        >
                            <MenuItem value="Google">Google</MenuItem>
                            <MenuItem value="Social Media">Social Media</MenuItem>
                            <MenuItem value="Friend">Friend</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Stay Updated checkbox */}
                    <Box style={{marginTop: "auto", textAlign: 'center'}}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={stayUpdated}
                                    onChange={handleStayUpdatedChange}
                                    color="secondary"
                                />
                            }
                            label="Want to stay updated?"
                        />

                        {/* Checkbox for agreement */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={agreed}
                                    onChange={handleAgreeChange}
                                    color="secondary"
                                />
                            }
                            label="I agree to the Privacy Policy"
                        />
                    </Box>

                    {/* Confirm Signup Button */}
                    <Stack spacing={2} direction="row" justifyContent="center" sx={{ marginTop: 2 }}>
                        <Button
                            variant="contained"
                            disabled={!agreed || !email || !stayUpdated || !howFindUs}  // Disable button if any field is empty or agreement is not checked
                            onClick={handleSignup}
                        >
                            Confirm Signup
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCloseModal}
                        >
                            I Changed My Mind
                        </Button>
                    </Stack>
                </Stack>
            </Modal>
        </div>
    );
};

export default MailListSignUpComponent;