package com.rubenflinterman.api.config.datasource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class ReadOnlyDataSourceConfig {
    /***
     * This is the configuration for the read-only data source
     * @return Returns the read-only data source
     */
    @Bean(name = "readOnlyDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.readonly")
    public DataSource readOnlyDataSource() {
        return DataSourceBuilder.create().build();
    }

    /***
     * This is the configuration for the read-only JdbcTemplate
     * @param dataSource The data source
     * @return Returns the read-only JdbcTemplate
     */
    @Bean(name = "readOnlyJdbcTemplate")
    public JdbcTemplate readOnlyJdbcTemplate(@Qualifier("readOnlyDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}