package com.rubenflinterman.api.controller;

import com.rubenflinterman.api.model.UserModel;
import com.rubenflinterman.api.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import java.security.Principal;
import java.util.stream.Collectors;

@RestController
public class HomeController {
    private static final Logger logger = LoggerFactory.getLogger(HomeController.class); // The logger
    private final UserService userService; // The user service

    /***
     * Constructor for the HomeController
     * @param userService The user service
     */
    public HomeController(UserService userService) {
        this.userService = userService;
    }

    /***
     * This is the home endpoint
     * @param principal The principal
     * @return Returns the home page
     */
    @GetMapping("/")
    public String home(Principal principal) {
        return "Hello, " + principal.getName() + " you have role: " +
                ((Authentication) principal).getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(", "));
    }

    /***
     * This is the secure endpoint
     * @return Returns the secure page
     */
    @PreAuthorize("hasAuthority('SCOPE_read')")
    @GetMapping("/secure")
    public String secure() {
        return "This is secured!";
    }

    /***
     * This is the hi_secure endpoint
     * @return Returns the hi_secure page
     */
    @GetMapping("/hi")
    public String hi_secure() {
        return "This is secured!";
    }

    /***
     * This is the hi_not_secure public endpoint
     * @return Returns the hi_not_secure page
     */
    @GetMapping("/p/hi")
    public String hi_not_secure() {
        return "This is a public endpoint because of the <code>/p/</code>!";
    }

    /***
     * This is the getUser endpoint
     * @param username The username
     * @return Returns the user
     */
    @GetMapping("/user")
    public ResponseEntity<Object> getUser(@RequestParam(value = "username", required = false) String username, Principal principal) {
        try {
            if (username == null || username.isEmpty()) {
                username = principal.getName();
            }
            logger.info("Fetching user with username: {}", username);
            UserModel userModel = userService.getUserByUsername(username);
            return ResponseEntity.ok(userModel);
        } catch (EmptyResultDataAccessException e) {
            logger.error("User not found: {}", username, e);
            UserModel notFoundUserModel = new UserModel();
            notFoundUserModel.setUsername("User not found");
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(notFoundUserModel);
        } catch (Exception e) {
            logger.error("An unexpected error occurred: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }
}