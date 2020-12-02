import { useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";
import { login as apiLogin } from "../apiClient";
import { useStatefulFields } from "../hooks";
import { useHistory } from "react-router-dom";
export default function Login({ onLogin }) {
    const [{ email, password }, onInputValueChange] = useStatefulFields();
    const dispatch = useDispatch();
    const history = useHistory();
    const onSubmit = async event => {
        const { data } = await apiLogin(email, password);
        console.log("logged in", data);
        const action = { type: "login", payload: data };
        dispatch(action);
        history.push("/upload");
    };

    return (
        <Row className="justify-content-start">
            <Col sm="4" className="mx-auto">
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
                    <Button variant="primary" onClick={onSubmit}>
                        Log me in!
                    </Button>
                </Form>
            </Col>
        </Row>
    );
}
