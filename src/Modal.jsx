import React from "react";
import "./Modal.css";

const Modal = ({ show, onClose, movie, onPlay }) => {
  if (!show || !movie) return null;

  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {movie.poster_path && (
          <img
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
            className="modal-poster"
          />
        )}
        <h2>{movie.title}</h2>
        <p>
          {movie.releaseYear} | {movie.runtime} min | {movie.vote_average}{" "}
          <span>★</span>
        </p>
        <p>Genre: {movie.genres}</p>
        <p className="desc">{movie.description}</p>

        <button onClick={onPlay} className="modal-play-button">
          Play Now
        </button>
        <button className="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
