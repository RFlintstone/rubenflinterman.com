package com.rubenflinterman.services;

import java.lang.reflect.Field;

public class getProperty {
    public static String getPropertyByKey(Object obj, String key) {
        try {
            Field field = obj.getClass().getDeclaredField(key);
            field.setAccessible(true);
            Object value = field.get(obj);
            return value != null ? value.toString() : "null";
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return null;
        } catch (Exception e) {
            return e.getMessage();
        }
    }
}
