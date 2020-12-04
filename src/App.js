// import logo from "./logo.svg";
// import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import { Container, Nav, Navbar } from "react-bootstrap";
import { BrowserRouter, Route, Link, Switch, Redirect } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Upload from "./images/Upload";
import ImageDetails from "./images/ImageDetails";
import TaggedImages from "./images/TaggedImages";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function App() {
    return (
        <main className="App">
            <header>
                <Navbar variant="dark" bg="dark" expand="lg">
                    <Nav.Link className="navbar-brand" href="/home">
                        Home
                    </Nav.Link>
                    <Nav.Link className="navbar-brand" href="/upload">
                        Upload
                    </Nav.Link>
                </Navbar>
            </header>
            <Container>
                <BrowserRouter>
                    <Switch>
                        <Route path="/images/:id">
                            <ImageDetails />
                        </Route>
                        <Route
                            path="/tags/:tag"
                            render={props => (
                                <TaggedImages
                                    key={props.match.params.tag}
                                    tag={props.match.params.tag}
                                />
                            )}
                        ></Route>
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
