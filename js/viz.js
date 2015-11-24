//Global parameters
var dataURL = "http://exploration.osu.edu/Requirements%20Visualizer/majors.txt";
var srcData;
var	courseData = {};
var categoryData = {};
var collegeData = {};
var majorData = {};
var headings = [];
var categories = [];
var displayItemsEnabled = [[], []];
var divide = true;
var searchByCourse = true;
var shownSearch;
var shownDisplay;
var hiddenSearch;
var hiddenDisplay;
var helpPages;
var currentHelpPage = -1





//Utilities (sorted alphabetically)

function advanceTour() {
  if (currentHelpPage < helpPages.length - 1) {
    currentPage = $(helpPages[currentHelpPage]);
    currentPage.fadeOut(300);
    currentHelpPage++;
    currentPage = $(helpPages[currentHelpPage]);
    currentPage.fadeIn(300);
  } else {
    $(helpPages[currentHelpPage]).fadeOut(300);
    $('#help').fadeOut(300);
    currentHelpPage = -1;
  }
}

function attachDisplayItems(parentWrapper, itemData) {
  var parentWrapper = $(parentWrapper);
  if (divide) {
    parentWrapper.find('.displayItem').each(function(){
      $('div#' + name2ID(itemData[ID2Name($(this).attr('id'))][0])).find('.displayCategoryContainer').append($(this));
    });
    parentWrapper.find('.displayCategory').each(function(){
        $(this).slideDown(300);
    });
  } else {
    var itemArray = []
    parentWrapper.find('.displayCategory').each(function(){
      $(this).slideUp(300, function() {
      });
    });
    parentWrapper.find('.displayItem').each(function(){
      itemArray.push($(this));
    });
    itemArray.sort(divsort);
    for (var i = 0; i < itemArray.length; i++) {
      parentWrapper.find('.displayList').append(itemArray[i]);
    }
  }
}

function buildAll() {
  var divideText = $('#divideText');
  if (searchByCourse) {
    divideText.text('Colleges');
  } else {
    divideText.text('Categories');
  }
  if (!shownSearch.hasClass('built')) {
    buildSearch();
  }
  if (!shownDisplay.hasClass('built')) {
    buildDisplay();
  }

  shownSearch.slideDown(300);
  shownDisplay.slideDown(300);
}

function buildCollapser(parent) {
  parent = $(parent);
  var collapser = document.createElement('DIV');
  var vertical = document.createElement('DIV');
  var horizontal = document.createElement('DIV');

  $(collapser).addClass('collapser');
  $(vertical).addClass('verticalLine');
  $(horizontal).addClass('horizontalLine');
  
  parent.append(collapser);
  collapser.appendChild(vertical);
  collapser.appendChild(horizontal);
}

function buildDisplay() {
  var shownItemData;
  var hiddenItemData;
  var groupData;
  var sortOrder;
      
  if (searchByCourse) {
    shownItemData = majorData;
    hiddenItemData = courseData;
    groupData = collegeData;
    sortOrder = sortCollege;
  } else {
    shownItemData = courseData;
    hiddenItemData = majorData;
    groupData = categoryData;
  }
  
  if (shownDisplay.hasClass('built')) {
    attachDisplayItems(shownDisplay, shownItemData);
  } else {
    buildDisplayList(shownItemData, groupData, sortOrder);
    shownDisplay.addClass('built');
  }

  if (hiddenDisplay.hasClass('built')) {
    attachDisplayItems(hiddenDisplay, hiddenItemData);
  }
}

