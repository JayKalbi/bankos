package com.bankos.customer;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    private String id;
    private String firstName;
    private String lastName;
    private String riskTier;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getRiskTier() { return riskTier; }
    public void setRiskTier(String riskTier) { this.riskTier = riskTier; }
}