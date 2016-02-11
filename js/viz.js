///////////////////////////////////////
//
// VIZ component code
//
///////////////////////////////////////

(function() {

  // Allows DB to be inherited from calling method.
  // Required for preview feature of VIZ Builder.
  if (typeof allData !== 'undefined') {
    buildVIZ(allData);
  } else {
    loadVIZ();
  }
  
}());


// Load DB from server and build VIZ UI
function loadVIZ() {
  var allData;
  $.ajax({
    url: 'data/vizDB.txt',
    type: 'get',
    dataType: 'json',
    async: true,
    success: function(db) {
      buildVIZ(db);
    }
  });
}

// Build VIZ UI
function buildVIZ(allData) {

  ///////////////////////////////////////
  //
  // Global variables
  //
  ///////////////////////////////////////

  // Shortcut to VIZ course data
  var courseData = allData['courseData'];

  // Shortcut to VIZ program data
  var progData = allData['progData'];

  // Shortcut to VIZ course category data
  var catData = allData['catData'];
  
  // Shortcut to VIZ program college/school data
  var colData = allData['colData'];

  // Shortcut to VIZ metadata
  var metaData = allData['metaData'];
  
  // Group display items by category (boolean)
  // Initial value inherited from DB parameter
  var divide = metaData['divide'];

  // Search by courses (boolean)
  // Initial value inherited from DB parameter
  var searchByCourse = metaData['searchByCourse'];

  

  
  
  ///////////////////////////////////////
  //
  // UI initialization
  //
  ///////////////////////////////////////

  // Build all DB-contingent UI elements
  function buildAll() {
    var type = 'course';
    var oppType = 'prog';
    $('span#divideText').text('Colleges');
    if (!searchByCourse) {
      type = 'prog';
      oppType = 'course';
      $('span#divideText').text('Categories');
    }
    var showHideText = $('span#showHideText');
    if (divide) {
      showHideText.text('Hide');
    } else {
      showHideText.text('Show');
    }
    buildSearch('course', searchByCourse);
    buildDisplay('prog', searchByCourse);
    buildSearch('prog', !searchByCourse);
    buildDisplay('course', !searchByCourse);
    $('div#menuToggle')
          .on('mouseenter focusin', function() {
            $(this).removeClass('bg-col2')
                  .addClass('bg-col2-dark');
          })
          .on('mouseleave focusout', function() {
            $(this).removeClass('bg-col2-dark')
                  .addClass('bg-col2');
          })
          .on('keypress click', function(e) {
            if (e.which === 13 || e.type === 'click') {
              toggleMenu();
            }
          });

    $('div#' + type + 'SearchWrapper')
          .css('display', 'block')
          .addClass('shown');
    $('div#' + oppType + 'DisplayWrapper')
          .css('display', 'block')
          .addClass('shown');
  }
  
  // Process colors
  function processColors() {
    var col1 = metaData['col1'];
    var col2 = metaData['col2'];
    var newCSS = '.col1 {color: ' + col1 + '}'
          + '.col1-dark {color: ' + shadeBlendConvert(-0.3,col1) + '}'
          + '.col1-light {color: ' + shadeBlendConvert(0.3,col1) + '}'
          + '.col2 {color:' + col2 + '}'
          + '.col2-dark {color: ' + shadeBlendConvert(-0.3,col2) + '}'
          + '.col2-light {color: ' + shadeBlendConvert(0.3,col2) + '}'
          + '.bg-col1 {background-color: ' + col1 + '}'
          + '.bg-col1-hov:hover, .bg-col1-hov:focus {background-color: ' + col1 + '}'
          + '.bg-col1-dark {background-color: ' + shadeBlendConvert(-0.3,col1) + '}'
          + '.bg-col1-light {background-color: ' + shadeBlendConvert(0.3,col1) + '}'
          + '.bg-col2 {background-color: ' + col2 + '}'
          + '.bg-col2-dark {background-color: ' + shadeBlendConvert(-0.3,col2) + '}'
          + '.bg-col2-light {background-color: ' + shadeBlendConvert(0.3,col2) + '}'
          
    $('style#customCSS').text(newCSS);
  }
  
  
  
  
  
  ///////////////////////////////////////
  //
  // Display pane initialization
  //
  ///////////////////////////////////////
  
  // Build entire display pane
  function buildDisplay(type, show) {
    var sortOrder;
    if (type === 'prog') {
      sortOrder = compareCol;
    }
    buildDisplayList(type, sortOrder);
  }
  
  // Build display list (child of display pane)
  function buildDisplayList(type, sortOrder) {
    var elData = courseData;
    var groupData = catData;
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
    }
    var displayList = $('div#'+ type + 'DisplayWrapper').find('.displayList');
    var groupsSorted = Object.keys(groupData).slice();
    if (sortOrder) {
      groupsSorted.sort(sortOrder);
    }
    for (var i = 0; i < groupsSorted.length; i++) {
      var groupKey = groupsSorted[i];
      buildDisplayListGroup(groupKey, type);
    }
    if (!divide) {
      sortItem = compareCourse;
      if (type === 'prog') {
        sortItem = compareProg;
      }
      $('.collapseAll').css('display', 'none');
      var itemsSorted = Object.keys(elData).slice().sort(sortItem);
      var website = elData[itemsSorted[i]]['site'];
      if (website.length === 0) {
        website = metaData['website'];
      }
      for (var i = 0; i < itemsSorted.length; i++) {
        buildDisplayItem(itemsSorted[i], type, displayList,
              website);
      }
    }
  }
  
  // Create display group (child of display list)
  function buildDisplayListGroup(groupKey, type) {
    var elData = courseData;
    var groupData = catData;
    var sortOrder = compareCourse;
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
      sortOrder = compareProg;
    }
    var display = $('div#' + type + 'DisplayWrapper');
    
    // Prevent orphaning of collapser by grouping it with last word
    var nameVector = groupData[groupKey]['name'].split(' ');
    var newGroup = $('<div class="displayCategory" data-key="' + groupKey + '">'
          + '<h2 class="displayCategoryTitle" tabindex=0><span>'
          + nameVector.slice(0, -1).join(' ')
          + ' </span></h2><div class="displayCategoryContainer"></div></div>');
    var collapserGroup = $('<div class="collapserGroup"><span>'
          + nameVector.slice(-1) + ' </span></div>');
    newGroup.find('h2.displayCategoryTitle')
          .append(collapserGroup)
          .attr('alt', 'Click to expand/collapse ' + groupData[groupKey]['name']);
    buildCollapser(collapserGroup);
    
    display.find('.displayList').append(newGroup);
    
    if (divide) {    
      var container = newGroup.find('div.displayCategoryContainer');
      var groupList = groupData[groupKey]['list'];
      groupList.sort(sortOrder);
      for (var i = 0; i < groupList.length; i++) {
        var website = elData[groupData[groupKey]['list'][i]]['site'];
        if (website.length === 0) {
          website = metaData['website'];
        }
        buildDisplayItem(groupData[groupKey]['list'][i], type,
              container, website);             
      }
    } else {
      newGroup.css('display', 'none');
    }
  }

  // Create display item (child of display group)
  function buildDisplayItem(elKey, type, parent, href) {
    var elData = courseData;
    if (type === 'prog') {
      elData = progData;
    }
    var newItem = $('<span class="displayItem" data-key="'
          + elKey + '" alt="' + elData[elKey]['name']
          + ' is not approved"><a href="' + href
          + '" target="_blank">'
          + '<i class="fa fa-check check hide"></i>'
          + '<i class="fa fa-times ballot"></i> '
          + elData[elKey]['name'] + '</a></span>');
          
    parent.append(newItem);
  }

  // Create collapser element and assign event handlers
  function buildCollapser(parent) {
    var parent = $(parent);
    var collapser = $('<div class="collapser"><i class="fa fa-plus col1 plus"></i>'
          + '<i class="fa fa-minus col1 minus"></i></div>');
    parent.append(collapser);
    parent.parent().on('mouseenter focusin', function() {
      $(this).find('i.col1')
          .addClass('col1-light')
          .removeClass('col1');
    }).on('mouseleave focusout', function() {
      $(this).find('i.col1-light')
          .addClass('col1')
          .removeClass('col1-light');
    }).on('keypress click', function(e) {
      if (e.which === 13 || e.type === 'click') {
        toggleGroup($(this));
      }
    });
  }
  
  // Attach display item divs to their containers
  function attachDisplayItems(type, elData) {
    var display = $('div#' + type + 'DisplayWrapper');
    var sortOrder = compareCourse;
    if (type === 'prog') {
      sortOrder = compareProg;
    }
    if (divide) {
      display.find('span.displayItem').each(function(){
        $('div[data-key="' + elData[parseInt($(this).attr('data-key'))]['cat']
              + '"]').find('div.displayCategoryContainer').append($(this));
      });
      display.find('div.displayCategory').each(function(){
          $(this).slideDown(300);
      });
    } else {
      var itemArray = []
      display.find('div.displayCategory').each(function(){
        $(this).slideUp(300);
      });
      display.find('span.displayItem').each(function(){
        itemArray.push(parseInt($(this).attr('data-key')));
      });
      itemArray.sort(sortOrder);
      var displayList = display.find('div.displayList');
      for (var i = 0; i < itemArray.length; i++) {
        displayList.append($('span[data-key="'
              + itemArray[i] + '"]'));
      }
    }
  }
  
  



  ///////////////////////////////////////
  //
  // Search pane initialization
  //
  ///////////////////////////////////////

  // Build entire search pane
  function buildSearch(type, show) {
    var typeName = 'Courses';
    if (type === 'prog') {
      typeName = 'Programs';
    }
    var search = $('div#' + type + 'SearchWrapper');
    search.find('.searchHeader').text(typeName);
    buildSearchList(type);
  }

  // Build search list (child of search pane)
  function buildSearchList(type) {
    var elData = courseData;
    var groupData = catData;
    if (type === 'prog') {
      buildSearchListGroup(-1, type);
    } else {
      groupData = catData;
      for (var groupKey in groupData) {
        buildSearchListGroup(groupKey, type);
      }
    }
  }

  // Create search list group (child of search list)
  function buildSearchListGroup(groupKey, type) {
    var elData = courseData;
    var groupData = catData;
    var groupList;
    var groupName;
    var sortOrder = compareCourse;
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
      groupList = Object.keys(elData).sort(compareProg);
      groupName = 'Choose';
      sortOrder = compareProg;
    } else {
      groupList = groupData[groupKey]['list'].slice().sort(sortOrder);
      groupName = groupData[groupKey]['name'];
    }

    var search = $('div#' + type + 'SearchWrapper');
    var newGroup = $('<div><label class="searchCategory title" for="'
          + groupName + ' data-key="' + groupKey + '"">' + groupName + ': </label></div>');
    $('div#' + type + 'SearchWrapper').find('div.searchList').append(newGroup);
              
    if (type === 'prog') {
      buildAnyAll();
    }
              
    var newSelect = $('<select class="u-full-width"><option class="blank" value="-1">'
            + '</option></select>');
    newGroup.append(newSelect);
    newSelect.change(updateDisplay);
    if (type === 'prog') {
        newSelect.attr('multiple', 'multiple').addClass('Choose');
    }
    
    for (var i = 0; i < groupList.length; i++) {
      //Build multi-select element
      var itemName = elData[groupList[i]]['name'];
      var newItem = $('<option value="' + groupList[i] + '">' + itemName + '</option>');
      newSelect.append(newItem);
      
      //Build list of selected elements to display in search by Program
      if (type === 'prog') {
        var searchSelected = $('div#searchSelected');
        var website = progData[groupList[i]]['site'];
        if (website === '') {
          website = metaData['website'];
        }
        var newSelected = $('<div class="searchSelItem" data-key="' + groupList[i] 
              + '" + data-selected="0"><a href="' + website
              + '" target="_blank" class="searchLink">' + progData[groupList[i]]['name']
              + '</a></div>');
        var ex = $('<div class="searchEx" tabindex="0"><div class="exTextDiv"><i class="fa fa-times ballot"></i></div></div>');
        searchSelected.append(newSelected);
        newSelected.append(ex);
  
        ex
          .on('keypress click', {key: groupList[i]}, function(e) {
            if (e.which === 13 || e.type === 'click') {
              if ($(this).parent().prevAll('[data-selected="1"]').length) {
                $(this).parent().prev().find('div.searchEx').focus();
              } else {
                $('select.Choose').focus();
              }
              removeSelected(e.data.key);
            }
          });
      }
    }
  }
  
  // Build any/all selector div
  function buildAnyAll() {
    var allAny = $('<div id="allAny"></div>');
    var wtHeader = $('<div id="wtHeader" class="collapsed"><b>What\'s this?</b></div>');
    var wtMsg = $('<div id="wtMsg"></div>');
    var wtText = 'Select <b>all</b> to display courses that can fulfill'
          + ' requirements for all selected programs. Select <b>any</b> to display'
          + ' courses that can fulfill requirements for any of the selected programs.';
    wtHeader.click(function() {
      if ($(this).hasClass('collapsed')) {
        $(this).next().slideDown(300);
        $(this).removeClass('collapsed');
      } else {
        $(this).next().slideUp(300);
        $(this).addClass('collapsed');
      }
    });
    wtMsg.append(wtText);
    allAny
          .append('<div id="setJoin"><b>Match: </b>'
          + '<input type="radio" name="setJoin" checked="checked" '
          + 'value="intersect" id="intersect"><label for="intersect"> All </label>'
          + '<input type="radio" name="setJoin" id="union"'
          + ' value="union"><label for="union"> Any </label></div>')
          .append(wtHeader).append(wtMsg);
    $('div#progSearchWrapper').find('h1.searchHeader')
        .after(allAny);
    $('input[name="setJoin"]:radio').change(function() {
      updateDisplay();
      if ($('input[name="setJoin"]:checked').val() === 'intersect') {
        $('span#joinDescr').text('all selected programs');
      } else {
        $('span#joinDescr').text('any selected program');
      }
    });
  }

  
  
  
  
  ///////////////////////////////////////
  //
  // VIZ core search functionality
  //
  ///////////////////////////////////////
  
  // Intersect results from search terms and update display
  function updateDisplay() {
    searchItemsSelected = [];
    setJoin = 'intersect';
    if (searchByCourse) {
      $('div#courseSearchWrapper').find('select').each(function() {
        if ($(this).val() !== '-1') {
          searchItemsSelected.push(parseInt($(this).val()));
        }
      });
      updateDisplayItems(searchItemsSelected, courseData, setJoin);
    } else {
      var search = $('div#progSearchWrapper');
      var values = search.find('select.Choose').val();
      if (values) {
        for (var i = 0; i < values.length; i++) {
          if (values[i] !== '-1') {
            searchItemsSelected.push(parseInt(values[i]));
          }
        }
      }
      search.find('div.searchSelItem').each(function() {
        if ($.inArray(parseInt($(this).data('key')), searchItemsSelected) == -1) {
          if ($(this).attr('data-selected') === '1') {
            $(this).attr('data-selected', 0);
            $(this).slideUp(300);
          }
        } else {
          if ($(this).attr('data-selected') === '0') {
            $(this).attr('data-selected', 1);
            $(this).slideDown(300);
          }
        }
      });
      if ($('input[name="setJoin"]:checked').val() === 'union') {
        setJoin = 'union'
      }
      updateDisplayItems(searchItemsSelected, progData, setJoin);
    }
  }

  // Update display to match search results
  function updateDisplayItems(searchItemsSelected, searchElData, setJoin) {
    var displayItems = [];
    var idx = 0;
    var type = 'prog';
    if (!searchByCourse) {
      idx = 1;
      type = 'course';
    }
    
    resetDisplay(type);

    if (searchItemsSelected.length > 0) {
      for (var i = 0; i < searchItemsSelected.length; i++) {
        var searchItem = searchItemsSelected[i];
        if (i > 0) {
          if (setJoin === 'intersect') {
            displayItems = intersect(displayItems, searchElData[searchItem]['appr']);
          } else {
            displayItems = union(displayItems, searchElData[searchItem]['appr']);
          }
        } else {
          displayItems = searchElData[searchItem]['appr'].slice();
        }
      }
    }
        
    enableDisplayItems(displayItems);
  }
  
  // Display all results as "enabled" in display pane
  function enableDisplayItems(displayItems) {
    var type = 'course';
    if (searchByCourse) {
      type = 'prog';
    }
    var display = $('div#' + type + 'DisplayWrapper');
    for (var i = 0; i < displayItems.length; i++) {
      var displayItemDiv = display.find('span[data-key="' + displayItems[i] + '"]');
      displayItemDiv.addClass("active")
            .attr('alt', displayItemDiv.text() + ' is approved');
      displayItemDiv.find('i.ballot').addClass('hide');
      displayItemDiv.find('i.check').removeClass('hide');
    }
  }
  
  
  
  
  
  ///////////////////////////////////////
  //
  // UI Interaction
  //
  ///////////////////////////////////////
  
  // Expand/collapse display group
  function toggleGroup(element) {
    var el = $(element);
    if (el.hasClass('collapsed')) {
      el.find('div.collapser').animateRotate(90, 0, 200);
      el.find('.plus').fadeOut(300);
      el.next().slideDown(300);
      el.removeClass('collapsed');
    } else {
      el.find('div.collapser').animateRotate(0, 90, 200);
      el.find('.plus').fadeIn(300);
      el.next().slideUp(300);
      el.addClass('collapsed');
    }
  }

  // Expand/collapse all display groups at once
  function toggleGroups() {
    var display = $('div#courseDisplayWrapper');
    var oppDisplay = $('div#progDisplayWrapper');
    if (searchByCourse) {
      display = $('div#progDisplayWrapper');
      oppDisplay = $('div#courseDisplayWrapper');
    }
    if (divide) {
      if (display.hasClass('collapsed')) {
        display.find('h2').each(function() {
          if ($(this).hasClass('collapsed')) {
            toggleGroup($(this));
          }
        });
        oppDisplay.find('h2').each(function() {
          if ($(this).hasClass('collapsed')) {
            toggleGroup($(this));
          }
        });
        $('.collapseAll').animateRotate(90, 0, 200);
        $('.collapseAll').find('.plus').fadeOut(300);
        display.removeClass('collapsed');
        oppDisplay.removeClass('collapsed');
      } else {
        display.find('h2').each(function() {
          if (!$(this).hasClass('collapsed')) {
            toggleGroup($(this));
          }
        });
        oppDisplay.find('h2').each(function() {
          if (!$(this).hasClass('collapsed')) {
            toggleGroup($(this));
          }
        });
        $('.collapseAll').animateRotate(0, 90, 200);
        $('.collapseAll').find('.plus').fadeIn(300);
        display.addClass('collapsed');
        oppDisplay.addClass('collapsed');
      }
    }
  }
  
  // Expand/collapse top menu
  function toggleMenu() {
    var menuToggler = $('div#menuToggle');
    if (menuToggler.hasClass('collapsed')) {
      setHeights(true);
      $('div#topBarInner').slideDown(200);
      menuToggler
        .removeClass('collapsed');
    } else {
      setHeights(true);
      $('div#topBarInner').slideUp(200);
      menuToggler
        .addClass('collapsed');
    }
  }

  // Expand/collapse search pane
  function toggleSearchPane() {
    var paneToggler = $('button#paneToggler');
    if (paneToggler.hasClass('collapsed')) {
      $('div.searchWrapper.shown').slideDown(300);
      $('button#invertSearch').slideDown(300);
      paneToggler
        .removeClass('collapsed')
        .children().first().animateRotate(180, 0, 200);
    } else {
      $('div.searchWrapper.shown').slideUp(300);
      $('button#invertSearch').slideUp(300);
      paneToggler
        .addClass('collapsed')
        .children().first().animateRotate(0, 180, 200);
    }
  }

  // Toggle display by group on/off
  function groupItems() {
    if (divide) {
      $('button#divide').find('span#showHideText').text('Show');
      $('div#courseDisplayWrapper').find('.collapseAll').fadeOut(300);
      $('div#progDisplayWrapper').find('.collapseAll').fadeOut(300);
    } else {
      $('button#divide').find('span#showHideText').text('Hide');
      $('div#courseDisplayWrapper').find('.collapseAll').fadeIn(300);
      $('div#progDisplayWrapper').find('.collapseAll').fadeIn(300);
    }
    divide = !divide;
    attachDisplayItems('course', courseData);
    attachDisplayItems('prog', progData);
  }

  // Switch between searching by courses/programs
  function inverter() {
    var invertText;
    var groupName;

    if (searchByCourse) {
      searchByCourse = false;
      invertText = 'Search By Course';
      groupName = 'Categories';
    } else {
      searchByCourse = true;
      invertText = 'Search By Program';
      groupName = 'Colleges';
    }
    if ($('div#courseSearchWrapper').hasClass('shown')) {
      $('div#courseSearchWrapper')
            .slideUp(300, function() {
              $('div#progSearchWrapper').slideDown(300).addClass('shown')
            })
            .removeClass('shown');
      $('div#progDisplayWrapper')
            .fadeOut(300, function() {
              $('div#courseDisplayWrapper').fadeIn(300).addClass('shown')
            })
            .removeClass('shown');
    } else {
      $('div#progSearchWrapper')
            .slideUp(300, function() {
              $('div#courseSearchWrapper').slideDown(300).addClass('shown')
            })
            .removeClass('shown');
      $('div#courseDisplayWrapper')
            .fadeOut(300, function() {
              $('div#progDisplayWrapper').fadeIn(300).addClass('shown')
            })
            .removeClass('shown');
    }
    $('button#invertSearch').text(invertText);
    $('span#divideText').text(groupName);
  }

  
  
  
  
  ///////////////////////////////////////
  //
  // UI reset methods
  //
  ///////////////////////////////////////
  
  // Reset the entire UI to initial defaults specified in DB
  function resetAll() {
    $('input[name="setJoin"][value="intersect"]').prop('checked', true);
    resetSearch();
    resetDisplay('prog');
    resetDisplay('course');
    if (divide !== metaData['divide']) {
      groupItems();
    }
    if (divide) {
      if ($('div#courseDisplayWrapper').hasClass('collapsed')) {
        toggleGroups();
      }
    }
    if (searchByCourse !== metaData['searchByCourse']) {
      inverter();
    }
    if ($('button#paneToggler').hasClass('collapsed')) {
      toggleSearchPane();
    }
    $('div#displayViewport').animate({ scrollTop: 0 }, 300);
    $('select.Choose').animate({ scrollTop: 0 }, 300);
  }
  
  // Reset the search pane to initial state
  function resetSearch() {
    $('select').val(-1);
    $('div#searchSelected').find('div.searchSelItem').each(function() {
      if ($(this).attr('data-selected') === '1') {
        $(this).attr('data-selected', 0);
        $(this).slideUp(300);
      }
    });
  }
  
  // Reset the display pane to initial state
  function resetDisplay(type) {
    $('div#' + type + 'DisplayWrapper').find('span.displayItem').each(function() {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active')
              .attr('alt', $(this).text() + ' is not approved.');
        $(this).find('i.ballot').removeClass('hide');
        $(this).find('i.check').addClass('hide');
      }
    });
  }

  // Remove a term from the search by key
  function removeSelected(key) {
    $('select.Choose').find('option[value="' + key + '"]').prop('selected', false);
    updateDisplay();
  }





  ///////////////////////////////////////
  //
  // Resizing methods
  //
  ///////////////////////////////////////

  // Dynamically set heights based on menu toggle state.
  // Toggle parameter is boolean for whether or not
  // call to setHeights was the result of a menu toggle event.
  function setHeights(toggle) {
    
    var topBarInner = $('div#topBarInner');
    var menuToggle = $('div#menuToggle');
    var searchHt = window.innerHeight - $('button#invertSearch').outerHeight()
            - menuToggle.outerHeight() - $('button#paneToggler').outerHeight() - 20;
    var dispHt = window.innerHeight - menuToggle.outerHeight();
    if (menuToggle.hasClass('collapsed') === toggle) {
      if (toggle) {
        topBarInner.css({'position':'absolute','visibility':'hidden','display':'block'});
        var topBarHt = topBarInner.outerHeight();
        topBarInner.css({'position':'static','visibility':'visible','display':'none'});
      } else {
        var topBarHt = topBarInner.outerHeight();
      }
      searchHt -= topBarHt;
      dispHt -= topBarHt;
    }
    if (searchByCourse) {
      if (toggle) {
        $('div#courseSearchWrapper').animate({'max-height':searchHt}, 200);
        $('div#displayViewport').animate({'max-height':dispHt}, 200);
      } else {
        $('div#courseSearchWrapper').css('max-height', searchHt);
        $('div#displayViewport').css('max-height', dispHt);
      }
      $('div#progSearchWrapper').css('max-height', searchHt);
    } else {
      if (toggle) {
        $('div#progSearchWrapper').animate({'max-height':searchHt}, 200);
        $('div#displayViewport').animate({'max-height':dispHt}, 200);
      } else {
        $('div#progSearchWrapper').css('max-height', searchHt);
        $('div#displayViewport').css('max-height', dispHt);
      }
      $('div#courseSearchWrapper').css('max-height', searchHt);
    }
  }
  
  // Dynamically set sizes for all affected UI elements
  function setSizes() {
    var displayViewport = $('#displayViewport');
    var searchColumn = $('#searchColumn');
    var topBar = $('#topBar');
    var paneToggler = $('button#paneToggler');
    var type = 'prog';
    if (searchByCourse) {
      type = 'course';
    }
    paneToggler.css('bottom', 0 - paneToggler.height());
    if (!isMobile()) {
      var progSelect = $('div#progSearchWrapper').find('select');
      if (progSelect.children().length > 13) {
        progSelect.css('height', '15em');
      } else {
        progSelect.css('height', (progSelect.children().length + 1) + 'em');
      }
    }
    
    setHeights(false);
  }



  
  
  ///////////////////////////////////////
  //
  // Background display
  //
  ///////////////////////////////////////
  
  // Transition out of loading splash page
  function loadingTrans() {
    $('div#loading').fadeOut(400, function() {
      var cont = $('button#continue');
      cont.focus();
      tabFocusRestrictor(cont, cont);
      setTimeout(function() {
        var welcome = $('div#welcome');
        if (welcome.css('display') !== 'none') {
          welcomeTrans();
        }
      }, 10000);
    });
  }
  
  // Transition out of welcome splash page
  function welcomeTrans() {
    $('div#welcome').fadeOut(700, function() {
      $('div#splashAlert').fadeIn(300, function() {
        var iunderstand = $('button#iunderstand');
        iunderstand.focus();
        tabFocusRestrictor(iunderstand, iunderstand);
      });
    });
  }
  
  // Build and pre-load backgrounds
  function buildBG() {
    if (metaData['bg'].length > 0) {
      for (var i = 0; i < metaData['bg'].length; i++) {
        var newBG = $('<div id="bg' + i + '" data-idx="' + i + '" class="bgslide"></div>');
        newBG.css('background-image', 'url(' + metaData['bg'][i] + ')');
        $('div#bgContainer').append(newBG);
        if (i === metaData['bg'].length - 1) {
          $.get(metaData['bg'][i], function() {
            setTimeout(loadingTrans, 1500);
          });
        } else {
          $.get(metaData['bg'][i]);
        }
      }
    } else {
      setTimeout(loadingTrans, 1500);
    }
  }
  
  //Pick random starting background
  function bgInitRand() {
    var randBG = Math.floor(Math.random() * metaData['bg'].length);
    $('div#bg' + randBG).addClass('visible').css('display', 'block');
  }
  
  // Advance to next background image
  function advanceBG() {
    var bgContainer = $('div#bgContainer')
    var cur = bgContainer.find('div.visible');
    if (cur.attr('data-idx') < bgContainer.children().length - 1) {
      cur.removeClass('visible');
      cur.fadeOut(2000);
      cur.next().fadeIn(2000);
      cur.next().addClass('visible');
    } else {
      cur.removeClass('visible');
      cur.fadeOut(2000);
      bgContainer.children().first().fadeIn(2000);
      bgContainer.children().first().addClass('visible');
    }
  }

    
    
    
    
  ///////////////////////////////////////
  //
  // Comparators
  //
  ///////////////////////////////////////

  // Compare course keys by name
  function compareCourse(key1, key2) {
    return courseData[key1]['name'].localeCompare(courseData[key2]['name']);
  }

  // Compare program keys by name
  function compareProg(key1, key2) {
    return progData[key1]['name'].localeCompare(progData[key2]['name']);
  }

  // Compare category keys by name
  function compareCat(key1, key2) {
    return catData[key1]['name'].localeCompare(catData[key2]['name']);
  }

  // Compare college keys by name
  function compareCol(key1,key2) {
    return stripStartingFiller(colData[key1]['name'])
          .localeCompare(stripStartingFiller(colData[key2]['name']));
  }
    
    

  ///////////////////////////////////////
  //
  // Main program
  //
  ///////////////////////////////////////

  // Assign display colors programmatically
  processColors();
  
  // Insert logo
  $('div.logo').each(function() {
    $(this).html(metaData['logo']);
  });
  
  // Insert welcome
  $('div#welcomeCustom').html(metaData['welcome']);
  
  // Set favicon
  $('link#favicon').attr('href', metaData['favicon']);
  
  // Define global event handlers
  $('button#continue').click(welcomeTrans);
  $('button#iunderstand').click(function() {
    $('div#splashAlert').fadeOut(300);
  });
  $('button#paneToggler')
        .on('mouseenter focusin', function() {
          $(this).removeClass('bg-col2')
                .addClass('bg-col2-dark');
        })
        .on('mouseleave focusout', function() {
          $(this).removeClass('bg-col2-dark')
                .addClass('bg-col2');
        })
        .click(toggleSearchPane);
  $('button#reset').click(resetAll);
  $('button#divide').click(groupItems);
  $('button#help').click(function() {
    window.open(metaData['help'], '_blank');
  });
  $('button#invertSearch').click(inverter);
  $('h1.displayHeader').on('mouseenter focusin', function() {
    $(this).find('i.col1')
          .addClass('col1-light')
          .removeClass('col1');
  }).on('mouseleave focusout', function() {
    $(this).find('i.col1-light')
          .addClass('col1')
          .removeClass('col1-light');
  });
  $('h1.displayHeader').on('keypress click', function(e) {
    if (e.which === 13 || e.type === 'click') {
      toggleGroups();
    }
  });
  $('button#feedbackTitle')
        .on('mouseenter focusin', function() {
          $(this).removeClass('bg-col2')
                 .addClass('bg-col2-dark');
        })
        .on('mouseleave focusout', function() {
          $(this).removeClass('bg-col2-dark')
                 .addClass('bg-col2');
        })
        .click(function() {
          feedbackContainer = $('div#feedbackContainer');
          feedbackContent = $('div#feedbackContentWrapper');
          if (feedbackContainer.hasClass('collapsed')) {
            feedbackContainer.removeClass('collapsed');
            feedbackContent.slideDown(200);
          } else {
            feedbackContainer.addClass('collapsed');
            feedbackContent.slideUp(200);
          }
        });
  $('a#feedbackEmail').attr('href', 'mailto:' + metaData['email']);
  $(window).on('resize', setSizes);

  // Build dynamic page content
  buildAll(); 
  
  // Build background images
  buildBG();
  
  // Randomize initial bg display
  bgInitRand();
  
  // Start bg div rotation
  if (metaData['bg'].length > 1) {
    setInterval(advanceBG, 30000);
  }
  
  // Collapse top menu on small screens
  if ($(window).width() <= 400) {
    $('div#menuToggle').addClass('collapsed');
    $('div#topBarInner').css('display', 'none');
  }
  
  // Dynamically resize
  setSizes();
  
}