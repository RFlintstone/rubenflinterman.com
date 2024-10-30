package com.rubenflinterman.portfolio;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@SpringBootApplication
@Controller
public class PortfolioApplication {
    @Value("${spring.mvc.view.prefix}")
    private String pathPrefix;

    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }

    @RequestMapping("/")
    public String home() {
        return pathPrefix + "home";
    }
}