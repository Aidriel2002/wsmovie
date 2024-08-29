import React, { useState, useRef, useEffect } from "react";
import "./Style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Modal from "./Modal";

const API_KEY = "bd924acd32bed44d4032cc142dc4b80a";
const MOVIE_ID = "118406";
const movie_API = "https://vidsrc.xyz/embed/movie?imdb=";
const tv_API = "https://api.themoviedb.org/3/tv/popular?api_key=" + API_KEY;

const App = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isHomeVisible, setIsHomeVisible] = useState(true);
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);

  const popularCarouselRef = useRef(null);
  const topRatedCarouselRef = useRef(null);
  const tvCarouselRef = useRef(null);
  const searchResultsCarouselRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);

        const movieResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${MOVIE_ID}?api_key=${API_KEY}`
        );
        if (!movieResponse.ok) throw new Error("Movie API Error");
        const movieData = await movieResponse.json();
        const releaseYear = movieData.release_date.split("-")[0];
        const formattedVoteAverage = movieData.vote_average.toFixed(1);

        const videoResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${MOVIE_ID}/videos?api_key=${API_KEY}`
        );
        if (!videoResponse.ok) throw new Error("Video API Error");
        const videoData = await videoResponse.json();
        const trailer = videoData.results.find((v) => v.type === "Trailer");
        const genres = movieData.genres.map((genre) => genre.name).join(", ");

        setMovie({
          title: movieData.title,
          genres: genres,
          description: movieData.overview,
          vote_average: formattedVoteAverage,
          poster_path: movieData.poster_path,
          trailerKey: trailer ? trailer.key : "",
          releaseYear: releaseYear,
          runtime: movieData.runtime,
          genre: movieData.genres.length ? movieData.genres[0].name : "Unknown",
          imdb_id: movieData.imdb_id,
          id: movieData.id,
        });
      } catch (err) {
        setError("An error occurred while fetching movie data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchPopularMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
        );
        if (!response.ok) throw new Error("Popular Movies API Error");
        const data = await response.json();
        setPopularMovies(data.results);
      } catch (err) {
        setError("An error occurred while fetching popular movies.");
      }
    };

    const fetchTopRatedMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}`
        );
        if (!response.ok) throw new Error("Top Rated Movies API Error");
        const data = await response.json();
        setTopRatedMovies(data.results);
      } catch (err) {
        setError("An error occurred while fetching top-rated movies.");
      }
    };

    const fetchTvShows = async () => {
      try {
        const response = await fetch(tv_API);
        if (!response.ok) throw new Error("TV Shows API Error");
        const data = await response.json();
        setTvShows(data.results || []);
      } catch (err) {
        setError("An error occurred while fetching TV shows.");
      }
    };

    fetchMovieData();
    fetchPopularMovies();
    fetchTopRatedMovies();
    fetchTvShows();
  }, []);

  const handlePlay = () => {
    if (movie?.imdb_id) {
      window.open(`${movie_API}${movie.imdb_id}`, "_blank");
    } else {
      alert("No trailer available.");
    }
  };

  const toggleBurgerMenu = () => setIsBurgerMenuOpen(!isBurgerMenuOpen);
  const handleMoreInfo = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const toggleMute = () => setIsMuted(!isMuted);
  const truncateDescription = (text) =>
    text.length > 150 ? text.substring(0, 150) + "..." : text;

  const handleMovieClick = async (movieId) => {
    try {
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
      );
      if (!movieResponse.ok) throw new Error("Movie API Error");

      const movieData = await movieResponse.json();

      const releaseYear = movieData.release_date.split("-")[0];
      const formattedVoteAverage = movieData.vote_average.toFixed(1);

      setMovie({
        title: movieData.title || "Unknown Title",
        description: movieData.overview || "No description available.",
        poster_path: movieData.poster_path || "",
        releaseYear: releaseYear || "Unknown",
        runtime: movieData.runtime || "N/A",
        vote_average: formattedVoteAverage || "N/A",
        imdb_id: movieData.imdb_id,
        genres: movieData.genres
          ? movieData.genres.map((genre) => genre.name).join(", ")
          : "Unknown",
      });
      setIsModalOpen(true);
      console.log(movieData);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch movie data. Please try again later.");
    }
  };

  const scrollCarousel = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setIsHomeVisible(true);
      return;
    }

    try {
      setIsHomeVisible(false);
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (!response.ok) throw new Error("Search API Error");
      const data = await response.json();
      setSearchResults(data.results);
    } catch (err) {
      setError("An error occurred while searching.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <nav className={isNavScrolled ? "scrolled" : ""}>
        <div className="burger-menu" onClick={toggleBurgerMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className={`nav-links ${isBurgerMenuOpen ? "active" : ""}`}>
          <div className="nav-right">
            <h3>
              <span>D'</span>movies
            </h3>
            <a href="#Home">Home</a>
            <a href="#List">New & Popular</a>
            <a href="#Movie">Top Rated Movies</a>
            <a href="#Series">TV Shows</a>
          </div>
        </div>
        <div className="srchbar">
          <input
            type="search"
            className="srchb"
            placeholder="Search Movie"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button className="Ssbttn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </nav>
      {isHomeVisible ? (
        <section id="Home">
          <div className="movie-container">
            {movie?.trailerKey && (
              <div className="video-container">
                <iframe
                  id="player"
                  className="background-video"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${
                    movie.trailerKey
                  }?autoplay=1&loop=1&playlist=${movie.trailerKey}&mute=${
                    isMuted ? 1 : 0
                  }`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Trailer"
                ></iframe>
              </div>
            )}

            <div className="content">
              <div>
                <div className="title-and-type">
                  <h2>{movie?.genre}</h2>
                  <h1>{movie?.title}</h1>
                  <p>{truncateDescription(movie?.description)}</p>
                </div>
              </div>
              <br />
              <div className="button-container">
                <button onClick={handlePlay} className="pbuttn">
                  <i className="fas fa-play"></i>&nbsp; Play
                </button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button onClick={handleMoreInfo} className="more-info-button">
                  <i className="fas fa-info-circle"></i>&nbsp; More Info
                </button>{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button onClick={toggleMute} className="sound-toggle-button">
                  <i
                    className={`fas ${
                      isMuted ? "fa-volume-mute" : "fa-volume-up"
                    }`}
                  ></i>
                </button>
              </div>
            </div>
            <Modal
              show={isModalOpen}
              onClose={handleCloseModal}
              movie={movie}
              onPlay={handlePlay}
            />
          </div>
        </section>
      ) : (
        <section id="SearchResults">
          <h2>Search Results</h2>
          <div className="carousel-container">
            <button
              className="carousel-arrow left"
              onClick={() => scrollCarousel("left", searchResultsCarouselRef)}
            >
              &lt;
            </button>
            <div className="carousel" ref={searchResultsCarouselRef}>
              {searchResults.length > 0 ? (
                searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    className="carousel-item"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="carousel-image"
                    />
                    <p>{movie.title}</p>
                  </div>
                ))
              ) : (
                <p>No results found.</p>
              )}
            </div>
            <button
              className="carousel-arrow right"
              onClick={() => scrollCarousel("right", searchResultsCarouselRef)}
            >
              &gt;
            </button>
          </div>
        </section>
      )}

      <section id="List">
        <h2>New & Popular</h2>
        <div className="carousel-container">
          <button
            className="carousel-arrow left"
            onClick={() => scrollCarousel("left", popularCarouselRef)}
          >
            &lt;
          </button>
          <div className="carousel" ref={popularCarouselRef}>
            {popularMovies.map((movie) => (
              <div
                key={movie.id}
                className="carousel-item"
                onClick={() => handleMovieClick(movie.id)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="carousel-image"
                />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
          <button
            className="carousel-arrow right"
            onClick={() => scrollCarousel("right", popularCarouselRef)}
          >
            &gt;
          </button>
        </div>
      </section>

      <section id="Movie">
        <h2>Top Rated Movies</h2>
        <div className="carousel-container">
          <button
            className="carousel-arrow left"
            onClick={() => scrollCarousel("left", topRatedCarouselRef)}
          >
            &lt;
          </button>
          <div className="carousel" ref={topRatedCarouselRef}>
            {topRatedMovies.map((movie) => (
              <div
                key={movie.id}
                className="carousel-item"
                onClick={() => handleMovieClick(movie.id)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="carousel-image"
                />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
          <button
            className="carousel-arrow right"
            onClick={() => scrollCarousel("right", topRatedCarouselRef)}
          >
            &gt;
          </button>
        </div>
      </section>

      <section id="Series">
        <h2>TV Shows</h2>
        <div className="carousel-container">
          <button
            className="carousel-arrow left"
            onClick={() => scrollCarousel("left", tvCarouselRef)}
          >
            &lt;
          </button>
          <div className="carousel" ref={tvCarouselRef}>
            {tvShows.length > 0 ? (
              tvShows.map((show) => (
                <div
                  key={show.id}
                  className="carousel-item"
                  onClick={() => handleMovieClick(show.id)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                    alt={show.name}
                    className="carousel-image"
                  />
                  <p>{show.name}</p>
                </div>
              ))
            ) : (
              <p>No TV shows available.</p>
            )}
          </div>
          <button
            className="carousel-arrow right"
            onClick={() => scrollCarousel("right", tvCarouselRef)}
          >
            &gt;
          </button>
        </div>
      </section>

      <footer>
        <p>
          &copy; 2024 <span>D'</span>MOVIES. All rights reserved.
        </p>
      </footer>

      {isModalOpen && (
        <Modal
          show={isModalOpen}
          onClose={handleCloseModal}
          movie={movie}
          onPlay={handlePlay}
        />
      )}
    </>
  );
};

export default App;
