package com.smd.core.exception;

public class InvalidDataException extends RuntimeException {
    private String fieldName;
    private Object invalidValue;

    public InvalidDataException(String fieldName, Object invalidValue, String reason) {
        super(String.format("Dữ liệu không hợp lệ tại '%s' = '%s': %s", fieldName, invalidValue, reason));
        this.fieldName = fieldName;
        this.invalidValue = invalidValue;
    }

    public InvalidDataException(String message) {
        super(message);
    }

    public String getFieldName() {
        return fieldName;
    }

    public Object getInvalidValue() {
        return invalidValue;
    }
}
