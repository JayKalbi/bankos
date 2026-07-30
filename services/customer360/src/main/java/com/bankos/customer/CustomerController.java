package com.bankos.customer;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/customers")
public class CustomerController {
    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomer(@PathVariable String id, @RequestHeader(value = "x-request-id", required = false) String reqId) {
        // NOTE: JWT validation is handled at the Gateway level for this Walking Skeleton.
        // In a full implementation, spring-security-oauth2-resource-server would validate the JWT here as well.
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
