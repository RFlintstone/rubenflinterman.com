import React from "react";
import GradientContainer from "../theme/GradientContainer";
import {Box, Typography} from "@mui/material";
import GlassEffect from "../theme/GlassEffect";

const PrivacyPolicy: React.FC = () => {
    return (
        <>
            <GradientContainer>
                <GlassEffect sx={{
                    marginTop: {xs: "10vh", sm: "10vh", md: "10vh", lg: "10vh", xl: "10vh"},
                    marginBottom: '0vh',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: {xs: "80vw", sm: "60vw", md: "60vw", lg: "70vw", xl: "70vw"},
                    height: 'auto',
                    overflow: 'auto'
                }}>
                    {/*<GlassEffect sx={{marginTop: '8vh'}}>*/}
                    <Box
                        sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            p: 3,
                            maxWidth: 'lg',
                            margin: 'auto',
                            marginBottom: 'auto',
                            marginRight: '0.5vw',
                            '& a[href]': {
                                textDecoration: 'none',
                                color: 'inherit',
                                fontWeight: 'bolder'
                            }
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Privacy Policy
                        </Typography>
                        <Typography variant="body1">
                            Last updated January 24, 2025<br/><br/>
                        </Typography>
                        <Typography variant="body2">
                            This Privacy Notice for ProjectsIncluded ("we," "us," or "our"), describes how and why we
                            might access, collect, store, use, and/or share ("process") your personal information when
                            you use our services ("Services"), including when you:
                            <ul>
                                <li>Visit our website at http://www.projectsincluded.net, or any website of ours that
                                    links to this Privacy Notice
                                </li>
                                <li>Download and use our mobile application (Pi Status), or any other application of
                                    ours that
                                    links to this Privacy Notice
                                </li>
                                <li>Use ProjectsIncluded - Scaling as a Service. ProjectsIncluded is a Scaling as a
                                    Service platform being developed to simplify server management for developers. Our solution,
                                    when ready, it enables you to easily deploy and manage your applications on our platform,
                                    leveraging our automated configurations, cost-effective infrastructure, and seamless
                                    integrations with your existing workflows. It will support popular languages and
                                    frameworks like C#, Java, and Typescript, and offer features like instant WebSocket server
                                    provisioning and easy website deployment with autoscaling.
                                </li>
                                <li>Engage with us in other related ways, including any sales, marketing, or events</li>
                            </ul>

                            Questions or concerns? Reading this Privacy Notice will help you understand your privacy
                            rights and choices. We are responsible for making decisions about how your personal
                            information is processed. If you do not agree with our policies and practices, please do not
                            use our Services. If you still have any questions or concerns, please contact us at
                            r.flinterman@projectsincluded.net.
                            <br/>
                            <br/>
                            <h2>SUMMARY OF KEY POINTS</h2>
                            This summary provides key points from our Privacy Notice, but you can find out more details
                            about any of these topics by clicking the link following each key point or by using our
                            <span> <a href="#toc">table of contents</a></span> below to find the section you are looking for.
                            <br/>
                            <br/>
                            What personal information do we process?<br/>When you visit, use, or navigate our Services,
                            we
                            may process personal information depending on how you interact with us and the Services, the
                            choices you make, and the products and features you use. Learn more about <span> <a href="#personalinfo">personal
                            information you disclose to us.</a></span>
                            <br/>
                            <br/>
                            Do we process any sensitive personal information?<br/>Some of the information may be
                            considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic
                            origins, sexual orientation, and religious beliefs. We may process sensitive personal
                            information when necessary with your consent or as otherwise permitted by applicable law.
                            Learn more about <span> <a href="#sensitiveinfo">sensitive information we process.</a></span>
                            <br/>
                            <br/>
                            Do we collect any information from third parties?<br/>We do not collect any information from
                            third parties.
                            <br/>
                            <br/>
                            How do we process your information?<br/>We process your information to provide, improve, and
                            administer our Services, communicate with you, for security and fraud prevention, and to
                            comply with law. We may also process your information for other purposes with your consent.
                            We process your information only when we have a valid legal reason to do so. Learn more
                            about <span> <a href="#infouse">how we process your information.</a></span>
                            <br/>
                            <br/>
                            In what situations and with which parties do we share personal information?<br/>We may share
                            information in specific situations and with specific third parties. Learn more about <span> <a href="#whoshare">when
                            and with whom we share your personal information.</a></span>
                            <br/>
                            <br/>
                            How do we keep your information safe?<br/>We have adequate organizational and technical
                            processes and procedures in place to protect your personal information. However, no
                            electronic transmission over the internet or information storage technology can be
                            guaranteed to be 100% secure, so we cannot promise or guarantee that hackers,
                            cybercriminals, or other unauthorized third parties will not be able to defeat our security
                            and improperly collect, access, steal, or modify your information. Learn more about <span> <a href="#infosafe">how we
                            keep your information safe.</a></span>
                            <br/>
                            <br/>
                            What are your rights?<br/>Depending on where you are located geographically, the applicable
                            privacy law may mean you have certain rights regarding your personal information. Learn more
                            about <span> <a href="#privacyrights">your privacy rights.</a></span>
                            <br/>
                            <br/>
                            How do you exercise your rights?<br/>The easiest way to exercise your rights is by visiting
                            http://www.projectsincluded.net/my-data, or by contacting us. We will consider and act upon
                            any request in accordance with applicable data protection laws.
                            <br/>
                            <br/>
                            Want to learn more about what we do with any information we collect? <span> <a href="#toc">Review the Privacy
                            Notice in full.</a></span>
                            <br/>
                            <br/>
                            <h2 id="toc">TABLE OF CONTENTS</h2>
                            <a href="#infocollect">1. WHAT INFORMATION DO WE COLLECT?</a><br/>
                            <a href="#infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</a><br/>
                            <a href="#legalbases">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a><br/>
                            <a href="#whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a><br/>
                            <a href="#cookies">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a><br/>
                            <a href="#inforetain">6. HOW LONG DO WE KEEP YOUR INFORMATION?</a><br/>
                            <a href="#infosafe">7. HOW DO WE KEEP YOUR INFORMATION SAFE?</a><br/>
                            <a href="#infominors">8. DO WE COLLECT INFORMATION FROM MINORS?</a><br/>
                            <a href="#privacyrights">9. WHAT ARE YOUR PRIVACY RIGHTS?</a><br/>
                            <a href="#DNT">10. CONTROLS FOR DO-NOT-TRACK FEATURES</a><br/>
                            <a href="#policyupdates">11. DO WE MAKE UPDATES TO THIS NOTICE?</a><br/>
                            <a href="#contact">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a><br/>
                            <a href="#request">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a>
                            <br/>
                            <br/>
                            <h2 id="infocollect">1. WHAT INFORMATION DO WE COLLECT?</h2>
                            <h3>Personal information you disclose to us</h3>
                            In Short: We collect personal information that you provide to us.
                            <br/>
                            <br/>
                            We collect personal information that you voluntarily provide to us when you register on the
                            Services, express an interest in obtaining information about us or our products and
                            Services, when you participate in activities on the Services, or otherwise when you contact
                            us.
                            <br/>
                            <br/>
                            <span id="personalinfo">Personal Information Provided by You.</span> The personal information that we collect depends on
                            the context of your interactions with us and the Services, the choices you make, and the
                            products and features you use. The personal information we collect may include the
                            following:
                            <ul>
                                <li>names</li>
                                <li>phone numbers</li>
                                <li>email addresses</li>
                                <li>mailing addresses</li>
                                <li>job titles</li>
                                <li>usernames</li>
                                <li> passwords</li>
                                <li>contact preferences</li>
                                <li>contact or authentication data</li>
                                <li>billing addresses</li>
                                <li>debit/credit card numbers</li>
                            </ul>

                            <span id="sensitiveinfo">Sensitive Information.</span> When necessary, with your consent or as otherwise permitted by
                            applicable law, we process the following categories of sensitive information:<br/>
                            <ul>
                                <li>financial data</li>
                            </ul>

                            Application Data. If you use our application(s), we also may collect the following
                            information if you choose to provide us with access or permission:<br/>
                            <ul>
                                <li>Geolocation Information. We may request access or permission to track location-based
                                    information from your mobile device, either continuously or while you are using our
                                    mobile
                                    application(s), to provide certain location-based services. If you wish to change
                                    our access
                                    or permissions, you may do so in your device's settings.
                                </li>
                                <li>Push Notifications. We may request to send you push notifications regarding your
                                    account or
                                    certain features of the application(s). If you wish to opt out from receiving these
                                    types of
                                    communications, you may turn them off in your device's settings.
                                </li>
                            </ul>

                            This information is primarily needed to maintain the security and operation of our
                            application(s), for troubleshooting, and for our internal analytics and reporting purposes.

                            <br/>
                            <br/>

                            All personal information that you provide to us must be true, complete, and accurate, and
                            you must notify us of any changes to such personal information.

                            <h3>Information automatically collected</h3>

                            In Short: Some information — such as your Internet Protocol (IP) address and/or browser and
                            device characteristics — is collected automatically when you visit our Services.

                            <br/>
                            <br/>

                            We automatically collect certain information when you visit, use, or navigate the Services.
                            This information does not reveal your specific identity (like your name or contact
                            information) but may include device and usage information, such as your IP address, browser
                            and device characteristics, operating system, language preferences, referring URLs, device
                            name, country, location, information about how and when you use our Services, and other
                            technical information. This information is primarily needed to maintain the security and
                            operation of our Services, and for our internal analytics and reporting purposes.

                            <br/>
                            <br/>

                            Like many businesses, we also collect information through cookies and similar technologies.
                            You can find out more about this in our Cookie Notice:
                            http://www.projectsincluded.net/cookies.

                            <br/>
                            <br/>

                            The information we collect includes:<br/>
                            <ul>
                                <li>Log and Usage Data. Log and usage data is service-related, diagnostic, usage, and
                                    performance information our servers automatically collect when you access or use our
                                    Services and which we record in log files. Depending on how you interact with us,
                                    this log
                                    data may include your IP address, device information, browser type, and settings and
                                    information about your activity in the Services (such as the date/time stamps
                                    associated
                                    with your usage, pages and files viewed, searches, and other actions you take such
                                    as which
                                    features you use), device event information (such as system activity, error reports
                                    (sometimes called "crash dumps"), and hardware settings).
                                </li>
                                <li>Device Data. We collect device data such as information about your computer, phone,
                                    tablet,
                                    or other device you use to access the Services. Depending on the device used, this
                                    device
                                    data may include information such as your IP address (or proxy server), device and
                                    application identification numbers, location, browser type, hardware model, Internet
                                    service
                                    provider and/or mobile carrier, operating system, and system configuration
                                    information.
                                </li>
                            </ul>

                            <br/>
                            <br/>

                            <h2 id="infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
                            In Short: We process your information to provide, improve, and administer our Services,
                            communicate with you, for security and fraud prevention, and to comply with law. We may also
                            process your information for other purposes with your consent.

                            <br/>
                            <br/>

                            We process your personal information for a variety of reasons, depending on how you interact
                            with our Services, including:<br/>
                            <ul>
                                <li>To facilitate account creation and authentication and otherwise manage user
                                    accounts. We may process your information so you can create and log in to your
                                    account, as well as
                                    keep your account in working order.
                                </li>
                                <li>To deliver and facilitate delivery of services to the user. We may process your
                                    information to provide you with the requested service.
                                </li>
                                <li>To respond to user inquiries/offer support to users. We may process your information
                                    to respond to your inquiries and solve any potential issues you might have with the
                                    requested service.
                                </li>
                                <li>To send administrative information to you. We may process your information to send
                                    you details about our products and services, changes to our terms and policies, and
                                    other similar information.
                                </li>
                                <li>To fulfill and manage your orders. We may process your information to fulfill and
                                    manage your orders, payments, returns, and exchanges made through the Services.
                                </li>
                                <li>To request feedback. We may process your information when necessary to request
                                    feedback and to contact you about your use of our Services.
                                </li>
                                <li>To send you marketing and promotional communications. We may process the personal
                                    information you send to us for our marketing purposes, if this is in accordance with
                                    your marketing preferences. You can opt out of our marketing emails at any time. For
                                    more
                                    information, see "WHAT ARE YOUR PRIVACY RIGHTS?" below.
                                </li>
                                <li>To protect our Services. We may process your information as part of our efforts to
                                    keep our Services safe and secure, including fraud monitoring and prevention.
                                </li>
                                <li>To save or protect an individual's vital interest. We may process your information
                                    when necessary to save or protect an individual’s vital interest, such as to prevent
                                    harm.
                                </li>
                            </ul>


                            <br/>
                            <br/>

                            <h2 id="legalbases">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
                            In Short: We only process your personal information when we believe it is necessary and we
                            have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your
                            consent, to comply with laws, to provide you with services to enter into or fulfill our
                            contractual obligations, to protect your rights, or to fulfill our legitimate business
                            interests.

                            <br/>
                            <br/>

                            The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid
                            legal bases we rely on in order to process your personal information. As such, we may rely
                            on the following legal bases to process your personal information:<br/>
                            <ul>
                                <li>Consent. We may process your information if you have given us permission (i.e.,
                                    consent) to
                                    use your personal information for a specific purpose. You can withdraw your consent
                                    at any
                                    time. Learn more about withdrawing your consent.
                                </li>
                                <li>Performance of a Contract. We may process your personal information when we believe
                                    it is
                                    necessary to fulfill our contractual obligations to you, including providing our
                                    Services or
                                    at your request prior to entering into a contract with you.
                                </li>
                                <li>
                                    Legitimate Interests. We may process your information when we believe it is
                                    reasonably
                                    necessary to achieve our legitimate business interests and those interests do not
                                    outweigh
                                    your interests and fundamental rights and freedoms. For example, we may process your
                                    personal information for some of the purposes described in order to:
                                    <ul>
                                        <li>Send users information about special offers and discounts on our products
                                            and services
                                        </li>
                                        <li>Diagnose problems and/or prevent fraudulent activities</li>
                                        <li>Understand how our users use our products and services so we can improve
                                            user experience
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    Legal Obligations. We may process your information where we believe it is necessary
                                    for
                                    compliance with our legal obligations, such as to cooperate with a law enforcement
                                    body or
                                    regulatory agency, exercise or defend our legal rights, or disclose your information
                                    as
                                    evidence in litigation in which we are involved.
                                </li>
                                <li>
                                    Vital Interests. We may process your information where we believe it is necessary to
                                    protect
                                    your vital interests or the vital interests of a third party, such as situations
                                    involving
                                    potential threats to the safety of any person.
                                </li>
                            </ul>

                            <br/>
                            <br/>

                            <h2 id="whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
                            In Short: We may share information in specific situations described in this section and/or
                            with the following third parties.

                            <br/>
                            <br/>

                            We may need to share your personal information in the following situations:<br/>
                            <ul>
                                <li>
                                    Business Transfers. We may share or transfer your information in connection with, or
                                    during
                                    negotiations of, any merger, sale of company assets, financing, or acquisition of
                                    all or a
                                    portion of our business to another company.
                                </li>
                            </ul>

                            <br/>
                            <br/>

                            <h2 id="cookies">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
                            In Short: We may use cookies and other tracking technologies to collect and store your
                            information.

                            <br/>
                            <br/>

                            We may use cookies and similar tracking technologies (like web beacons and pixels) to gather
                            information when you interact with our Services. Some online tracking technologies help us
                            maintain the security of our Services and your account, prevent crashes, fix bugs, save your
                            preferences, and assist with basic site functions.

                            <br/>
                            <br/>

                            We also permit third parties and service providers to use online tracking technologies on
                            our Services for analytics and advertising, including to help manage and display
                            advertisements, to tailor advertisements to your interests, or to send abandoned shopping
                            cart reminders (depending on your communication preferences). The third parties and service
                            providers use their technology to provide advertising about products and services tailored
                            to your interests which may appear either on our Services or on other websites.

                            <br/>
                            <br/>

                            Specific information about how we use such technologies and how you can refuse certain
                            cookies is set out in our Cookie Notice: http://www.projectsincluded.net/cookies.

                            <br/>
                            <br/>

                            <h2 id="inforetain">6. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
                            In Short: We keep your information for as long as necessary to fulfill the purposes outlined
                            in this Privacy Notice unless otherwise required by law.

                            <br/>
                            <br/>

                            We will only keep your personal information for as long as it is necessary for the purposes
                            set out in this Privacy Notice, unless a longer retention period is required or permitted by
                            law (such as tax, accounting, or other legal requirements). No purpose in this notice will
                            require us keeping your personal information for longer than the period of time in which
                            users have an account with us.

                            <br/>
                            <br/>

                            When we have no ongoing legitimate business need to process your personal information, we
                            will either delete or anonymize such information, or, if this is not possible (for example,
                            because your personal information has been stored in backup archives), then we will securely
                            store your personal information and isolate it from any further processing until deletion is
                            possible.

                            <br/>
                            <br/>

                            <h2 id="infosafe">7. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
                            In Short: We aim to protect your personal information through a system of organizational and
                            technical security measures.

                            <br/>
                            <br/>

                            We have implemented appropriate and reasonable technical and organizational security
                            measures designed to protect the security of any personal information we process. However,
                            despite our safeguards and efforts to secure your information, no electronic transmission
                            over the Internet or information storage technology can be guaranteed to be 100% secure, so
                            we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third
                            parties will not be able to defeat our security and improperly collect, access, steal, or
                            modify your information. Although we will do our best to protect your personal information,
                            transmission of personal information to and from our Services is at your own risk. You
                            should only access the Services within a secure environment.

                            <br/>
                            <br/>

                            <h2 id="infominors">8. DO WE COLLECT INFORMATION FROM MINORS?</h2>
                            In Short: We do not knowingly collect data from or market to children under 18 years of age.

                            <br/>
                            <br/>

                            We do not knowingly collect, solicit data from, or market to children under 18 years of age,
                            nor do we knowingly sell such personal information. By using the Services, you represent
                            that you are at least 18 or that you are the parent or guardian of such a minor and consent
                            to such minor dependent’s use of the Services. If we learn that personal information from
                            users less than 18 years of age has been collected, we will deactivate the account and take
                            reasonable measures to promptly delete such data from our records. If you become aware of
                            any data we may have collected from children under age 18, please contact us at
                            r.flinterman@projectsincluded.net.

                            <br/>
                            <br/>

                            <h2 id="privacyrights">9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
                            In Short: In some regions, such as the European Economic Area (EEA), United Kingdom (UK),
                            and Switzerland, you have rights that allow you greater access to and control over your
                            personal information. You may review, change, or terminate your account at any time,
                            depending on your country, province, or state of residence.

                            <br/>
                            <br/>

                            In some regions (like the EEA, UK, and Switzerland), you have certain rights under
                            applicable data protection laws. These may include the right (i) to request access and
                            obtain a copy of your personal information, (ii) to request rectification or erasure; (iii)
                            to restrict the processing of your personal information; (iv) if applicable, to data
                            portability; and (v) not to be subject to automated decision-making. In certain
                            circumstances, you may also have the right to object to the processing of your personal
                            information. You can make such a request by contacting us by using the contact details
                            provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.

                            <br/>
                            <br/>

                            We will consider and act upon any request in accordance with applicable data protection
                            laws.

                            <br/>
                            <br/>

                            If you are located in the EEA or UK and you believe we are unlawfully processing your
                            personal information, you also have the right to complain to your Member State data
                            protection authority or UK data protection authority.

                            <br/>
                            <br/>

                            If you are located in Switzerland, you may contact the Federal Data Protection and
                            Information Commissioner.

                            <br/>
                            <br/>

                            Withdrawing your consent: If we are relying on your consent to process your personal
                            information, you have the right to withdraw your consent at any time. You can withdraw your
                            consent at any time by contacting us by using the contact details provided in the section
                            "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below or updating your preferences.

                            <br/>
                            <br/>

                            However, please note that this will not affect the lawfulness of the processing before its
                            withdrawal nor, will it affect the processing of your personal information conducted in
                            reliance on lawful processing grounds other than consent.

                            <br/>
                            <br/>

                            Opting out of marketing and promotional communications: You can unsubscribe from our
                            marketing and promotional communications at any time by clicking on the unsubscribe link in
                            the emails that we send, or by contacting us using the details provided in the section "HOW
                            CAN YOU CONTACT US ABOUT THIS NOTICE?" below. You will then be removed from the marketing
                            lists. However, we may still communicate with you — for example, to send you service-related
                            messages that are necessary for the administration and use of your account, to respond to
                            service requests, or for other non-marketing purposes.

                            <h3>Account Information</h3>
                            If you would at any time like to review or change the information in your account or
                            terminate your account, you can:

                            <ul>
                                <li>Log in to your account settings and update your user account.</li>
                                <li>Contact us using the contact information provided.</li>
                            </ul>

                            Upon your request to terminate your account, we will deactivate or delete your account and
                            information from our active databases. However, we may retain some information in our files
                            to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal
                            terms and/or comply with applicable legal requirements.

                            <br/>
                            <br/>

                            Cookies and similar technologies: Most Web browsers are set to accept cookies by default. If
                            you prefer, you can usually choose to set your browser to remove cookies and to reject
                            cookies. If you choose to remove cookies or reject cookies, this could affect certain
                            features or services of our Services. For further information, please see our Cookie Notice:
                            http://www.projectsincluded.net/cookies.

                            <br/>
                            <br/>

                            If you have questions or comments about your privacy rights, you may email us at
                            r.flinterman@projectsincluded.net.

                            <br/>
                            <br/>

                            <h2 id="DNT">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
                            Most web browsers and some mobile operating systems and mobile applications include a
                            Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference
                            not to have data about your online browsing activities monitored and collected. At this
                            stage, no uniform technology standard for recognizing and implementing DNT signals has been
                            finalized. As such, we do not currently respond to DNT browser signals or any other
                            mechanism that automatically communicates your choice not to be tracked online. If a
                            standard for online tracking is adopted that we must follow in the future, we will inform
                            you about that practice in a revised version of this Privacy Notice.

                            <br/>
                            <br/>

                            <h2 id="policyupdates">11. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
                            In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.

                            <br/>
                            <br/>

                            We may update this Privacy Notice from time to time. The updated version will be indicated
                            by an updated "Revised" date at the top of this Privacy Notice. If we make material changes
                            to this Privacy Notice, we may notify you either by prominently posting a notice of such
                            changes or by directly sending you a notification. We encourage you to review this Privacy
                            Notice frequently to be informed of how we are protecting your information.

                            <br/>
                            <br/>

                            <h2 id="contact">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
                            If you have questions or comments about this notice, you may email us at
                            r.flinterman@projectsincluded.net or contact us by post at:

                            <br/>
                            <br/>

                            ProjectsIncluded<br/>
                            Rotterdam, Zuid-Holland<br/>
                            Netherlands

                            <br/>
                            <br/>

                            <h2 id="request">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
                            Based on the applicable laws of your country, you may have the right to request access to
                            the personal information we collect from you, details about how we have processed it,
                            correct inaccuracies, or delete your personal information. You may also have the right to
                            withdraw your consent to our processing of your personal information. These rights may be
                            limited in some circumstances by applicable law. To request to review, update, or delete
                            your personal information, please visit: http://www.projectsincluded.net/my-data.
                        </Typography>
                    </Box>
                </GlassEffect>
            </GradientContainer>
        </>
    );
};

export default PrivacyPolicy;
