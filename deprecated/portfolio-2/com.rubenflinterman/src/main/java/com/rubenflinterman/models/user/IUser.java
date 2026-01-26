package com.rubenflinterman.models.user;

public interface IUser {
    // << Fields >>
    String name = "none";
    String email = "none";
    int age = 0;
    String city = "none";
    Roles role = Roles.USER;

    // << Methods >>
    String getName();

    String getEmail();

    int getAge();

    String getCity();

    String getRole();

    Boolean isAdmin();
}
