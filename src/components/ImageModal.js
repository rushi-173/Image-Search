import React from "react";
import { getImageUrl } from "../utils.js";

export function ImageModal(props) {
	const { farm, server, id, secret } = props.image;

	return (
		<div className="img-modal-container" onClick={props.onHide}>
			<img
				className="img-in-modal"
				src={getImageUrl(farm, server, id, secret)}
				alt=""
				style={{ marginTop: "140px" }}
			/>
		</div>
	);
}
