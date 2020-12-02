// import logo from "./logo.svg";
// import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { BrowserRouter, Route, Link, Switch, Redirect } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Upload from "./images/Upload";
function App() {
    return (
        <main className="App">
            <Container fluid>
                <BrowserRouter>
                    <Switch>
                        <Route path="/login" component={() => <Login />} />
                        <Route path="/register" component={() => <Register />} />
                        <Route path="/upload" component={() => <Upload />} />
                        <Route path="/" component={() => <Redirect to="/register" />} />
                    </Switch>
                </BrowserRouter>
            </Container>
        </main>
    );
}

export default App;
