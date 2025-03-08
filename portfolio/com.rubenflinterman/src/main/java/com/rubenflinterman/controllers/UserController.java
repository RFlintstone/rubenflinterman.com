package com.rubenflinterman.controllers;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.rubenflinterman.models.user.User;

import static com.rubenflinterman.services.getProperty.getPropertyByKey;

@Path("/user")
public class UserController {
    User user = new User("John", "john@email.com", 30, "New York");

    @GET()
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser() {
        if (user != null) return Response.ok(user).build();
        return Response.status(400).entity("null").build();
    }

    @GET()
    @Path("/is-admin")
    @Produces(MediaType.APPLICATION_JSON)
    public Response isAdmin() {
        return Response.ok(user.isAdmin()).build();
    }

    @GET()
    @Path("/detail/{slug}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserDetailBySlug(@PathParam("slug") String slug) {
        String res = getPropertyByKey(user, slug);
        if (res != null) return Response.ok(res).build();
        return Response.status(400).entity("null").build();
    }
}