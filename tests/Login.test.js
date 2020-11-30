import { render, screen } from "@testing-library/react";
import Login from "../src/auth/Login";
test("renders email input field", () => {
    const login = <Login />;
    const rendered = render(login);
    const emailElement = rendered.container.querySelector("input[type=email]");
    expect(emailElement).not.toBeNull();
});
test("renders password input", () => {
    const login = <Login />;
    const rendered = render(login);
    const passwordElement = rendered.container.querySelector("input[type=password]");
    expect(passwordElement).not.toBeNull();
});