function buildDisplayGroup(group, groupList, itemData) {
  var newGroup = document.createElement('DIV');
  var newGroupContainer = document.createElement('DIV');
  var content = document.createTextNode(group + '  ');
  var title = document.createElement('H3');
  
  newGroup.id = name2ID(group);
  $(newGroup).addClass('displayCategory');
  $(newGroupContainer).addClass('displayCategoryContainer');
  $(title).addClass('displayCategoryTitle');
  
  shownDisplay.find('.displayList').append(newGroup);
  newGroup.appendChild(title);
  title.appendChild(content);
  buildCollapser(title);
  newGroup.appendChild(newGroupContainer);
  
  if (shownDisplay.hasClass('collapsed')) {
    $(newGroup).find('.displayCategoryContainer').css('display', 'none');
    $(newGroup).find('.verticalLine').css('display', 'block');
    $(newGroup).find('.displayCategoryTitle').addClass('collapsed');
  }
  
  $( title ).click(function() {
    toggleGroup($(this));
  });
    
  if (divide) {
    for (var j = 0; j < groupList.length; j++) {
      var el = groupList[j];
      buildDisplayItem(el, $(newGroup).find('div.displayCategoryContainer'), itemData[el][1]);             
    }
  } else {
    $(newGroup).css('display', 'none');
  }
}

function buildDisplayItem(el, parent, href) {
  var newItem = document.createElement('A');
  var content = document.createTextNode(el);
  var checkText = document.createTextNode('\u2713 ');
  var check = document.createElement('SPAN');
  var ballot = document.createElement('SPAN');
  var ballotText = document.createTextNode('\u2718 ');

  newItem.href = href;
  newItem.target = "_blank";
  $(check).addClass('check');
  $(check).addClass('hide');
  $(ballot).addClass('ballot');
  newItem.id = name2ID(content.nodeValue);
  $(newItem).addClass('displayItem');

  parent.append(newItem);
  newItem.appendChild(check);
  check.appendChild(checkText);
  newItem.appendChild(ballot);
  ballot.appendChild(ballotText);
  newItem.appendChild(content);
}


function buildDisplayList(itemData, groupData, sortOrder) {
  var displayList = shownDisplay.find('.displayList');
  var groupsSorted;
  if (sortOrder) {
    groupsSorted = Object.keys(groupData).sort(sortOrder);
  } else {
    groupsSorted = Object.keys(groupData);
  }
  for (var i = 0; i < groupsSorted.length; i++) {
    var group = groupsSorted[i];
    if (!(group === 'Meta-Major')) {
      buildDisplayGroup(group, groupData[group], itemData);
    }
  }
  if (!divide) {
    $('.collapseAll').css('display', 'none');
    var itemsSorted = Object.keys(itemData).sort();
    for (var i = 0; i < itemsSorted.length; i++) {
      var el = itemsSorted[i];
      if (!(el === 'College') && !(el === 'Major') && !(el === 'Website') && !(itemData[el][0] === 'Meta-Major')) {
        buildDisplayItem(el, displayList, itemData[el][1]);
      }
    }
  }
}

function buildSearch() {
  if (searchByCourse) {
    shownSearch.find('.searchHeader').text('Courses');
    buildSearchList(courseData, categoryData);
  } else {
    shownSearch.find('.searchHeader').text('Programs');
    buildSearchList(majorData);
    shownSearch.find('select')
      .attr('multiple', 'multiple')
  }
  shownSearch.addClass('built');
}

function buildSearchList(itemData, groupData) {
  if (groupData) {
    for (var group in groupData) {
      buildSearchListGroup(group, groupData[group].sort());
    }
  } else {
    buildSearchListGroup('Choose', Object.keys(itemData).sort());
  }
}

