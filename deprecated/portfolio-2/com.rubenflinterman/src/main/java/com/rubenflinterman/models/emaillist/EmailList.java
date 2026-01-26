package com.rubenflinterman.models.emaillist;

public class EmailList implements IEmailList {
    private String email;
    private String name;
    private boolean stayUpdated;
    private String howFindUs;
    private boolean agreed;

    // Default constructor
    public EmailList() {
    }

    // Parameterized constructor
    public EmailList(String name, String email, String howFindUs, boolean stayUpdated, boolean agreed) {
        this.name = name;
        this.email = email;
        this.howFindUs = howFindUs;
        this.stayUpdated = stayUpdated;
        this.agreed = agreed;
    }

    // Getter and Setter for name
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Getter and Setter for email
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Getter and Setter for howFindUs
    public String getHowFindUs() {
        return howFindUs;
    }

    public void setHowFindUs(String howFindUs) {
        this.howFindUs = howFindUs;
    }

    // Getter and Setter for stayUpdated
    public boolean isStayUpdated() {
        return stayUpdated;
    }

    public void setStayUpdated(boolean stayUpdated) {
        this.stayUpdated = stayUpdated;
    }

    // Getter and Setter for agreed
    public boolean isAgreed() {
        return agreed;
    }

    public void setAgreed(boolean agreed) {
        this.agreed = agreed;
    }
}