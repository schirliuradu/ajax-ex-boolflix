

$(document).ready(function() {

    var currentPage; 
    var searchedString; 

    $('.header__search').click(function() {
        currentPage = 1;
        removePreviousResearch();
        renderTheLoadingIcon(); 
        getItems( getInputValue(), currentPage ); 
        cleanInputField(); 
        searchedString = $('.header__input').attr('value'); 
    }); 

    $('.header__input').keyup(function( e ) {
        if ( e.which === 13 ) {
            currentPage = 1;
            removePreviousResearch();
            renderTheLoadingIcon();
            getItems( getInputValue(), currentPage ); 
            searchedString = $('.header__input').attr('value'); 
            cleanInputField();     

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
            
            var selectedPage = parseInt($(this).attr('data-index')); 
            /*
                imposto il valore (globale) della pagina corrente a questa pagina, 
                così continuano a funzionare anche i bottoni avanti indietro, 
                correttamente 
            */
            currentPage = selectedPage; 
            console.log(currentPage); 
            
            removePreviousResearch();
            renderTheLoadingIcon(); 
            getItems( searchedString, selectedPage ); 
        }

    });


    $(document).on('click', '.item__popup-opener', function( ) {
        console.log('clickato'); 
        var currentItemID = $(this).closest('.item').attr('data-itemid'); 
        var currentItemType = $(this).closest('.item').attr('data-itemtype'); 

        getAllItemInfo( currentItemID, currentItemType ); 

    }); 

    $(document).on('click', '.itemPopup__closing-x', function() {

        $(this).closest('.relative-wrapper').remove(); 

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
    var value = $('.header__input').val(); 
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

/* 
    funzione che crea un array di array dato un array in input ( :D ) 
    --- mi serve per tenere traccia e caricare 20 risultati alla 
    volta, per la paginazione 
*/
function splitArrayInParts( arr ) { 
    // dichiaro array vuoto che conterra tutti gli array di 20 elementi
    var x = []; 
    // indice
    var i = 1; 
    var limit = 20;
    var k = 0;
    // ciclo fino a che ho tot array di 20 elementi ( tot calcolato in base alla lunghezza dell'array originale )
    while ( i <= Math.ceil(arr.length/20) ) {
        // dichiaro array vuoto, che verrà vuotato ogni ciclo, per prendere nuovi elementi
        var y = []; 
        // ciclo fino a che k è minore di 20 inizialmente ( del limite dopo il primo ciclo ) e fino a che non esaurisco l'array originale 
        while ( k < limit && k < arr.length ) { 
            // carico i singoli elementi in y, formando ogni volta un array di 20 elementi, tranne l'ultimo, che dipende dalla lunghezza dell'array originale
            y.push( arr[ k ] ); 
            k++; 
        } 
        // faccio slittare il limite di 20, per considerare ogni ciclo nuovi elementi
        limit += 20; 
        // carico l'array precedentemente creato in posizione j, nel nuovo array che restituirò alla fine 
        x.push( y ); 
        i++; 
    } 
    return x; 
}


/* 
    funzione che mi fa la chiamata su tutte le pagine, innescando un'altra chiamata, 
    per tirare giù subito tutti i risultati, e gestirli dopo con la paginazione
*/
function getItems( q, currentP ) {
    var chiave = '1c72c8fa9e2142b6517ecec927e56964'; 

    $.ajax({
        url: 'https://api.themoviedb.org/3/search/multi?api_key=' + chiave + '&language=language&page=1&query=q', 
        method: 'GET', 
        data: { 
            query: q,   
            language: 'it-IT'
        }, 
        success: function( data ) { 

            var array = []; 
            var i = 1; 
            while ( i <= data.total_pages ) {
                getAllItemsInOneArray( q, i, array );
                i++; 
            } 
            // work around :( dovuto, altrimenti mi restituisce prima l'array vuoto, prima di caricarlo (problema di asincronicità)
            setTimeout (function() {
                deleteTheLoadingIcon(); 
                manageQueriedItems( splitArrayInParts( array ), currentP ); 
            }, 500); 
    
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

// funzione che loopa su tutte le pagina, da chiamare dentro l'ajax che richiama solo la prima pagina 
function getAllItemsInOneArray( query, page, array ) {
    var chiave = '1c72c8fa9e2142b6517ecec927e56964'; 
    $.ajax({
        url: 'https://api.themoviedb.org/3/search/multi?api_key=' + chiave + '&language=language&page=page&query=query', 
        method: 'GET', 
        data: { 
            query: query,    
            language: 'it-IT', 
            page: page
        }, 
        success: function( data ) { 
            var j = 0;
            while ( j < data.results.length ) {
                // escludo ciò che non mi interessa dalla ricerca 
                if ( data.results[ j ].media_type === 'movie' || data.results[ j ].media_type === 'tv' ) {
                    // se manca la foto non lo carico ( per ragioni estetiche )
                    if ( data.results[ j ].poster_path != null ) {
                        array.push( data.results[ j ] ); 
                    }
                } 
                j++; 
            }
        } 
    }); 
}


// funzione che renderizza 20 pagine alla volta 
function renderTwentyResultsPerPage( array ) {
    for ( var j = 0; j < array.length; j++ ) { 
        displayQueriedItems( array, j ); 
    } 

}

// funzione che decide cosa fare nel caso in cui ci sono risultati della ricerca oppure no 
function manageQueriedItems( results, currentPage ) {
    if ( results.length > 0 ) { 
        var pagesNumber = results.length; 
        // mostro la paginazione (da riguardare dopo) 
        if ( pagesNumber > 1 ) {
            renderTwentyResultsPerPage( results[ currentPage - 1 ] ); 
            pagesRender( pagesNumber, currentPage ); 
            changeSelectedPage( currentPage, pagesNumber ); 
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
    var posterDim, posterUrl, posterPre, typeOfSelectedItem, titleName, originalTitleName, starsNumber, source, item, parameters, result;

    setContentToGrid(); 

    // gestisco alcuni campi diversi nell'oggetto di ritorno, nel caso di TV e Movies
    typeOfSelectedItem = arr[ index ].media_type;
    if ( typeOfSelectedItem === 'tv' ) {
        titleName = arr[ index ].name;
        originalTitleName = arr[ index ].original_name;
    } else if ( typeOfSelectedItem === 'movie' ) {
        titleName = arr[ index ].title; 
        originalTitleName = arr[ index ].original_title; 
    } 

    posterPre = 'https://image.tmdb.org/t/p/'; 
    posterDim = 'w342'; 
    posterUrl = posterPre + posterDim + arr[ index ].poster_path; 

    starsNumber = starsCalculator(arr[ index ].vote_average); 
    source = $("#item-template").html();
    item = Handlebars.compile(source); 

    parameters = {
        itemID: arr[ index ].id,
        itemType: typeOfSelectedItem, 
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


/* -------------------------- */
/* ------ V milestone ------ */
/* ------------------------ */ 


function getAllItemInfo( ID, type ) {
    var chiave = '1c72c8fa9e2142b6517ecec927e56964';  
    $.ajax({
        url: 'https://api.themoviedb.org/3/' + type + '/' + ID + '?api_key=' + chiave + '&language=it-IT&append_to_response=credits',
        method: 'GET', 

        success: function( data ) { 
            var cast = createArrayWithCast( data ); 
            manageItemInfos( data, type, cast ); 
        }
    });
} 


// funzione che, dato un oggetto, ritorna un array contenente il cast (i primi 5, se ci sono)
function createArrayWithCast( obj ) {
    var attori = [];

    // ne prendo solo 5 (i primi 5)
    var i = 0; 
    var limit = 5; 
    
    // nel caso in cui non ci siano attori (cast non definito) ritorna un array vuoto, da gestire successivamente! 
    obj.credits.cast.length > 4 ? limit = 5 : limit = obj.credits.cast.length;

    while ( i < limit ) {
        attori.push( obj.credits.cast[ i ] ); 
        i++; 
    }

    return attori ; 
}

function manageItemInfos( object, type, castArray ) {
    var numeroStelle, source, item, parameters, result, titleName, originalTitleName; 

    numeroStelle = starsCalculator(object.vote_average); 
    if ( type === 'tv' ) {
        titleName = object.name;
        originalTitleName = object.original_name;
    } else if ( type === 'movie' ) {
        titleName = object.title; 
        originalTitleName = object.original_title; 
    } 

    source = $("#single-item-template").html();
    item = Handlebars.compile(source); 
    parameters = {
        titolo: titleName,
        titoloOriginale: originalTitleName, 
        imageUrl: 'https://image.tmdb.org/t/p/w780' + object.poster_path, 
        linguaOriginale: flagSwitcher( object.original_language ),
        descrizione: object.overview, 
        stelle: renderStars( numeroStelle ), 
        generi: genresRender( object.genres ), 
        casting: castRender( castArray ) 
    };  

    result = item(parameters); 
    $('body').append(result); 

} 

function genresRender( array ) {
    var stringaFinale = ''; 
    var i = 0; 

    if ( array.length > 0 ) {
        while ( i < array.length ) {
            stringaFinale += '<span class="itemPopup__genre">' + array[ i ].name + '</span>';
            i++; 
        }
    }
    return stringaFinale; 
}

function castRender( array ) {
    var image = 'img/other/user.png'; 
    var stringa = ''; 
    var i = 0;
    if ( array.length > 0 ) {
        while ( i < array.length ) {
            if ( array[ i ].profile_path != null ) {
                image = 'https://image.tmdb.org/t/p/w45' + array[ i ].profile_path;
            }
            stringa += '<div class="itemPopup__cast-member"><img class="itemPopup__cast-member--photo" src="' + image + '"><span class="itemPopup__cast-member--name">' + array[ i ].name + '</span></div>'; 
            i++;
        }
    }
    return stringa; 
} 