function buildSearchListGroup(group, groupList) {
  var newGroup = document.createElement('DIV');
  var newGroupTitle = document.createElement('LABEL');
  var newGroupTitleText = document.createTextNode(group + ": ");
  var newGroupSelect = document.createElement('SELECT');
  var blank = document.createElement('OPTION');
  var blankText = document.createTextNode('');

  $(newGroup).addClass('u-full-width');
  $(newGroupTitle).addClass('searchCategory title');
  newGroupTitle.htmlFor = name2ID(group);
  $(newGroupSelect).addClass('u-full-width ' + name2ID(group));
  blank.value = '';
  $(blank).addClass('blank');
  blank.title = '';
  
  shownSearch.find('.searchList').append(newGroup);
  newGroup.appendChild(newGroupTitle);
  newGroupTitle.appendChild(newGroupTitleText);
  newGroup.appendChild(newGroupSelect);
  newGroupSelect.appendChild(blank);
  blank.appendChild(blankText);
  
  $(newGroupSelect).change(updateDisplay);
  
  for (var i = 0; i < groupList.length; i++) {
    //Build multi-select element
    var itemName = groupList[i];
    var newItem = document.createElement('OPTION');
    var content = document.createTextNode(itemName);

    newItem.value = itemName;
    newItem.title = itemName;
    $(newItem).addClass('course ' +  name2ID(itemName));

    newItem.appendChild(content);
    newGroupSelect.appendChild(newItem);
    
    //Build list of selected elements to display in search by Program
    var searchSelected = $('div#searchSelected');
    if (!searchByCourse) {
      var newSelected = document.createElement('DIV');
      var searchLink = document.createElement('A');
      var selectedText = document.createTextNode(itemName);
      var ex = document.createElement('DIV');
      var exTextDiv = document.createElement('DIV');
      
      $(newSelected).addClass('searchSelItem');
      $(searchLink).addClass('searchLink');
      searchLink.href = majorData[itemName][1];
      searchLink.target = "_blank";
      $(ex).addClass('searchEx');
      $(exTextDiv).addClass('exTextDiv');
      
      searchSelected.append(newSelected);
      newSelected.appendChild(searchLink);
      searchLink.appendChild(selectedText);
      newSelected.appendChild(ex);
      ex.appendChild(exTextDiv);
      
      $(ex).click(function() {
        var toDelete = $(this).parent().text();
        removeSelected(toDelete);
      });
    }
  }
}

function divsort(A, B) {
    return A.attr('id').localeCompare(B.attr('id'));
}

function enableDisplayItems() {
  var displayItems;
  if (searchByCourse) {
    displayItems = displayItemsEnabled[0];
  } else {
    displayItems = displayItemsEnabled[1];
  }
	for (var i = 0; i < displayItems.length; i++) {
    var displayItemDiv = $('a#' + name2ID(displayItems[i]));
		displayItemDiv.addClass("active");
    displayItemDiv.find('.ballot').addClass('hide');
    displayItemDiv.find('.check').removeClass('hide');
	}
}

function getData() {
  for (var i = 2; i < srcData.length; i++) {
		if (!(srcData[i] === '')) {
			line = srcData[i].split('\t');
			majorData[line[0]] = [line[2], line[1], []]
			var courseList = majorData[line[0]][2];
			for (var j = 0; j < Object.keys(courseData).length; j++) {
				if (!(line[j] === '0')) {
					//Get the data for major names and websites
					if (j < 2) {
						courseData[headings[j]][2].push(line[j]);
					} else if (j === 2) {
						courseData[headings[j]][2].push(line[j]);
						if (collegeData[line[j]]) {
							collegeData[line[j]].push(line[0]);
						} else {
							collegeData[line[j]] = [line[0]];
						}
					}
					//Populate a list of majors which accept each course
					else {
						courseList.push(headings[j]);
						courseData[headings[j]][2].push(line[0]);
					}
				}
			}
		}
	}
}

function getHeadings() {
	for (var i = 0; i < headings.length; i++) {
		courseData[headings[i]] = [categories[i], 'https://courses.osu.edu/psp/csosuct/EMPLOYEE/PUB/c/COMMUNITY_ACCESS.OSR_CAT_SRCH.GBL', []];
		if (i > 2) {
			if (categoryData[categories[i]]) {
				categoryData[categories[i]].push(headings[i]);
			} else {
				categoryData[categories[i]] = [headings[i]];
			}
		}
	}
}

function groupItems() {
  if (divide) {
    shownDisplay.find('.collapseAll').fadeOut(300, 'swing');
    hiddenDisplay.find('.collapseAll').fadeOut(300, 'swing');
    divide = false;
  } else {
    shownDisplay.find('.collapseAll').fadeIn(300, 'swing');
    hiddenDisplay.find('.collapseAll').fadeIn(300, 'swing');
    divide = true;
  }
	buildDisplay();
}

