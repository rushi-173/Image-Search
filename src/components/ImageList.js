import React from "react";
import { getImageUrl } from "../utils.js";

export function ImageList(props) {
	function onImageClick(idx) {
		props.onImageClick(idx);
	}

	function ImageItem(image, idx, onClick) {
		const { farm, server, id, secret } = image;
		return (
			<li key={idx} className="image-item" onClick={() => onClick(idx)}>
				<img src={getImageUrl(farm, server, id, secret)} alt="" width="300px" />
			</li>
		);
	}

	return (
		<ul className="container sb">
			{props.images.map((image, idx) => ImageItem(image, idx, onImageClick))}
		</ul>
	);
}
