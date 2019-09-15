'use strict'
// TMDB data
const apiKey = '49fbccf8628b93b244b322eff6a1fef6';
const movieUrl = 'https://api.themoviedb.org/3/search/movie';
const tvUrl = 'https://api.themoviedb.org/3/search/tv';

// NY times data
const nyTimesApiKey = 'SjDOdukwhvhx1ivKA01PA7xTeVXdw9Jg';
const nyTimesUrl = 'https://api.nytimes.com/svc/movies/v2/reviews/search.json';


function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getNyTimes(timesReview, releaseDate) {
    const params = {
        "api-key": nyTimesApiKey,
        query: timesReview
    }

    const queryString = formatQueryParams(params);
    const url = nyTimesUrl + '?' + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            
            let reviewDate = responseJson.results.find(movieDate => movieDate.opening_date === releaseDate)         
            
            renderNyTimesResults(reviewDate)
        })
}


// grabbing the data for movies
function getMovie(movieName) {
    const params = {
        api_key: apiKey,
        include_adult: false,
        query: movieName,
        language: "en-US"
    }

    const queryString = formatQueryParams(params);
    const url = movieUrl + '?' + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            clearResults()
            renderMovieResults(responseJson)
        })
        .catch(err => {
            $('#js-error-message').text(`somthing went wrong: ${err.message}`);
        });
}

// grabbing data for tv shows
function getTvShow(tvName) {
    const params= {
        api_key: apiKey,
        query: tvName,
        language: "en-US"
    }

    const queryString = formatQueryParams(params)
    const url = tvUrl + '?' + queryString;
    
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            clearResults()
            renderTvResults(responseJson)
        })
        .catch(err => {
            $('#js-error-message').text(`somthing went wrong: ${err.message}`);
        });
}


// clearing the previous results from the page after a new search
function clearResults() {
    $('main h2').siblings().remove()
}
// on page load renders movies now playing in theaters on screen
function renderMainScreen() {
    const url = 'https://api.themoviedb.org/3/movie/now_playing?api_key=49fbccf8628b93b244b322eff6a1fef6&language=en-US&page=1';

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson)
            clearResults()
            renderHtml(responseJson)
            $('main h2').text('Now playing')
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function renderPopularTv() {
    const url = 'https://api.themoviedb.org/3/tv/popular?api_key=49fbccf8628b93b244b322eff6a1fef6&language=en-US&page=1';

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson)
            clearResults()
            renderHtml(responseJson)
            $('main h2').text('Top Movies')
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function renderTopMovies () {
    const url = 'https://api.themoviedb.org/3/movie/top_rated?api_key=49fbccf8628b93b244b322eff6a1fef6&language=en-US&page=1';

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson)
            clearResults()
            renderHtml(responseJson)
            $('main h2').text('Top Movies')
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

// renders ny times results
function renderNyTimesResults(responseJson) {
  console.log(responseJson);
    $('#nyt h2').siblings().remove();
    const data = responseJson;
    if (data === undefined) $('#nyt').css('display', 'none');
    else {
        $('#nyt').css('display', 'block');

        $('#nyt').append(
        `<h3>${data.display_title}</h3>
        <p>Rating: ${data.mpaa_rating}</p>
        <p>${data.summary_short}</p>
        <a href="${data.link.url}">NY times full review</a>`)
    }
}

function renderDescription(title, description, vote) {
    $('#tmdb h2').siblings().remove();

    $('#tmdb').append(
        `<h3>${title}</h3>
        <p>${description}<p>
        <p>${vote} / 10`)
}

// renders results for movie results to the screen
function renderMovieResults(responseJson) {
    console.log(responseJson)
    renderHtml(responseJson)
        $('main h2').text('Movie results')

}
// renders results for tv shows to the screen
function renderTvResults(responseJson) {
    console.log(responseJson)
    renderTvHtml(responseJson)
        $('main h2').text('TV results')
}

function watchFormButton() {
    $('#search-container').submit(event => {
        event.preventDefault();
        const type = $('input[name="video-type"]:checked').val();
        const title = $('input[name="video-title"]').val();

        $('input[name="video-title"]').val("");

        if (type === 'movie') getMovie(title)
        else getTvShow(title)
    });
}

function popUpScreen() {
    // handles when an image is clicked
    $('#main-screen').on('click', '.thumbnail', function(e) {
        e.stopPropagation()
        const titleName = $(this).closest('input[type="image"]').val();
        const releaseDate = $(this).closest('input[type="image"]').data('release-date');
        const desciption = $(this).closest('input[type="image"]').data('overview');
        const vote = $(this).closest('input[type="image"]').data('vote');
        getNyTimes(titleName, releaseDate);
        renderDescription(titleName, desciption, vote);
        $('.pop-up').css('display', 'block')
    });

    $('#main-screen').on('click', '.TvThumbnail', function(e) {
        e.stopPropagation()
        const titleName = $(this).closest('input[type="image"]').val();
        console.log('titleName')
        const releaseDate = $(this).closest('input[type="image"]').data('release-date');
        const desciption = $(this).closest('input[type="image"]').data('overview');
        const vote = $(this).closest('input[type="image"]').data('vote');
        $('#nyt').empty();
        renderDescription(titleName, desciption, vote);
        $('.pop-up').css('display', 'block')
    });

    $('.pop-up').on('click', '#close', hidePopUp)
    $('body').on('click', hidePopUpIfVisible)

    function hidePopUpIfVisible(e) {
        const popUpVisible = $('.pop-up').is(':visible')
        if (!popUpVisible) return
        if ($(e.target).find('article').length)
            hidePopUp(e)
    }

    function hidePopUp(e) {
        $('.pop-up').css('display', 'none')
    }
}

function watchNav() {
    $('#nav-items').on('click', '#js-playingNow', function(e) {
        renderMainScreen()
    })

    $('#nav-items').on('click', '#js-topMovies', function(e) {
        renderTopMovies()
    })

    $('#nav-items').on('click', '#js-tvShow', function(e) {
        renderPopularTv()
    })
}

function renderHtml(responseJson) {
    const poster = 'https://image.tmdb.org/t/p/w500';
        let html='';
        responseJson.results.forEach((pic) =>
        html += `<input type="image"
            src="${poster}${pic.poster_path}"
            alt="${pic.title}" 
            data-release-date="${pic.release_date}"
            data-overview="${pic.overview}"
            data-vote="${pic.vote_average}"
            aria-pressed="false" value="${pic.title}" class="thumbnail js-img">`)
    $('#main-screen').append(html);
}

function renderTvHtml(responseJson) {
    const poster = 'https://image.tmdb.org/t/p/w500';
    let html = '';
        responseJson.results.forEach((pic) =>
        html += `<input type="image"
            src="${poster}${pic.poster_path}"
            alt="${pic.original_name}" 
            data-release-date="${pic.release_date}"
            data-overview="${pic.overview}"
            data-vote="${pic.vote_average}"
            aria-pressed="false" value="${pic.original_name}" class="TvThumbnail js-img">`)
    $('#main-screen').append(html);
}

function handlePage() {
    watchFormButton();
    watchNav();
    popUpScreen();
    renderMainScreen();
}

$(handlePage)
