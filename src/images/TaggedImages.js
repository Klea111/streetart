import { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Row, Col, Button, Card } from "react-bootstrap";
import { loadUser, uploadFiles, loadImage, loadTaggedImages } from "../apiClient";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function TaggedImages(props) {
    const { tag } = useParams();
    const dispatch = useDispatch();
    const images = useSelector(state => state.selectedImages, shallowEqual);

    const containsWrongImage = (images || []).some(img => !img.tags.some(t => t == tag));
    console.log("tag", tag);
    console.log("contains wrong", containsWrongImage);

    if (!images) {
        (async () => {
            const payload = await loadTaggedImages(tag);
            console.log("payload", payload);
            dispatch({ type: "images-selected", payload });
        })();
    }
    const getUrl = image =>
        `https://streetart-project.s3.amazonaws.com/uploads/${image.key}.jpg`;

    return (
        <div>
            <Row>
                <Col>
                    <h2>{tag}</h2>
                </Col>
            </Row>

            <Row>
                <Col>
                    <MapContainer
                        style={{ height: "600px", marginTop: "2em", marginBotton: "2em" }}
                        center={[50.93333, 6.95]}
                        zoom={13}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {images &&
                            images
                                .filter(
                                    image =>
                                        image.latitude &&
                                        image.longitude &&
                                        image.tags.some(t => t == tag)
                                )
                                .map(image => {
                                    return (
                                        <Marker
                                            key={image.key}
                                            position={[image.latitude, image.longitude]}
                                            icon={L.icon({
                                                iconUrl: "/images/marker-icon.png"
                                            })}
                                        >
                                            <Popup>{image.description}</Popup>
                                        </Marker>
                                    );
                                })}
                    </MapContainer>
                </Col>
            </Row>
            <Row>
                {images &&
                    images
                        .filter(img => img.tags.some(t => t === tag))
                        .map(image => (
                            <Col>
                                <Link
                                    key={"link-" + image.key}
                                    to={"/images/" + image.id}
                                    onClick={e =>
                                        dispatch({ type: "image-selected", payload: image })
                                    }
                                >
                                    <img width={127} src={getUrl(image)} />
                                </Link>
                            </Col>
                        ))}
            </Row>
        </div>
    );
}
