

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

        setContentToGrid(); 
        for ( var i = 0; i < movies.length; i++ ) {

            displayQueriedMovies( movies, i ); 

        }

    } else {

        setContentToFlex(); 
        // make new handlebare  template for the visualization of nothing (a string in all the entire page)
        displayAlternativeMessage(); 

    }

}


// funzione che mostra a video i risultati della ricerca 
function displayQueriedMovies( arr, index ) {

    var source = $("#movie-template").html();
    var movie = Handlebars.compile(source);

    var parameters = {
        title: arr[ index ].title, 
        originalTitle: arr[ index ].original_title, 
        originalLanguage: arr[ index ].original_language,
        vote: arr[ index ].vote_average
    };

    var result = movie(parameters);

    $('.content').append(result); 

}


// funzione che mostra a video la mancanza di match nella ricerca 
function displayAlternativeMessage() { 
    var string = 'Non ci sono film per la ricerca eseguita. Cerca un\'altra parola chiave del titolo!'; 
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