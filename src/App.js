import React, { useState, useEffect } from "react";
import "./App.css";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import { ImageList, ImageModal } from "./components";
import { scrollAreaAvailable, debounce, throttle } from "./utils.js";

export default function App() {
	const searchHistoryFromStorage = JSON.parse(
		localStorage.getItem(process.env.REACT_APP_LOCAL_STORAGE_KEY)
	);
	const [searchText, setSearchText] = useState("");
	const [imgList, setImgList] = useState([]);
	const [pageNumber, setPageNumber] = useState(1);
	const [ImageInModal, setImageInModal] = useState(null);
	const [searchHistory, setSearchHistory] = useState(
		searchHistoryFromStorage ? searchHistoryFromStorage : []
	);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [showLoading, setShowLoading] = useState(0);
	const [filteredSearchHistory, setFilteredSearchHistory] = useState(
		searchHistory.reverse()
	);

	const search = (text, searched = false) => {
		console.log(text);
		setShowLoading(2);
		if (searched && text.length) {
			window.scrollTo(0, 0);
			if (searchHistory.includes(text)) {
				setSearchHistory((prev) => prev.filter((item) => item !== text));
			}
			setSearchHistory((prev) => [text, ...prev], updateLocalStorage());
		}

		const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&api_key=${process.env.REACT_APP_API_KEY}&per_page=20&text=${text}`;
		fetch(url)
			.then((res) => res.json())
			.then((resp) => {
				setImgList(resp.photos.photo);
			})
			.catch((err) => {
				console.log(err);
			});
		setShowLoading(0);
	};
	const makeDebouncedSearch = debounce(search, 1000);

	function updateLocalStorage() {
		localStorage.setItem(
			process.env.REACT_APP_LOCAL_STORAGE_KEY,
			JSON.stringify(searchHistory)
		);
	}

	function onSearchInputChange(evt) {
		setSearchText(evt.currentTarget.value);
		const trimmedText = evt.currentTarget.value.replace(/\s\s+/g, " ");
		if (trimmedText.length) makeDebouncedSearch(trimmedText);
	}

	function handleScroll() {
		setShowLoading(1);
		let url = searchText
			? `https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&api_key=${
					process.env.REACT_APP_API_KEY
			  }&per_page=20&text=${searchText}&per_page=20&page=${pageNumber + 1}`
			: `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&format=json&nojsoncallback=1&api_key=${
					process.env.REACT_APP_API_KEY
			  }&per_page=20&page=${pageNumber + 1}`;
		fetch(url)
			.then((res) => res.json())
			.then((resp) => {
				setPageNumber(resp.photos.page);
				setImgList((prev) => [...prev, ...resp.photos.photo]);
			})
			.catch((err) => {
				console.log(err);
			});
		setShowLoading(0);
	}

	useEffect(() => {
		window.onscroll = throttle(() => {
			if (scrollAreaAvailable()) return;
			handleScroll();
		}, 100);
		setShowLoading(2);
		fetch(
			`https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&format=json&nojsoncallback=1&api_key=${process.env.REACT_APP_API_KEY}&per_page=20`
		)
			.then((res) => res.json())
			.then((resp) => {
				setPageNumber(resp.photos.page);
				setImgList((prev) => [...prev, ...resp.photos.photo]);
			})
			.catch((err) => {
				console.log(err);
			});
		setShowLoading(0);

		return () => {
			window.onscroll = undefined;
		};
	}, []);

	function handleImageClick(idx) {
		setImageInModal(imgList[idx]);
	}

	function onModalHide() {
		setImageInModal(null);
	}

	useEffect(() => {
		setFilteredSearchHistory((prev) =>
			searchHistory.filter((item) => {
				return item.includes(searchText);
			})
		);
	}, [searchHistory, searchText]);
	console.log(searchHistory);

	return (
		<div className="app">
			<div className="app-header">
				<h2 style={{ margin: "1rem" }}>Image Search</h2>
				<div className="search-bar">
					<div style={{ width: "55%" }}>
						<input
							type="search"
							className="search-input"
							value={searchText}
							onChange={onSearchInputChange}
							onKeyUp={(e) => {
								if (e.key === "Enter") {
									const trimmedText = e.target.value.replace(/\s\s+/g, " ");
									if (trimmedText.length) search(trimmedText, 1);
								}
							}}
							onFocus={(e) => {
								setShowSuggestions(true);
							}}
						/>
						{showSuggestions && filteredSearchHistory.length > 0 && (
							<ul
								style={{
									listStyle: "none",
									width: "52%",
									zIndex: "5",
									position: "absolute",
								}}
							>
								{filteredSearchHistory.map((query, idx) => (
									<li
										key={idx}
										style={{
											display: "block",
											padding: "0.5rem 0rem",
											backgroundColor: "#ffffff",
											color: "#222",
											borderBottom: "1px solid #aaa",
										}}
										onClick={(e) => {
											console.log("hello");
											search(query, 1);
											setSearchText(query);
											setShowSuggestions(false);
										}}
									>
										{query}
									</li>
								))}
								<li
									style={{
										display: "block",
										padding: "0.5rem 0rem",
										backgroundColor: "#ffffff",
										color: "blue",
										borderBottom: "1px solid #aaa",
									}}
									onClick={() => {
										setShowSuggestions(false);
									}}
								>
									<b>Hide</b>
								</li>
							</ul>
						)}
					</div>
				</div>
			</div>
			<div className="app-content">
				{showLoading === 2 ? (
					<h2>Loading...</h2>
				) : imgList.length ? (
					<ImageList images={imgList} onImageClick={handleImageClick} />
				) : (
					<p style={{ margin: "1rem" }}>No Search Results</p>
				)}
				<ReactCSSTransitionGroup
					transitionName="popup-container"
					transitionEnterTimeout={400}
					transitionLeaveTimeout={200}
				>
					{ImageInModal && (
						<ImageModal image={ImageInModal} onHide={onModalHide} />
					)}
				</ReactCSSTransitionGroup>
			</div>

			{showLoading === 1 ? <h2>Loading More....</h2> : <></>}

			<div style={{ height: "5rem" }}></div>
		</div>
	);
}
