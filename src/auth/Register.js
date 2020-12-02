import { useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";
import { register as apiRegister } from "../apiClient";
import { useStatefulFields } from "../hooks";
import { useHistory } from "react-router-dom";
export default function Register(onRegister) {
    const [{ email, password, firstName, lastName }, onInputValueChange] = useStatefulFields();
    const dispatch = useDispatch();
    const history = useHistory();
    const onSubmit = async () => {
        const result = await apiRegister({ email, firstName, lastName, password });
        const action = { type: "login", payload: result };
        dispatch(action);
        history.push("/login");
    };
    return (
        <Row className="justify-content-start">
            <Col className="mx-auto" sm={4}>
                <Form>
                    <Form.Group controlId="email">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            name="email"
                            type="email"
                            placeholder="Enter your Email"
                            onChange={onInputValueChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            name="password"
                            type="password"
                            placeholder="Enter your Password"
                            onChange={onInputValueChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            name="firstName"
                            type="text"
                            placeholder="Your first name"
                            onChange={onInputValueChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="lastName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            name="lastName"
                            type="text"
                            placeholder="Your last name"
                            onChange={onInputValueChange}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={onSubmit}>
                        Log me in!
                    </Button>
                </Form>
            </Col>
        </Row>
    );
}
