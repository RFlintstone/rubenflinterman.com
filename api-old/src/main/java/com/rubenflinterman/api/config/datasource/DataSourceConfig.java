package com.rubenflinterman.api.config.datasource;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.flyway.FlywayDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {
    /***
     * This is the configuration for the read-write data source
     * @return Returns the read-write data source
     */
    @Bean(name = "readWriteDataSource")
    @ConfigurationProperties(prefix = "spring.datasource")
    @FlywayDataSource
    public DataSource readWriteDataSource() {
        return DataSourceBuilder.create().build();
    }

    /***
     * This is the configuration for the read-write JdbcTemplate
     * @param dataSource The data source
     * @return Returns the read-write JdbcTemplate
     */
    @Bean(name = "readWriteJdbcTemplate")
    public JdbcTemplate readWriteJdbcTemplate(@Qualifier("readWriteDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    /***
     * This is the configuration for the Flyway migration
     * @param dataSource The data source
     * @return Returns the Flyway migration
     */
    @Bean(initMethod = "migrate")
    public Flyway flyway(@Qualifier("readWriteDataSource") DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load();
    }
}