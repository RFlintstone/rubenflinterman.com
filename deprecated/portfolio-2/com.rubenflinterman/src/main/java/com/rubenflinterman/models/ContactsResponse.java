package com.rubenflinterman.models;

import java.util.List;

public class ContactsResponse {
    private List<Contact> data;

    public List<Contact> getData() {
        return data;
    }

    public void setData(List<Contact> data) {
        this.data = data;
    }
}
