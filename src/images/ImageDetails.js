import { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Row, Col, Button, Card, Badge } from "react-bootstrap";
import { loadUser, uploadFiles, loadImage, approveImage } from "../apiClient";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function ImageDetails(props) {
    const { id } = useParams();
    const dispatch = useDispatch();
    const image = useSelector(state => state.selectedImage, shallowEqual);
    const user = useSelector(state => state.user);
    if (!image) {
        (async () => {
            const payload = await loadImage(id);
            dispatch({ type: "image-selected", payload });
        })();
    }
    useEffect(() => {
        console.log("image", image);
        // console.log("tags", tags);
    }, [id, image]);

    const getUrl = () => `https://streetart-project.s3.amazonaws.com/uploads/${image.key}.jpg`;
    const renderBadges = () => {
        <div style={{ position: "absolute", right: "1em", top: "0" }}>
            {image.tags.map(tag => {
                return (
                    <Badge key={tag.tag} variant="primary">
                        {tag.tag}
                    </Badge>
                );
            })}
        </div>;
    };

    const Badges = function ({ tags }) {
        return (
            <div style={{ position: "absolute", right: "1em", top: "0" }}>
                {tags.map(tag => {
                    return (
                        <Badge key={tag.tag} variant="primary">
                            {tag.tag}
                        </Badge>
                    );
                })}
            </div>
        );
    };

    const ModerationBadges = function ({ moderation }) {
        return (
            <div>
                {moderation.map(label => (
                    <div>
                        <Badge key={label} variant="danger">
                            ! {label}
                        </Badge>
                    </div>
                ))}
            </div>
        );
    };

    const Map = function () {
        const coords = [image.latitude, image.longitude];
        if (image.latitude && image.longitude) {
            return (
                <MapContainer
                    style={{ height: "600px", marginTop: "2em", marginBotton: "2em" }}
                    center={[image.latitude, image.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        position={coords}
                        icon={L.icon({
                            iconUrl: "/images/marker-icon.png"
                        })}
                    ></Marker>
                </MapContainer>
            );
        } else {
            return (
                <div>
                    Unfortunately there is no geolocation attached to the image. Stay tuned, you
                    will be able to manually update this in the future
                </div>
            );
        }
    };
    if (image) {
        return (
            <div>
                <Row>
                    <Col>
                        <Card>
                            <Card.Header>
                                Details
                                <br />
                            </Card.Header>

                            <Card.Body>
                                <Card.Text>
                                    {parseTags(image.description).map((tag, i) => {
                                        let { text, type } = tag;
                                        if (type === "text") {
                                            return <span key={i}>{tag.text} </span>;
                                        } else {
                                            return (
                                                <Link
                                                    key={i}
                                                    to={tag.url}
                                                    onClick={() =>
                                                        dispatch({
                                                            type: "tag-selected",
                                                            payload: tag.tag
                                                        })
                                                    }
                                                >
                                                    {tag.text}
                                                </Link>
                                            );
                                        }
                                    })}
                                </Card.Text>
                                <div style={{ position: "relative" }}>
                                    <Card.Img width="312" variant="bottom" src={getUrl()} />
                                    <Badges tags={image.tags} />
                                </div>
                                <Card.Text>
                                    <ModerationBadges moderation={image.moderationLabels} />
                                </Card.Text>

                                <div>
                                    <Button variant="danger" disabled={image.userId != user.id}>
                                        Delete
                                    </Button>
                                    <span>&nbsp;</span>
                                    {image.moderationLabels && (
                                        <Button variant="warning">
                                            Remove from moderation
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h3 style={{ marginTop: "2em" }}>Where can you find it?</h3>
                        <Map />
                    </Col>
                </Row>
            </div>
        );
    } else {
        return <div></div>;
    }
}
/**
 *
 * @param {string} str
 * @returns {string[]} the array of tags
 */
function parseTags(description) {
    // found at https://blog.abelotech.com/posts/split-string-into-tokens-javascript/
    const words = description.split(/\s+/);
    let parts = [];
    for (let word of words) {
        if (word.length > 1 && word[0] === "#") {
            let tag = word.trim().toUpperCase();
            let element = <a href={"/tags/" + tag}>{word}</a>;
            parts.push({ type: "tag", text: word.trim(), element });
        } else {
            parts.push({ type: "word", text: word.trim(), element: <span>{word}</span> });
        }
    }
    const result = [];
    let currentWords = [];
    for (let part of parts) {
        const { type, text } = part;
        if (type === "tag") {
            result.push({ type: "text", text: currentWords.join(" ") });
            currentWords = [];
            result.push({
                type: "tag",
                text,
                tag: text.substr(1).trim().toUpperCase(),
                url: "/tags/" + text.substr(1).trim().toUpperCase()
            });
        } else {
            currentWords.push(text);
        }
    }
    console.log(result);
    return result;
    // return <div>{result.map(tag => tag.element)}</div>;
}
