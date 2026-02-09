package com.example.parity;

@ClassAnnotation
public class ParityClass implements BaseInterface {

    @FieldAnnotation
    public final String readonlyField = "readonly";

    public int mutableField = 0;

    public static final String CONSTANT_STRING = "constant";
    public static final int CONSTANT_INT = 100;

    @MethodAnnotation
    @Override
    public void interfaceMethod() {
        // ...
    }

    public void normalMethod() {
        // ...
    }
}

interface BaseInterface {
    void interfaceMethod();
}
