import React, { useDispatch, useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
export function useStatefulFields() {
    const [values, setValues] = React.useState({});

    const handleChange = e => {
        setValues({
            ...values,
            [e.target.name]: e.target.value
        });
    };

    return [values, handleChange];
}
