
var dataController = function() {

    // API key 
    var chiave = '1c72c8fa9e2142b6517ecec927e56964'; 

    var Search = function ( query, currentPage ) {
        this.query = query;
        this.currentPage = currentPage;
    }

    // allego metodi inerenti all'oggetto direttamente sul prototipo 
    Search.prototype = {
        getSearchResults: function() {
            // salvo 'this' prima della chiusura 
            var self = this; 
            $.ajax({
                url: 'https://api.themoviedb.org/3/search/multi?api_key=' + chiave + '&language=language&page=1&query=query', 
                method: 'GET', 
                data: { 
                    query: self.query,    
                    language: 'it-IT'
                }, 
                success: function( data ) {     
                    var array = []; 
                    var i = 1; 
                    while ( i <= data.total_pages ) {
                        self.getAllItemsInOneArray(self.query, i, array); 
                        i++; 
                    } 
                    self.results = array; 
                }, 
                error: function( error ) { 
                    if ( self.query === '' ) {
                        alert('Please fill the input with the film title that you want to find!'); 
                    } else {
                        alert('There\'s something wrong! ' + error); 
                    } 
                } 
            });     
        }, 

    
        getAllItemsInOneArray: function( q, i, array ) {
            $.ajax({ 
                url: 'https://api.themoviedb.org/3/search/multi?api_key=' + chiave + '&language=language&page=page&query=query', 
                method: 'GET', 
                data: { 
                    query: q,    
                    language: 'it-IT', 
                    page: i
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
    }

    var Item = function( id, type ) {
        this.id = id;
        this.type = type; 
    }

    // allego metodi inerenti all'oggetto direttamente sul prototipo 
    Item.prototype = { 
        getAllItemInfo: function() {
            // salvo 'this' prima della chiusura 
            var self = this; 
            $.ajax({
                url: 'https://api.themoviedb.org/3/' + this.type + '/' + this.id + '?api_key=' + chiave + '&language=it-IT&append_to_response=credits',
                method: 'GET', 
                success: function( data ) { 
                    self.information = data; 
                    self.cast = self.getItemCast( self.information ); 
                }
            });
        }, 

        getItemCast: function( obj ) {
            var attori = [],
                i = 0, 
                limit = 5; 

            obj.credits.cast.length > 4 ? limit = 5 : limit = obj.credits.cast.length;
            while ( i < limit ) {
                attori.push( obj.credits.cast[ i ] ); 
                i++; 
            } 
            return attori ; 
        }
    }

    function splitArrayInParts( arr ) {
        var x = [], 
            i = 1,
            limit = 20,
            k = 0; 
        // ciclo fino a che ho tot array di 20 elementi ( tot calcolato in base alla lunghezza dell'array originale )
        while ( i <= Math.ceil(arr.length/20) ) {
            var y = []; 
            // ciclo fino a che k è minore di 20 inizialmente ( del limite dopo il primo ciclo ) e fino a che non esaurisco l'array originale 
            while ( k < limit && k < arr.length ) { 
                y.push( arr[ k ] ); 
                k++; 
            } 
            // faccio slittare il limite di 20, per considerare ogni ciclo nuovi elementi
            limit += 20; 
            x.push( y ); 
            i++; 
        } 
        return x; 
    }

    // Revealing public methods 
    return {
        Search: Search, 
        Item: Item, 
        splitArrayInParts: splitArrayInParts
    }

}();


var UIController = function( $ ) {

    function renderTheLoadingIcon() {
        var icon = '<div class="loader"><i class="fas fa-circle-notch"></i></div>'; 
        $('.content').prepend(icon); 
    }
    
    function deleteTheLoadingIcon() { 
        $('.loader').remove(); 
    }
    
    // funzione che restituisce la stringa digitata dall'utente
    function getInputValue() {
        var value = $('.header__input').val(); 

        // Se string.length < 3 !!! alert ( evito sovraccarichi di richiesta al server )
        if ( value.length > 2 ) {                                           
            // memorizzo il valore cercato - mi serve per la paginazione 
            $('.header__input').attr('value', $('.header__input').val()); 
            return value; 
        } else {
            alert('The string should contain at least 3 characters. Please write a valid string!'); 
        }
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
    
    // funzione che renderizza 20 pagine alla volta 
    function renderTwentyResultsPerPage( array ) {
        for ( var j = 0; j < array.length; j++ ) { 
            displayQueriedItems( array, j ); 
        } 
    }
    
    // METTERE NELL'APP GENERALE 
    function displaySearchResults( results, currentPage ) { 
        deleteTheLoadingIcon();
        if ( results.length > 0 ) { 
            var pagesNumber = results.length; 
            renderTwentyResultsPerPage( results[ currentPage - 1 ] ); 
            // mostro la paginazione (da riguardare dopo) 
            if ( pagesNumber > 1 ) {
                pagesRender( pagesNumber, currentPage ); 
                changeSelectedPage( currentPage, pagesNumber ); 
            } 
        } else {
            displayAlternativeMessage(); 
        }
    }
    
    function renderStars( n ) {
        var stars = '', 
            emptyStar = '<i class="far fa-star"></i>', 
            fullStar = '<i class="fas fa-star"></i>', 
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
    
        starsNumber = Math.ceil( (arr[ index ].vote_average) / 2 );
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
    
    function displayAlternativeMessage() { 
        var string = 'Non ci sono film per la ricerca eseguita. Cerca un\'altra parola chiave del titolo!'; 
        setContentToFlex(); 
        $('.content').append('<p class="result">' + string + '</p>'); 
    }
    
    function setContentToFlex() {
        $('.content').removeClass('content--grid').addClass('content--flex'); 
    }
    
    function setContentToGrid() {
        $('.content').removeClass('content--flex').addClass('content--grid'); 
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
        var string = '',
            minPage = curPage, 
            maxPage = minPage + 4,  
            i = 1;
    
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

        source = $("#page-template").html();
        pagination = Handlebars.compile(source); 
    
        parameters = { pages: displayPages( pageNumber, currentPage ) };  
    
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

      /* ------------------------------- */
     /* ------ V - VI milestone ------ */
    /* ----------------------------- */ 

    function displayItemInfos( object, type, castArray ) {
        var numeroStelle, source, item, parameters, result, titleName, originalTitleName; 

        numeroStelle = Math.ceil( object.vote_average / 2 );
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
        var stringaFinale = '',  
            i = 0; 

        if ( array.length > 0 ) {
            while ( i < array.length ) {
                stringaFinale += '<span class="itemPopup__genre">' + array[ i ].name + '</span>';
                i++; 
            }
        }
        return stringaFinale; 
    }

    function castRender( array ) {
        var image = 'img/other/user.png',
            stringa = '',  
            i = 0;

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

    // Revealing public methods 
    return {
        getInputValue: getInputValue, 
        displaySearchResults: displaySearchResults, 
        displayItemInfos: displayItemInfos, 
        removePreviousContent: removePreviousResearch, 
        spinnerLoad: renderTheLoadingIcon, 
        cleanInputField: cleanInputField
    }

}( jQuery ); 


  /* -------------------------------- */
 /* ------ General Controller ------ */
/* -------------------------------- */ 


var appController = function( $, MODEL, VIEW ) {

    var state = {}; 

    function newSearch( qString ) {
        VIEW.removePreviousContent(); 
        VIEW.spinnerLoad();  
        var research = new MODEL.Search( qString, state.currentPage ); 
        research.getSearchResults(); 

        /* 
            Work around dovuto ( in ES6 questo bruttissimo setTimeout con 
            tempo prefissato verrebbe sostituito con async - await, 
            così sarei sicuro che elaboro i dati se e solo quando 
            li ho ricevuti ). In questo caso, se non ricevo i dati entro 
            .7s non funziona niente. 
        */
        setTimeout(function() {
            VIEW.displaySearchResults( MODEL.splitArrayInParts( research.results ), state.currentPage ); 
        }, 1000);
    }

    function newItemInformation( id, type ) {
        var item = new MODEL.Item( id, type ); 
        item.getAllItemInfo(); 

        setTimeout(function() {
            VIEW.displayItemInfos( item.information, type, item.cast ); 
        }, 1000);
    }

    var eventHandlers = function() {

        $('.header__search').click(function() {
            state.currentPage = 1;
            newSearch( VIEW.getInputValue() ); 
            state.searchedString = $('.header__input').attr('value'); 
            VIEW.cleanInputField();  
        }); 
    
        $('.header__input').keyup(function( e ) {
            if ( e.which === 13 ) {
                state.currentPage = 1;
                newSearch( VIEW.getInputValue() ); 
                state.searchedString = $('.header__input').attr('value'); 
                VIEW.cleanInputField();  
            }
        });
    
        // gestore button avanti di una pagina 
        $(document).on('click', '.pagination__go-forw', function() {
            state.currentPage++;
            newSearch( state.searchedString ); 
        }); 
    
        // gestore button indietro di una pagina 
        $(document).on('click', '.pagination__go-back', function() {
            state.currentPage--; 
            newSearch( state.searchedString ); 
        }); 
    
        // gestore pagina clickata direttamente 
        $(document).on('click', '.pagination__item-number', function() {
            if ( !$(this).hasClass('selected-page') ) {
                var selectedPage = parseInt($(this).attr('data-index')); 
                state.currentPage = selectedPage; 
                newSearch( state.searchedString ); 
            }
        });
    
        $(document).on('click', '.item__popup-opener', function( ) {
            currentItemID = $(this).closest('.item').attr('data-itemid'); 
            currentItemType = $(this).closest('.item').attr('data-itemtype'); 
            newItemInformation( currentItemID, currentItemType ); 
        }); 
    
        $(document).on('click', '.itemPopup__closing-x', function() {
            $(this).closest('.relative-wrapper').remove(); 
        });

    }

    // Revealing public methods
    return { 
        run: eventHandlers
    }

}( jQuery, dataController, UIController ); 

/* --------------------------------------- */

$(document).ready(function() {

    appController.run(); 

});

