package com.rubenflinterman;

import io.quarkus.test.junit.QuarkusTest;
import com.rubenflinterman.models.user.Roles;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.hasEntry;

@QuarkusTest
class UserControllerTest {
    @Test
    void testUserEndpoint() {
        given()
                .when().get("/user")
                .then()
                .statusCode(200)
                .body("", hasEntry("name", "John"))
                .body("", hasEntry("age", 30))
                .body("", hasEntry("city", "New York"))
                .body("", hasEntry("role", Roles.USER.toString()))
                .body("", hasEntry("admin", false));
    }

    @Test
    void testUserDetailEndpoint() {
        given()
                .when().get("/user/detail/name")
                .then()
                .statusCode(200)
                .body(is("John"));

        given()
                .when().get("/user/detail/role")
                .then()
                .statusCode(200)
                .body(is(Roles.USER.toString()));
    }

    @Test
    void testUserIsAdminEndpoint() {
        given()
                .when().get("/user/is-admin")
                .then()
                .statusCode(200)
                .body(is("false"));
    }

}