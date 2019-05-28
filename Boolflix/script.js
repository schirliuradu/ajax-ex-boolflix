

$(document).ready(function() {

    $('.header__search').click(function() {

        getItems( getInputValue() ); 
        cleanInputField(); 

    }); 

    $('.header__input').keyup(function( e ) {

        if ( e.which === 13 ) {
            getItems( getInputValue() ); 
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
function getItems( q ) {
    var chiave = '1c72c8fa9e2142b6517ecec927e56964'; 
    $.ajax({
        url: 'https://api.themoviedb.org/3/search/multi?api_key=' + chiave + '&language=language&page=1&query=q', 
        method: 'GET', 
        data: { 
            query: q,     // l'anno lo metto come valore fisso, tanto non ci interessa considerarne altri 
            language: 'it-IT' 
        }, 
        success: function( data ) { 
    
            manageQueriedItems( data ); 
    
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
function manageQueriedItems( obj ) {
    var results = obj.results;

    if ( results.length !== 0 ) {
        for ( var i = 0; i < results.length; i++ ) {
            displayQueriedItems( results, i ); 
        }
    } else {
        displayAlternativeMessage(); 
    }
}

// funzione che, dato il numero di stelle in input stampa quel numero di stelle piene, e, se il numero è minore di 5, le altre le stampa vuote 
function renderStars( n ) {
    var stars, emptyStar, fullStar, i;

    stars = ''; 
    emptyStar = '<i class="far fa-star"></i>'; 
    fullStar  = '<i class="fas fa-star"></i>';
    i = 1; 

    while ( i <= 5 ) {
        i <= n ? stars += fullStar : stars += emptyStar; 
        i++; 
    }

    return stars; 
}

// funzione che mostra a video i risultati della ricerca 
function displayQueriedItems( arr, index ) {
    var posterDim, posterUrl, typeOfSelectedItem, titleName, originalTitleName, starsNumber, source, item, parameters, result;

    setContentToGrid(); 

    // gestisco alcuni campi diversi nell'oggetto di ritorno, nel caso di TV e Movies
    typeOfSelectedItem = arr[ index ].media_type;
    if ( typeOfSelectedItem === 'tv' ) {
        titleName = arr[ index ].name;
        originalTitleName = arr[ index ].original_name;
    } else {
        titleName = arr[ index ].title; 
        originalTitleName = arr[ index ].original_title; 
    }


    posterDim = 'w342'; 
    posterUrl = arr[ index ].poster_path; 

    if ( arr[ index ].poster_path === 'null' ) {
        posterDim = 'w300'; 
        posterUrl = arr[ index ].backdrop_path;
    }



    starsNumber = starsCalculator(arr[ index ].vote_average); 
    source = $("#item-template").html();
    item = Handlebars.compile(source); 

    console.log('https://image.tmdb.org/t/p/​' + posterDim + posterUrl); 

    parameters = {
        imagePath: 'https://image.tmdb.org/t/p/​' + posterDim + posterUrl, 
        type: typeOfSelectedItem,
        title: titleName, 
        originalTitle: originalTitleName, 
        originalLanguage: flagSwitcher( arr[ index ].original_language ), 
        rating: renderStars( starsNumber )
    };  

    result = item(parameters); 
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

// funzione che decide quale flag mostrare in base alla lingua originale ricevuta in input 
function flagSwitcher( lang ) {
    var result; 

    switch( lang ) {
        case 'it':
        case 'en':
        case 'pt':
        case 'es':
        case 'fr':
        case 'de':
            result = '<img class="item__flag-img" src="./flags/' + lang + '.png">';
            break;
        default:
            result = lang; 
            break;
    }
    return result; 
}

