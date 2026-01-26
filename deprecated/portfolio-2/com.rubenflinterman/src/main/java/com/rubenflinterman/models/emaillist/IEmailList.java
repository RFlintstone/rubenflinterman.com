package com.rubenflinterman.models.emaillist;

public interface IEmailList {

    String getName();

    void setName(String name);

    String getEmail();

    void setEmail(String email);

    String getHowFindUs();

    void setHowFindUs(String howFindUs);

    boolean isStayUpdated();

    void setStayUpdated(boolean stayUpdated);

    boolean isAgreed();

    void setAgreed(boolean agreed);
}
