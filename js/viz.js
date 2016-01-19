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
    $('div#divideText').text('Colleges');
    if (!searchByCourse) {
      type = 'prog';
      oppType = 'course';
      $('div#divideText').text('Categories');
    }
    var showHideText = $('div#showHideText');
    if (divide) {
      showHideText.text('Hide');
    } else {
      showHideText.text('Show');
    }
    buildSearch('course', searchByCourse);
    buildDisplay('prog', searchByCourse);
    buildSearch('prog', !searchByCourse);
    buildDisplay('course', !searchByCourse);
    $('div#menuToggle').click(toggleMenu);

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
    $('.col1').css('color', col1);
    $('.col1-dark').css('color', shadeBlendConvert(-0.5,col1));
    $('.col1-light').css('color', shadeBlendConvert(0.5,col1));
    $('.col2').css('color', col2);
    $('.col2-dark').css('color', shadeBlendConvert(-0.5,col2));
    $('.col2-light').css('color', shadeBlendConvert(0.5,col2));
    $('.bg-col1').css('background-color', col1);
    $('.bg-col1-dark').css('background-color', shadeBlendConvert(-0.5,col1));
    $('.bg-col1-light').css('background-color', shadeBlendConvert(0.5,col1));
    $('.bg-col2').css('background-color', col2);
    $('.bg-col2-dark').css('background-color', shadeBlendConvert(-0.5,col2));
    $('.bg-col2-light').css('background-color', shadeBlendConvert(0.5,col2));
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
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
    }
    var display = $('div#' + type + 'DisplayWrapper');
    
    // Prevent orphaning of collapser by grouping it with last word
    var nameVector = groupData[groupKey]['name'].split(' ');
    var newGroup = $('<div class="displayCategory" data-key="' + groupKey + '">'
          + '<h2 class="displayCategoryTitle"><span>' + nameVector.slice(0, -1).join(' ')
          + ' </span></h2><div class="displayCategoryContainer"></div></div>');
    var collapserGroup = $('<div class="collapserGroup"><span>' + nameVector.slice(-1) + ' </span></div>');
    newGroup.find('h2.displayCategoryTitle').append(collapserGroup);
    buildCollapser(collapserGroup);
    
    display.find('.displayList').append(newGroup);
    
    if (divide) {    
      var container = newGroup.find('div.displayCategoryContainer');
    
      for (var i = 0; i < groupData[groupKey]['list'].length; i++) {
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
    var newItem = $('<a class="displayItem" href="' + href + '" target="_blank" data-key="'
          + elKey + '">' + '<i class="fa fa-check check hide"></i>'
          + '<i class="fa fa-times ballot"></i> '
          + elData[elKey]['name'] + '</a>');
          
    parent.append(newItem);
  }

  // Create collapser element and assign event handlers
  function buildCollapser(parent) {
    var parent = $(parent);
    var collapser = $('<div class="collapser"><i class="fa fa-plus col1 plus"></i>'
          + '<i class="fa fa-minus col1 minus"></i></div>');
    parent.append(collapser);
    parent.parent().hover(function() {
      $(this).find('i.col1').css('color', shadeBlendConvert(0.3, metaData['col1']))
    }, function() {
      $(this).find('i.col1').css('color', metaData['col1'])
    }).click(function() {
      toggleGroup($(this));
    });
  }
  
  // Attach display item divs to their containers
  function attachDisplayItems(type, elData) {
    var display = $('div#' + type + 'DisplayWrapper');
    var sort = compareCourse;
    if (type === 'prog') {
      sort = compareProg;
    }
    if (divide) {
      display.find('.displayItem').each(function(){
        $('div[data-key="' + elData[parseInt($(this).attr('data-key'))]['cat']
              + '"]').find('.displayCategoryContainer').append($(this));
      });
      display.find('.displayCategory').each(function(){
          $(this).slideDown(300);
      });
    } else {
      var itemArray = []
      display.find('.displayCategory').each(function(){
        $(this).slideUp(300);
      });
      display.find('.displayItem').each(function(){
        itemArray.push(parseInt($(this).attr('data-key')));
      });
      itemArray.sort(sort);
      var displayList = display.find('.displayList');
      for (var i = 0; i < itemArray.length; i++) {
        displayList.append($('a[data-key="'
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
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
      groupList = Object.keys(elData).sort(compareProg);
      groupName = 'Choose';
    } else {
      groupList = groupData[groupKey]['list'].slice().sort(compareCourse);
      groupName = groupData[groupKey]['name'];
    }

    var search = $('div#' + type + 'SearchWrapper');
    var newGroup = $('<div><label class="searchCategory title" for="'
          + groupName + ' data-key="' + groupKey + '"">' + groupName + ': </label></div>');
    $('div#' + type + 'SearchWrapper').find('div.searchList').append(newGroup);
          
    var newSelect = $('<select class="u-full-width"><option class="blank"></option></select>');
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
              + '"><a href="' + website
              + '" target="_blank" class="searchLink">' + progData[groupList[i]]['name']
              + '</a></div>');
        var ex = $('<div class="searchEx"><div class="exTextDiv col1"><i class="fa fa-times"></i></div></div>');
        searchSelected.append(newSelected);
        newSelected.append(ex);
  
        ex.click({key: groupList[i]}, function(event) {
          var key = event.data.key;
          removeSelected(key);
        });
      }
    }
  }

  
  
  
  
  ///////////////////////////////////////
  //
  // VIZ core search functionality
  //
  ///////////////////////////////////////
  
  // Intersect results from search terms and update display
  function updateDisplay() {
    searchItemsSelected = [];
    if (searchByCourse) {
      $('div#courseSearchWrapper').find('select').each(function() {
        if (!($(this).val() === '')) {
          searchItemsSelected.push(parseInt($(this).val()));
        }
      });
      updateDisplayItems(searchItemsSelected, courseData);
    } else {
      var search = $('div#progSearchWrapper');
      if (search.find('select.Choose').val()) {
        var values = search.find('select.Choose').val();
        for (var i = 0; i < values.length; i++) {
          searchItemsSelected.push(parseInt(values[i]));
        }
      }
      search.find('div.searchSelItem').each(function() {
        if ($.inArray(parseInt($(this).data('key')), searchItemsSelected) == -1) {
          if (!($(this).css('display') === 'none')) {
            $(this).slideUp(300);
          }
        } else {
          if ($(this).css('display') === 'none')  {
            $(this).slideDown(300);
          }
        }
      });
      if (searchItemsSelected[0] === '') {
        searchItemsSelected.splice(0, 1);
      }
      updateDisplayItems(searchItemsSelected, progData);
    }
  }

  // Update display to match search results
  function updateDisplayItems(searchItemsSelected, searchelData) {
    var displayItems = [];
    var idx = 0;
    var type = 'prog';
    if (!searchByCourse) {
      idx = 1;
      type = 'course';
    }
    
    resetDisplay(type);

    for (var i = 0; i < searchItemsSelected.length; i++) {
      var searchItem = searchItemsSelected[i];
      if (i > 0) {
        displayItems = intersect(displayItems, searchelData[searchItem]['appr']);
      } else {
        displayItems = searchelData[searchItem]['appr'].slice();
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
      var displayItemDiv = display.find('a[data-key="' + displayItems[i] + '"]');
      displayItemDiv.addClass("active");
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
      $('div#topBarInner').slideDown(200, setSizes);
      menuToggler
        .removeClass('collapsed');
    } else {
      $('div#topBarInner').slideUp(200, setSizes);
      menuToggler
        .addClass('collapsed');
    }
  }

  // Expand/collapse search pane
  function toggleSearchPane() {
    var paneToggler = $('#paneToggler');
    if (paneToggler.hasClass('collapsed')) {
      $('div.searchWrapper.shown').slideDown(300);
      $('div#invertSearch').slideDown(300);
      paneToggler
        .removeClass('collapsed')
        .children().first().animateRotate(180, 0, 200);
    } else {
      $('div.searchWrapper.shown').slideUp(300);
      $('div#invertSearch').slideUp(300);
      paneToggler
        .addClass('collapsed')
        .children().first().animateRotate(0, 180, 200);
    }
  }

  // Toggle display by group on/off
  function groupItems() {
    if (divide) {
      $('button#divide').find('div#showHideText').text('Show');
      $('div#courseDisplayWrapper').find('.collapseAll').fadeOut(300);
      $('div#progDisplayWrapper').find('.collapseAll').fadeOut(300);
    } else {
      $('button#divide').find('div#showHideText').text('Hide');
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
    $('div#invertSearch').text(invertText);
    $('div#divideText').text(groupName);
  }

  
  
  
  
  ///////////////////////////////////////
  //
  // UI reset methods
  //
  ///////////////////////////////////////
  
  // Reset the entire UI to initial defaults specified in DB
  function resetAll() {
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
    if ($('div#paneToggler').hasClass('collapsed')) {
      toggleSearchPane();
    }
  }
  
  // Reset the search pane to initial state
  function resetSearch() {
    $('select').val('');
    $('div#searchSelected').find('div.searchSelItem').each(function() {
      if ($(this).css('display') === 'block') {
        $(this).slideUp(300);
      }
    });
  }
  
  // Reset the display pane to initial state
  function resetDisplay(type) {
    $('div#' + type + 'DisplayWrapper').find('a.displayItem').each(function() {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
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

  // Dynamically set height of search viewport
  function setSearchHeight() {
    var searchHeight = window.innerHeight - $('#topBar').outerHeight()
          - $('#invertSearch').outerHeight() - $('div#paneToggler').outerHeight() - 20;
    $('div#courseSearchWrapper').css('max-height', searchHeight);
    $('div#progSearchWrapper').css('max-height', searchHeight);
  }
  
  // Dynamically set height of display viewport
  function setDisplayHeight() {
    var displayHeight = window.innerHeight - $('#topBar').outerHeight();
    $('div#displayViewport').css('max-height', displayHeight);
  }
  
  // Dynamically set sizes for all affected UI elements
  function setSizes() {
    var displayViewport = $('#displayViewport');
    var searchColumn = $('#searchColumn');
    var topBar = $('#topBar');
    var paneToggler = $('#paneToggler');
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
    
    setSearchHeight();
    setDisplayHeight();
  }



  
  
  ///////////////////////////////////////
  //
  // Background display
  //
  ///////////////////////////////////////
  
  //Build and pre-load backgrounds
  function buildBG() {
    if (metaData['bg'].length > 0) {
      for (var i = 0; i < metaData['bg'].length; i++) {
        var newBG = $('<div id="bg' + i + '" data-idx="' + i + '" class="bgslide"></div>');
        newBG.css('background-image', 'url(' + metaData['bg'][i] + ')');
        $('div#bgContainer').append(newBG);
        if (i === metaData['bg'].length - 1) {
          $.get(metaData['bg'][i], function() {
            setTimeout(function() {
              $('div#loading').fadeOut(400);
            }, 1500);
          });
        } else {
          $.get(metaData['bg'][i]);
        }
      }
    } else {
      setTimeout(function() {
        $('div#loading').fadeOut(400);
      }, 1500);
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

  // Insert logo
  $('div.logo').html(metaData['logo']);

  // Set link to help page
  $('a#help').attr('href', metaData['help']);
  
  // Set favicon
  $('link#favicon').attr('href', metaData['favicon']);
  
  // Define global event handlers
  $('div#paneToggler').click(toggleSearchPane);
  $('button#reset').click(resetAll);
  $('button#divide').click(groupItems);
  $('div#invertSearch').click(inverter);
  $('h1.displayHeader').hover(function() {
    $(this).find('i.col1').css('color', shadeBlendConvert(0.3, metaData['col1']))
  }, function() {
    $(this).find('i.col1').css('color', metaData['col1'])
  });
  $('h1.displayHeader').click(toggleGroups);
  $('div#feedbackTitle').click(function() {
    feedbackContainer = $('div#feedbackContainer');
    feedbackContent = $('div#feedbackContentWrapper');
    if (feedbackContainer.hasClass('collapsed')) {
      console.log('expanding');
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
  
  // Assign display colors programmatically
  processColors();
  
  // Build background images
  buildBG();
  
  // Randomize initial bg display
  bgInitRand();
  
  // Start bg div rotation
  setInterval(advanceBG, 30000);
  
  // Collapse top menu on small screens
  if ($(window).width() <= 400) {
    $('div#menuToggle').addClass('collapsed');
    $('div#topBarInner').css('display', 'none');
  }
  
  // Dynamically resize
  setSizes();
  
}