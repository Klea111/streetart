import { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Row, Col, Form, Button, List, ListGroup, CardImg, FormControl } from "react-bootstrap";
import { loadUser, uploadFile } from "../apiClient";
import { useHistory } from "react-router-dom";

export default function Upload() {
    const dispatch = useDispatch();
    const [file, setFile] = useState();
    const [description, setDescription] = useState();
    const [dataUrl, setDataUrl] = useState();
    const history = useHistory();
    const user = useSelector(state => {
        return state ? state.profile : null;
    }, shallowEqual);
    if (!user) {
        (async function () {
            console.log("requesting profile");
            const payload = await loadUser();
            dispatch({ type: "login", payload });
        })();
    }

    const submit = async event => {
        const uploadedFile = await uploadFile(file, description);
        console.log(uploadFile);
        dispatch({ type: "image-selected", payload: uploadedFile });
        history.push("/images/" + uploadedFile.id);
    };

    const onSelectedFileChanged = event => {
        console.log(event);
        const newFile = event.target.files[0];
        setFile(newFile);
    };

    const onDescriptionChanged = ev => {
        console.log(ev);
        setDescription(ev.target.value);
    };

    const getPreviewImage = () => {};

    return (
        <Form>
            <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                {
                    // react-bootstrap's <FormControl as="textarea"> did not fire events for some reason
                    // so i'm falling back to manual <textarea>
                }
                <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    onBlur={ev => onDescriptionChanged(ev)}
                ></textarea>
                {/* <Form.Control as="textarea" onBlur={e => setDescription(e.target.value)} /> */}
            </Form.Group>
            <Form.Group controlId="files">
                <Form.Label>Your image</Form.Label>
                <Form.File accept="image/jpeg" onChange={e => onSelectedFileChanged(e)} />
            </Form.Group>
            <div>{dataUrl && <img src={() => dataUrl} />}</div>
            <Form.Group controlId="submit-button">
                <Button variant="primary" onClick={submit} disabled={!file}>
                    Submit
                </Button>
            </Form.Group>
        </Form>
    );
}
