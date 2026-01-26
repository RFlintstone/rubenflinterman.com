//package net.projectsincluded.filters;
//
//import io.quarkus.vertx.http.runtime.filters.Filters;
//import jakarta.enterprise.context.ApplicationScoped;
//import jakarta.inject.Inject;
//
//@ApplicationScoped
//public class CustomResponseFilter {
//
//    @Inject
//    Filters filters;
//
//    public void init() {
//        // Register the filter to handle responses
//        filters.register(this::handle404Errors, 10);
//    }
//
//    private void handle404Errors(io.vertx.ext.web.RoutingContext rc) {
//        rc.response().endHandler(v -> {
//            if (rc.response().getStatusCode() == 404) {
//                // Log unmatched route
//                System.out.println("Unmatched route: " + rc.request().path());
//            }
//        });
//        rc.next(); // Continue to next filter/handler
//    }
//}
