

$(document).ready(function() {

    var currentPage; 
    var searchedString; 

    $('.header__search').click(function() {
        removePreviousResearch();
        renderTheLoadingIcon(); 
        getItems( getInputValue() ); 
        cleanInputField(); 
        searchedString = $('.header__input').attr('value'); 
        currentPage = 1;
    }); 

    $('.header__input').keyup(function( e ) {
        if ( e.which === 13 ) {
            removePreviousResearch();
            renderTheLoadingIcon();
            getItems( getInputValue() ); 
            searchedString = $('.header__input').attr('value'); 
            cleanInputField();     
            currentPage = 1;
        }
    });

    // gestore button avanti di una pagina 
    $(document).on('click', '.pagination__go-forw', function() {
        removePreviousResearch();
        renderTheLoadingIcon();
        currentPage++; 
        getItems( searchedString, currentPage ); 

    }); 

    // gestore button indietro di una pagina 
    $(document).on('click', '.pagination__go-back', function() {
        removePreviousResearch();
        renderTheLoadingIcon();
        currentPage--; 
        getItems( searchedString, currentPage ); 
    }); 


    // gestore pagina clickata direttamente 
    $(document).on('click', '.pagination__item-number', function() {

        if ( !$(this).hasClass('selected-page') ) {
            
            var selectedPage = $(this).attr('data-index'); 
            /*
                imposto il valore (globale) della pagina corrente a questa pagina, 
                così continuano a funzionare anche i bottoni avanti indietro, 
                correttamente 
            */
            currentPage = selectedPage; 
            
            removePreviousResearch();
            renderTheLoadingIcon(); 
            getItems( searchedString, selectedPage ); 
        }

    });

}); 

// -------------- 

function renderTheLoadingIcon() {
    var icon = '<div class="loader"><i class="fas fa-spinner"></i></div>'; 
    $('.content').prepend(icon); 
}

function deleteTheLoadingIcon() { 
    $('.loader').remove(); 
}

// funzione che restituisce la stringa digitata dall'utente
function getInputValue() {
    var value; 

    if ( $('.header__input') !== '' ) {
        value = $('.header__input').val(); 
    }

    // memorizzo il valore cercato - mi serve per la paginazione 
    $('.header__input').attr('value', $('.header__input').val()); 

    return value; 
}

// funzione che ripulisce l'input dalla stringa digitata e svuota il contenitore dalla precedente ricerca 
function cleanInputField() {
    $('.header__input').val(''); 
    // toglie il focus dall'input 
    $('.header__input').blur(); 
}

function removePreviousResearch() {
    $('.content').empty(); 

    setContentToFlex(); 
    if ( $('.pagination') ) {
        $('.pagination').remove(); 
    }
}


