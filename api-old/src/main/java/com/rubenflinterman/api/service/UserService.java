package com.rubenflinterman.api.service;

import com.rubenflinterman.api.model.UserModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;

@Service
public class UserService {
    // Inject the read-write and read-only JdbcTemplate beans
    private final JdbcTemplate readWriteJdbcTemplate;
    private final JdbcTemplate readOnlyJdbcTemplate;

    /***
     * This is the constructor for the UserService
     * @param readWriteJdbcTemplate The read-write JdbcTemplate
     * @param readOnlyJdbcTemplate The read-only JdbcTemplate
     */
    public UserService(@Qualifier("readWriteJdbcTemplate") JdbcTemplate readWriteJdbcTemplate, @Qualifier("readOnlyJdbcTemplate") JdbcTemplate readOnlyJdbcTemplate) {
        this.readWriteJdbcTemplate = readWriteJdbcTemplate;
        this.readOnlyJdbcTemplate = readOnlyJdbcTemplate;
    }

    /***
     * This method saves a user to the database
     * @param username
     */
    public void saveUser(String username) {
        readWriteJdbcTemplate.update("INSERT INTO users (username) VALUES (?)", username);
    }

    /***
     * This method gets a user from the database
     * @param username
     * @return
     */
    public UserModel getUserByUsername(String username) {
        String sql = "SELECT username, roles FROM users WHERE username = ?";
        return readOnlyJdbcTemplate.queryForObject(sql, new Object[]{username}, new RowMapper<UserModel>() {
            @Override
            public UserModel mapRow(ResultSet rs, int rowNum) throws SQLException {
                UserModel userModel = new UserModel();
                userModel.setUsername(rs.getString("username"));
                userModel.setRoles(rs.getString("roles"));
                return userModel;
            }
        });
    }

//    public UserModel getUserWithToken(String username, String Token) {
//        String sql = "SELECT username, roles, token FROM users WHERE username = ? AND token = ?";
//        return readOnlyJdbcTemplate.queryForObject(sql, new Object[]{username, Token}, new RowMapper<UserModel>() {
//            @Override
//            public UserModel mapRow(ResultSet rs, int rowNum) throws SQLException {
//                UserModel userModel = new UserModel();
//                userModel.setUsername(rs.getString("username"));
//                userModel.setRoles(rs.getString("roles"));
//                return userModel;
//            }
//        });
//    }
}