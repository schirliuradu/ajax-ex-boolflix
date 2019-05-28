

$(document).ready(function() {

    $('.header__search').click(function() {

        getMovies( getInputValue() ); 
        cleanInputField(); 

    }); 

    $('.header__input').keyup(function( e ) {

        if ( e.which === 13 ) {
            getMovies( getInputValue() ); 
            cleanInputField();         
        }

    });

}); 


// -------------- 

// funzione che restituisce la stringa digitata dall'utente
function getInputValue() {
    var value; 

    if ( $('.header__input') !== '' ) {
        value = $('.header__input').val(); 
    }

    return value; 
}

// funzione che ripulisce l'input dalla stringa digitata e svuota il contenitore dalla precedente ricerca 
function cleanInputField() {
    $('.header__input').val(''); 
    // toglie il focus dall'input 
    $('.header__input').blur(); 
    // also cleaning the container from previous research
    $('.content').empty(); 
}

// ajax call for movies 
function getMovies( q ) {
    var chiave = '1c72c8fa9e2142b6517ecec927e56964'; 
    $.ajax({
        url: 'https://api.themoviedb.org/3/search/movie?api_key=' + chiave + '&language=language&query=query', 
        method: 'GET', 
        data: { 
            query: q,     // l'anno lo metto come valore fisso, tanto non ci interessa considerarne altri 
            language: 'it-IT' 
        }, 
        success: function( data ) { 
    
            manageQueriedMovies( data ); 
    
        }, 
        error: function( error ) { 

            if ( q === '' ) {
                alert('Please fill the input with the film title that you want to find!'); 
            } else {
                alert('There\'s something wrong! ' + error); 
            }
        }
    });
}

// funzione che decide cosa fare nel caso in cui ci sono risultati della ricerca oppure no 
function manageQueriedMovies( obj ) {
    var movies = obj.results;

    if ( movies.length !== 0 ) {
        for ( var i = 0; i < movies.length; i++ ) {
            displayQueriedMovies( movies, i ); 
        }
    } else {
        displayAlternativeMessage(); 
    }
}

// funzione che, dato il numero di stelle in input stampa quel numero di stelle piene, e, se il numero è minore di 5, le altre le stampa vuote 
function renderStars( n ) {
    var stars, emptyStar, fullStar, i;

    stars = ''; 
    emptyStar = '<i class="far fa-star" data-index="1"></i>'; 
    fullStar  = '<i class="fas fa-star" data-index="1"></i>';
    i = 1; 

    while ( i <= 5 ) {
        i <= n ? stars += fullStar : stars += emptyStar; 
        i++; 
    }

    return stars; 
}

// funzione che mostra a video i risultati della ricerca 
function displayQueriedMovies( arr, index ) {
    var starsNumber, source, movie, parameters, result;

    setContentToGrid(); 

    starsNumber = starsCalculator(arr[ index ].vote_average); 
    source = $("#movie-template").html();
    movie = Handlebars.compile(source); 

    parameters = {
        title: arr[ index ].title, 
        originalTitle: arr[ index ].original_title, 
        originalLanguage: flagSwitcher( arr[ index ].original_language ), 
        rating: renderStars( starsNumber )
    };  

    result = movie(parameters); 
    $('.content').append(result); 
}

// funzione che mostra a video la mancanza di match nella ricerca 
function displayAlternativeMessage() { 
    var string = 'Non ci sono film per la ricerca eseguita. Cerca un\'altra parola chiave del titolo!'; 
    setContentToFlex(); 
    $('.content').append('<p class="result">' + string + '</p>'); 
}

// funzione che setta il contenitore in forma di griglia se ci sono risultati 
function setContentToFlex() {
    $('.content').removeClass('content--grid').addClass('content--flex'); 
}

// altrimenti lo setta come flex, per levare la griglia e centrare la stringa 
function setContentToGrid() {
    $('.content').removeClass('content--flex').addClass('content--grid'); 
}

// funzione che divide e arrotonda il voto con eccesso per decidere il numero di stelle da renderizzare 
function starsCalculator( num ) {

    return Math.ceil( num/2 ); 

} 


function flagSwitcher( lang ) {
    var result; 

    switch( lang ) {
        case 'it':
        case 'en':
        case 'pt':
        case 'es':
        case 'fr':
        case 'de':
            result = '<img class="movie__flag-img" src="./flags/' + lang + '.png">';
            break;
        default:
            result = lang; 
            break;
    }
    return result; 
}