// ajax call for movies 
function getItems( q, pagina ) {
    var chiave = '1c72c8fa9e2142b6517ecec927e56964'; 
    var queryString = q; 
    $.ajax({
        url: 'https://api.themoviedb.org/3/search/multi?api_key=' + chiave + '&language=language&page=pagina&query=queryString', 
        method: 'GET', 
        data: { 
            query: queryString,     // l'anno lo metto come valore fisso, tanto non ci interessa considerarne altri 
            language: 'it-IT', 
            page: pagina
        }, 
        success: function( data ) { 

            deleteTheLoadingIcon(); 
            manageQueriedItems( data ); 
    
        }, 
        error: function( error ) { 
            deleteTheLoadingIcon(); 
            if ( queryString === '' ) {
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
    var items = []; 

    if ( results.length > 0 ) {

        // mostro la paginazione 
        var pagesNumber = obj.total_pages; 
        if ( pagesNumber > 1 ) {
            pagesRender( pagesNumber, obj.page ); 
            changeSelectedPage( obj.page, pagesNumber ); 
        } 

        /* 
            La chiamata MULTI restituisce oltre a type movie e tv anche persone e altro. Questo ciclo 
            ripulisce l'array dei risultati ricevuti dagli oggetti che a noi non interessa, lasciando 
            solo le serie tv e i film! 
        */
        for ( var i = 0; i < results.length; i++ ) { 
            if ( results[ i ].media_type === 'movie' || results[ i ].media_type === 'tv' ) {
                items.push( results[ i ] );
            }
        }

        // passo l'array rielaborato, dal quale ho tolto le tipologie che non mi interessavano 
        for ( var j = 0; j < items.length; j++ ) { 
            displayQueriedItems( items, j ); 
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
    var posterDim, posterUrl, alternativeImg, posterPre, typeOfSelectedItem, titleName, originalTitleName, starsNumber, source, item, parameters, result;

    setContentToGrid(); 

    // gestisco alcuni campi diversi nell'oggetto di ritorno, nel caso di TV e Movies
    typeOfSelectedItem = arr[ index ].media_type;
    if ( typeOfSelectedItem === 'tv' ) {
        titleName = arr[ index ].name;
        originalTitleName = arr[ index ].original_name;
        alternativeImg = './img/other/TvSer.png';
    } else if ( typeOfSelectedItem === 'movie' ) {
        titleName = arr[ index ].title; 
        originalTitleName = arr[ index ].original_title; 
        alternativeImg = 'img/other/Movie.png';
    } 


    posterPre = 'https://image.tmdb.org/t/p/'; 
    posterDim = 'w342'; 
    posterUrl = posterPre + posterDim + arr[ index ].poster_path; 

    if ( arr[ index ].poster_path == null && arr[ index ].backdrop_path != null ) {
        posterDim = 'w300'; 
        posterUrl =  posterPre + posterDim + arr[ index ].backdrop_path;
    } else if ( (arr[ index ].backdrop_path === null) && ( arr[ index ].poster_path ) === null) {
        posterUrl = alternativeImg; 
    }

    starsNumber = starsCalculator(arr[ index ].vote_average); 
    source = $("#item-template").html();
    item = Handlebars.compile(source); 

    parameters = {
        imagePath: posterUrl, 
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
            result = '<img class="item__flag-img" src="./img/flags/' + lang + '.png">';
            break;
        default:
            result = lang; 
            break;
    }
    return result; 
}


/* ------------------------- */
/* ------ pagination ------ */
/* ----------------------- */ 

// funzione che disegna la lista delle pagine 

function displayPages( n, curPage ) {
    var string = ''; 
    var minPage = curPage; 
    var maxPage = minPage + 4; 
    var i = 1;

    if ( n < 5 ) { 
        // caso base
        for ( var i = 1; i <= n; i++ ) {
            string += '<span class="pagination__item-number" data-index="' + i + '">' + i + '</span>'; 
        }
        // caso nel mezzo ( oltre 5 e fino a n - 5)
    } else if ( n > 5 && maxPage <= n ) {
        for ( var j = minPage; j <= maxPage; j++ ) {
            string += '<span class="pagination__item-number" data-index="' + j + '">' + j + '</span>';
        }
    } else {
        // caso limite: smette di aggiungere pagine alla lista quando arriva in fondo 
        for ( var k = n-4; k <= n; k++ ) {
            string += '<span class="pagination__item-number" data-index="' + k + '">' + k + '</span>';
        }        
    }

    return string;  
} 

// funzione che renderizza le pagine a schermo, se e dove ci sono 
function pagesRender( pageNumber, currentPage ) {
    var source, pagination, parameters, result; 
    // includere nuovo template handlebars 
    source = $("#page-template").html();
    pagination = Handlebars.compile(source); 

    parameters = {
        pages: displayPages( pageNumber, currentPage )
    };  

    result = pagination(parameters); 
    $(result).insertAfter( $('.content') ); 
}

// funzione che gestisce lo scorrimento delle pagine ( dei bottoni più precisamente )
function changeSelectedPage( currentPage, totalPages ) { 
    $('.pagination__item-number').removeClass('.selected-page'); 
    $('.pagination__item-number[data-index="' + currentPage + '"]').addClass('selected-page'); 
    $('.pagination').attr('data-totalPages', totalPages); 

    // se sono sull'ultima pagina --- disabilito il bottone avanti
    if ( currentPage === totalPages ) {
        $('.pagination__go-forw').attr('disabled', true); 
    // se sono sulla prima pagina --- disabilito il bottone indietro
    } else if ( currentPage === 1 ) {
        $('.pagination__go-back').attr('disabled', true); 
    }
} 