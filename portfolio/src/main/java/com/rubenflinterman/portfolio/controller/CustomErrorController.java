package com.rubenflinterman.portfolio.controller;

import com.rubenflinterman.portfolio.model.ErrorResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class CustomErrorController implements ErrorController {
    @Value("${error.path.prefix}")
    private String pathPrefix;

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        Object status = request.getAttribute("jakarta.servlet.error.status_code");
        int statusCode = status != null ? Integer.parseInt(status.toString()) : 0;

        String errorMessage;
        String viewName = switch (statusCode) {
            case 404 -> {
                errorMessage = "Page not found";
                yield "error-404";
            }
            case 500 -> {
                errorMessage = "Internal server error";
                yield "error-500";
            }
            default -> {
                errorMessage = "Error code: " + statusCode;
                yield "error";
            }
        };

        ErrorResponse errorResponse = new ErrorResponse(statusCode, errorMessage);
        model.addAttribute("errorResponse", errorResponse);
        return pathPrefix + viewName;
    }
}