function ID2Name(string) {
		return string.replace(/_|LLB|RRB|AND|COMMA|APOST|SLASH|PLUS|DOT/g, function replacer(x) {
		switch (x) {
			case "_" :
				return " ";
				break;
			case "LLB" :
				return "(";
				break;
			case "RRB" :
				return ")";
				break;
			case "AND":
				return "&";
				break;
			case "COMMA":
				return ",";
				break;
			case "APOST":
				return "'";
				break;
			case "SLASH":
				return "/";
				break;
			case "PLUS":
				return "+";
				break;
			case "DOT":
				return ".";
				break;
			default:
				return x;
		}
	});
}

function intersect(A,B){
	var result = new Array();
	for (i = 0; i < A.length; i++) {
		for (j = 0; j < B.length; j++) {
			if (A[i] === B[j] && $.inArray(A[i], result) == -1) {
				result.push(A[i]);
				break;
			}
		}
	}
	return result;
}

function inverter() {
  var invertSearch = $('#invertSearch');
  var invertText;
  var searchPane = $('#searchPane');

  if (searchByCourse) {
    searchByCourse = false;
    invertText = 'Search By Course';
  } else {
    searchByCourse = true;
    invertText = 'Search By Program';
  }
  shownDisplay.slideUp(300, function() {
  });
  shownSearch.slideUp(300, function() {
    showHidePanes();
    buildAll();
    invertSearch.text(invertText);
  });
}

function name2ID(string) {
	return string.replace(/ |\(|\)|&|,|\'|\/|\+|\./g, function replacer(x) {
		switch (x) {
			case " " :
				return "_";
				break;
			case "(" :
				return "LLB";
				break;
			case ")" :
				return "RRB";
				break;
			case "&":
				return "AND";
				break;
			case ",":
				return "COMMA";
				break;
			case "'":
				return "APOST";
				break;
			case "/":
				return "SLASH";
				break;
			case "+":
				return "PLUS";
				break;
			case ".":
				return "DOT";
				break;
			default:
				return x;
		}
	});
}

function removeSelected(value) {
  $('select.Choose').find('option.' + name2ID(value)).prop('selected', false);
  updateDisplay();
}

function resetDisplay(displayItems) {
  for (var i = 0; i < displayItems.length; i++) {
    var displayItemDiv = $('a#' + name2ID(displayItems[i]));
    if (displayItemDiv.hasClass('active')) {
      displayItemDiv.removeClass('active');
      displayItemDiv.find('.ballot').removeClass('hide');
      displayItemDiv.find('.check').addClass('hide');
    }
  }
}	

function resetSearch() {
	$('select').val('');
  $('div#searchSelected').text('');
}

function resetter() {
	resetSearch();
  for (var i = 0; i < displayItemsEnabled.length; i++) {
    resetDisplay(displayItemsEnabled[i]);
  }
  if (shownDisplay.hasClass('collapsed')) {
    toggleGroups();
  }
}

function setSizes() {
  var displayColumn = $('#displayColumn');
  var searchColumn = $('#searchColumn');
  var topBar = $('#topBar');
  var optionsPane = $('#optionsPane');
  var paneToggler = $('#paneToggler');
  var disclaimer = $('#disclaimer');
  
  if (optionsPane.hasClass('collapsed')) {
    optionsPane.css('left', 0 - optionsPane.outerWidth());
  } else {
    optionsPane.css('left', 0);
  }
  
  if ($(window).width() < 850) {
    searchColumn.removeClass('one-third').addClass('one-half');
    displayColumn.removeClass('two-thirds').addClass('one-half');
  } else {
    searchColumn.addClass('one-third').removeClass('one-half');
    displayColumn.addClass('two-thirds').removeClass('one-half');
  }
  
	displayColumn.css('margin-top', topBar.outerHeight());
	searchColumn.css('margin-top', topBar.outerHeight());
  $('#searchContainer').width($('#searchColumn').width());
	$('#reset').css('margin-top', topBar.height() + 10);
  $('#menuToggle').height(topBar.height()).width(topBar.height());
	$('#logos').css('margin-left', $('#menuToggle').outerWidth() + 10);
  paneToggler.css('bottom', 0 - paneToggler.height());
  disclaimer.css('top', topBar.outerHeight() + 10).width($('div#displayContainer').width() - 20);
  displayColumn.css('padding-top', disclaimer.outerHeight() + 10);
  
  var searchHeight = window.innerHeight - topBar.outerHeight() - $('#invertSearch').outerHeight() - paneToggler.outerHeight() - 20;
  shownSearch.css('max-height', searchHeight);
  hiddenSearch.css('max-height', searchHeight);
}

