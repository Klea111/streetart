import { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Row, Col, Form, Button, List, ListGroup, CardImg, FormControl } from "react-bootstrap";
import { loadUser, uploadFiles } from "../apiClient";
import { useStatefulFields } from "../hooks";

export default function Upload() {
    const dispatch = useDispatch();
    const [file, setFile] = useState();
    const [description, setDescription] = useState();

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

    const fileReader = new FileReader();
    fileReader.onloadend = e => {
        const blob = e.target.result;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 600;
        canvas.height = 600;
        const imageData = context.createImageData(canvas.width, canvas.height);
        imageData.data.set(blob);
        context.putImageData(imageData, 0, 0);
    };

    const submit = async event => {
        const uploadedFiles = await uploadFiles(file, description);
        console.log(uploadFiles);
    };

    const onSelectedFileChanged = event => {
        console.log(event);
        const newFile = event.target.files[0];
        setFile(newFile);
        fileReader.readAsArrayBuffer(event.target.files[0]);
    };

    const onDescriptionChanged = ev => {
        console.log(ev);
        setDescription(ev.target.value);
    };

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
            <Form.Group controlId="submit-button">
                <Button variant="primary" onClick={submit}>
                    Submit
                </Button>
            </Form.Group>
        </Form>
    );
}
