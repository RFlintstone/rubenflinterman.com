package com.rubenflinterman.models.user;

public class User implements IUser {
    private String name;
    private String email;
    private int age;
    private String city;
    private Roles role = Roles.USER;

    public User(String name, String email, int age, String city) {
        this.name = name;
        this.email = email;
        this.age = age;
        this.city = city;
    }

    // << Getters >>
    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public int getAge() {
        return age;
    }

    @Override
    public String getCity() {
        return city;
    }

    @Override
    public String getRole() {
        return role.toString();
    }

    @Override
    public Boolean isAdmin() {
        return this.role == Roles.ADMIN;
    }

    // << Setters >>
    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setRole(Roles role) {
        this.role = role;
    }
}