function showHidePanes() {
  if (searchByCourse) {
    shownSearch = $('#searchWrapperCourses');
    shownDisplay = $('#displayWrapperPrograms');
    hiddenSearch = $('#searchWrapperPrograms');
    hiddenDisplay = $('#displayWrapperCourses');
  } else {
    shownSearch = $('#searchWrapperPrograms');
    shownDisplay = $('#displayWrapperCourses');
    hiddenSearch = $('#searchWrapperCourses');
    hiddenDisplay = $('#displayWrapperPrograms');
  }
}

function sortCollege(A,B) {
	return stripStartingFiller(A).localeCompare(stripStartingFiller(B));
}

function stripQuotes(string) {
	return string.replace(/\"/g, "");
}

function stripStartingFiller(collegeName) {
	if (collegeName.match(/^The .*/)) {
		return stripStartingFiller(collegeName.slice(4));
	}
	if (collegeName.match(/^College .*/)) {
		return stripStartingFiller(collegeName.slice(8));
	}
	if (collegeName.match(/^of .*/)) {
		return stripStartingFiller(collegeName.slice(3));
	}
	if (collegeName.match(/^School .*/)) {
		return stripStartingFiller(collegeName.slice(7));
	}
	return collegeName;
}

function toggleGroup(element) {
  var el = $(element);
	if (el.hasClass('collapsed')) {
    el.find('.verticalLine').fadeOut(300, 'swing');
		el.next().slideDown(300, 'swing');
    el.removeClass('collapsed');
	} else {
    el.find('.verticalLine').fadeIn(300, 'swing');
		el.next().slideUp(300, 'swing');
    el.addClass('collapsed');
	}
}

function toggleGroups() {
  if (divide) {
    if (shownDisplay.hasClass('collapsed')) {
      shownDisplay.find('h3').each(function() {
        if ($(this).hasClass('collapsed')) {
          toggleGroup($(this));
        }
      });
      hiddenDisplay.find('h3').each(function() {
        if ($(this).hasClass('collapsed')) {
          toggleGroup($(this));
        }
      });
      $('.collapseAll').find('.verticalLine').fadeOut(300, 'swing');
      shownDisplay.removeClass('collapsed');
      hiddenDisplay.removeClass('collapsed');
    } else {
      shownDisplay.find('h3').each(function() {
        if (!$(this).hasClass('collapsed')) {
          toggleGroup($(this));
        }
      });
      hiddenDisplay.find('h3').each(function() {
        if (!$(this).hasClass('collapsed')) {
          toggleGroup($(this));
        }
      });
      $('.collapseAll').find('.verticalLine').fadeIn(300, 'swing');
      shownDisplay.addClass('collapsed');
      hiddenDisplay.addClass('collapsed');
    }
  }
}

function toggleSearchPane() {
  var paneToggler = $('#paneToggler');
  var searchPane = $('#searchPane');
  if (paneToggler.hasClass('collapsed')) {
    searchPane.slideDown(300, 'swing');
    paneToggler
      .removeClass('collapsed')
      .text('\u25b2 Collapse Search \u25b2');
  } else {
    searchPane.slideUp(300, 'swing');
    paneToggler
      .addClass('collapsed')
      .text('\u25bc Expand Search \u25bc');
  }
}

function toggleSettingsPane() {
  var settingsPane = $('#optionsPane');
  var width = settingsPane.width();
  var freezeViewport = $('#freezeViewport');
  var menuToggle = $('#menuToggle');
  
  if (settingsPane.hasClass('collapsed')) {
    settingsPane.animate({
      left: "+=" + width,
      easing: 'swing'
    }, 300);
    settingsPane.removeClass('collapsed');
    freezeViewport.fadeIn(300);
    menuToggle.css('background-color', '#000');
  } else {
    settingsPane.animate({
      left: '-=' + width,
      easing: 'swing'
    }, 300);
    settingsPane.addClass('collapsed');
    freezeViewport.fadeOut(300);
    menuToggle.css('background-color', 'transparent');
  }
}

function updateDisplay() {
  searchItemsSelected = [];
  if (searchByCourse) {
    shownSearch.find('select').each(function() {
      if (!($(this).val() === '')) {
        searchItemsSelected.push($(this).val());
      }
    });
    updateDisplayItems(searchItemsSelected, courseData);
  } else {
    if (shownSearch.find('select.Choose').val()) {
      searchItemsSelected = shownSearch.find('select.Choose').val().slice();
    }
    $('div.searchSelItem').each(function() {
      if ($.inArray($(this).text(), searchItemsSelected) == -1) {
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
    updateDisplayItems(searchItemsSelected, majorData);
  }
}

function updateDisplayItems(searchItemsSelected, searchItemData) {
  var displayItems = [];
  var idx = 0;

  if (!searchByCourse) {
    idx = 1;
  }
  
  resetDisplay(displayItemsEnabled[idx]);

  for (var i = 0; i < searchItemsSelected.length; i++) {
    var searchItem = searchItemsSelected[i];
    if (i > 0) {
      displayItems = intersect(displayItems, searchItemData[searchItem][2]);
    } else {
      displayItems = searchItemData[searchItem][2].slice();
    }
  }
  
  displayItemsEnabled[idx] = displayItems;
  
  enableDisplayItems();
}

function URL2img(string) {
	return string.replace(/[:\/%#]+/g, "_") + ".png";
}





  


//Main program
$( document ).ready(function() {
	//Get source data
	 $.ajax({
		url: dataURL,
		type: 'get',
		dataType: 'html',
		async: false,
		success: function(data) {
			srcData = data;
		}
	 });
	srcData = stripQuotes(srcData.replace(/\r\n/gm, "\n")).split("\n");
	headings = srcData[0].split('\t');
	categories = srcData[1].split('\t');
  getHeadings();
  getData();
  
  //Initialize display
  showHidePanes();
  shownSearch.css('display', 'none');
  shownDisplay.css('display', 'none');
  hiddenSearch.css('display', 'none');
  hiddenDisplay.css('display', 'none');

	//Define global event handlers
  $('#help').click(advanceTour);
  $('#paneToggler').click(toggleSearchPane);
	$('#reset').click({element: reset}, resetter);
  $('#tour').click(function() {
    $('#help').fadeIn(300);
    advanceTour();
  });
  $('#divide').find('.toggle').toggles({on: divide}).on('toggle', groupItems);
  $('#invertSearch').click(inverter);
	shownDisplay.find('.displayHeader').click(toggleGroups);
	hiddenDisplay.find('.displayHeader').click(toggleGroups);
  $('#menuToggle').hover(function() {
    $(this).find('span').css('background-color', '#FFF')
  }, function() {
    $(this).find('span').css('background-color', '#EEE')
  }).click(toggleSettingsPane);
  $(feedbackTitle).click(function() {
    if ($(feedbackContainer).hasClass('collapsed')) {
      $(feedbackContainer).removeClass('collapsed');
      $(feedbackContentWrapper).slideUp(300);
    } else {
      $(feedbackContainer).addClass('collapsed');
      $(feedbackContentWrapper).slideDown(300);
    }
  });
  $('#freezeViewport').click(toggleSettingsPane);
	$(window).on('resize', setSizes);

  
  
  //Build dynamic page content
  buildAll();
  setSizes();
  
  helpPages = $('#help').children('div');
  for (var i = 0; i < helpPages.length; i++) {
    var helpPage = $(helpPages[i]);
    var progress = helpPage.find('div.progress');
    progressString = '';
    for (var j = 0; j < helpPages.length; j++) {
      if (j == i) {
        progressString += ' \u25cf';
      } else {
        progressString += ' \u25cb';
      }
    }
    progress.text(progressString);
  }
  advanceTour();  

});