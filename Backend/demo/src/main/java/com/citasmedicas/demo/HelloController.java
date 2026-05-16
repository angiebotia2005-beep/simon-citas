package com.citasmedicas.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping
    public Map<String, String> apiInfo() {
        return Map.of("status", "ok", "message", "API REST is ready");
    }

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello World!!!!!!! Mariana :D");
    }
}
