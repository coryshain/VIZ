///////////////////////////////////////
//
// VIZ Builder component code
//
///////////////////////////////////////

(function() {


  ///////////////////////////////////////
  //
  // Global variables
  //
  ///////////////////////////////////////
  
  // Object containing all VIZ data
  var allData;
  
  // Shortcut to VIZ course data
  var courseData;
  
  // Shortcut to VIZ program data
  var progData;
  
  // Shortcut to VIZ course category data
  var catData;
  
  // Shortcut to VIZ program college/school data
  var colData;
  
  // Shortcut to VIZ metadata
  var metaData;
  
  // Utility object for flipping between course and program typed data
  var opp = {'course': 'prog', 'prog': 'course'};
  
  // Array of currently active popups in reverse order of z-index precedent
  var zStack = [];
  
  
  
  
  
  ///////////////////////////////////////
  //
  // Database retrieval and initialization
  //
  ///////////////////////////////////////
  
  // Load input DB from server
  function loadVIZ() {
    $('div#uploadDB').find('div.warn').css('display', 'none');
    $.ajax({
      url: 'data/vizDB.txt',
      type: 'get',
      dataType: 'json',
      async: true,
      success: function(db) {
        if (validDB(db)) {
          allData = db;
          assignDataLabels();
          buildUI();
          $('div#loading').fadeOut(200);
          $('div#uploadDB').fadeOut(300);
          removeElement('uploadDB', zStack);
          unfreeze();
        } else {
          $('div#uploadWarn3').css('display', 'block');
          $('div#loading').fadeOut(200);
        }
      },
      error: function() {
        $('div#uploadWarn2').css('display', 'block');
        $('div#loading').fadeOut(200);
      }
    });
  }
  
  // Upload and create VIZ DB from user file
  function openFile() {
    $('div#uploadDB').find('div.warn').css('display', 'none');
    var success = false;
    var parsed = false;
    input = document.querySelector('input#DBInput');
    if (input.files[0]) {
      var reader = new FileReader();
      reader.onload = function() {
        try {
          theData = $.parseJSON(reader.result);
          parsed = true;
          if (validDB(theData)) {
            allData = theData;
            assignDataLabels();
            buildUI();
            $('div#uploadDB').fadeOut(300);
            removeElement('uploadDB', zStack);
            unfreeze();
            success = true;
          }
        } catch(e) {
          $('div#uploadWarn2').css('display', 'block');          
        }
        finally {
          if (parsed && !success) {
            $('div#uploadWarn3').css('display', 'block');
          }
          $('div#loading').fadeOut(200);
        }
      };
      reader.readAsText(input.files[0]);
    } else {
      $('div#loading').css('display', 'none');
      $('div#uploadWarn1').css('display', 'block');
    }
  }
  
  // Initialize new blank database
  function newDB() {
    allData = {
      'courseData': {},
      'progData': {},
      'catData': {},
      'colData': {},
      'metaData': {
        'col1': '#00CCFF',
        'col2': '#0099FF',
        'curKey': 0,
        'website': 'https://github.com/coryshain/VIZ',
        'divide': true,
        'searchByCourse': true,
        'logo': '',
        'bg': [],
        'help': '',
        'favicon': '',
        'email': '',
      }
    };
  }
  
  // Begin working with new blank database
  function startBlankDB() {
    newDB();
    assignDataLabels();
    buildUI();
  }
  
  // Map DB data objects to shortcut variables for ease of use
  function assignDataLabels() {
    courseData = allData['courseData'];
    progData = allData['progData'];
    catData = allData['catData'];
    colData = allData['colData'];
    metaData = allData['metaData'];
  }
  
  
  
  
  
  ///////////////////////////////////////
  //
  // Data manipulation
  //
  ///////////////////////////////////////
  
  // Add an undirected edge between a program and course
  function addEdge(courseKey, programKey) {
    courseData[courseKey]['appr'].push(programKey);
    progData[programKey]['appr'].push(courseKey);
  }
  
  // Remove an undirected edge between a program and course
  function removeEdge(courseKey, programKey) {
    courseData[courseKey]['appr'].splice($.inArray(programKey, courseData[courseKey]['appr']), 1);
    progData[programKey]['appr'].splice($.inArray(courseKey, progData[programKey]['appr']), 1);
  }
  
  // Add a new element to the DB
  function smartPush(elKey, map, catKey) {
    if (map[catKey]['list']) {
      map[catKey]['list'].push(elKey);
    } else {
      map[catKey] = {'list': [elKey]};
    }
  }
  
  // Add a new group to the DB
  function groupPush(key, type, groupKey) {
    var groupData = catData;
    if (type === 'prog') {
      var groupData = colData;
    }
    if (groupData[groupKey]['list']) {
      groupData[groupKey]['list'].push(key);
    } else {
      groupData[groupKey] = {'list': [key]};
    }
  }
  
  // Switch group affiliation of existing element
  function groupSwitch(key, type, groupKey) {
    var elData = courseData;
    var groupData = catData;
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
    }
    groupPop(key, type);
    groupPush(key, type, groupKey);
    elData[key]['cat'] = groupKey;
  }
  
  // Update name of existing group
  function updateGroupName(groupKey, type) {
    var groupData = catData;
    if (type === 'col') {
      groupData = colData;
    }
    var parent = $('div#' + type + 'List')
          .find('div[data-key="' + groupKey + '"]');
    $('div#' + type + 'Manage').find('.warn').css('display', 'none');
    var newVal = parent.find('input.catInp').val();
    var oldVal = groupData[groupKey]['name'];
    if (!(newVal === oldVal)) {
      if (validCatAdd(newVal, type, parent)) {
        groupData[groupKey]['name'] = newVal;
        $('select#' + type + 'Cat')
              .find('option[value="' + groupKey + '"]').text(newVal);
        showSuccess();
      } else {
        parent.find('input.catInp').val(oldVal);
      }
    }
  }
  
  // Remove an existing group from the DB
  function groupPop(key, type) {
    var elData = courseData;
    var groupData = catData;
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
    }
    var groupKey = elData[key]['cat'];
    groupList = groupData[groupKey]['list'];
    groupList.splice($.inArray(key, groupList), 1);
  }
  
  // Submit input data for new element creation and update input pane display
  function save(type, elData, catData) {
    var name = $('input#' + type + 'Name').val();
    var cat = $('select#' + type + 'Cat').val();
    var site = $('input#' + type + 'Site').val();
    var thisPane = $('div#' + type + 'Add');
    thisPane.find('div.warn').css('display', 'none');
    
    if (!validInput(thisPane, elData)) {
      return;
    }

    var key = metaData['curKey'];
    elData[metaData['curKey']] = {'name': name, 'cat' : cat, 'site': site, 'appr': []};
    metaData['curKey'] += 1;
    smartPush(key, catData, cat);
    $('input#' + type + 'Name').val('');
    $('select#' + type + 'Cat').val('');
    $('input#' + type + 'Site').val('');
    createElement(key, type);
    showSuccess();
  }
  
  // Submit changes from manager popup
  function manConf(type) {
    var groupData = catData;
    var elType = 'course';
    if (type === 'col') {
      groupData = colData;
      elType = 'prog';
    }
    var manager = $('div#' + type + 'Manage');
    $('div#' + type + 'Manage').find('div.warn').css('display', 'none');
    var manInput = manager.find('input#' + type + 'Create');
    var newVal = manInput.val();
    if (type === 'bg') {
      if (newVal === '') {
        $(this).parent().find('div#bgAddWarn1').css('display', 'block');
        return;
      }
      metaData['bg'].push(newVal);
      createBG(newVal);
      showSuccess();
    } else {
      if (!validCatAdd(newVal, type, $(this).parent())) {
        return;
      }
      var key = metaData['curKey'];
      groupData[key] = {'name': newVal, 'list': []};
      metaData['curKey'] += 1;
      createGroup(key, elType);
      setManSize(type);
      manInput.val('');
      showSuccess();
    }
  }
  
  
  
  
  
  ///////////////////////////////////////
  //
  // UI element initialization
  //
  ///////////////////////////////////////
  
  // Build DB-contingent UI elements, for use on data load/initialization
  function buildUI() {
    $('div#courseList').text('');
    $('div#progList').text('');
    $('div#courseEditorList').text('');
    $('div#progEditorList').text('');
    $('select.catInp').html($('<option data-name="_">'));
    $('div#catList').text('');
    $('div#colList').text('');
    $('div#bgList').text('');
    $('input#primCol').val(metaData['col1']);
    $('input#secCol').val(metaData['col2']);
    $('input#defSite').val(metaData['website']);
    $('input#helpURL').val(metaData['help']);
    $('input#favURL').val(metaData['favicon']);
    $('input#email').val(metaData['email']);
    $('textarea#logoHTML').val(metaData['logo']);
    $('input#divide').prop('checked', metaData['divide']).click(function() {
      metaData['divide'] = $(this).prop('checked');
    });
    $('input#searchByCourse').prop('checked', metaData['searchByCourse']).click(function() {
      metaData['searchByCourse'] = $(this).prop('checked');
    });
    buildEdHandlers($('div#courseEditor'), 'course');
    buildEdHandlers($('div#progEditor'), 'prog');
    
    for (c in courseData) {
      createElement(c, 'course');
    }
    
    for (p in progData) {
      createElement(p, 'prog');
    }
    
    for (cat in catData) {
      createGroup(cat, 'course');
    }

    for (col in colData) {
      createGroup(col, 'prog');
    }
    
    for (var i = 0; i < metaData['bg'].length; i++) {
      createBG(metaData['bg'][i]);
    }
    
    setSizes(); 
  }
  
  // Build delete confirmation popup and define handlers
  function buildDelete() {
    var deleter = $('div#areUSure');
    deleter.find('button#yesSure').click(function() {
      var type = $(this).parent().find('span#toDeleteType').text();
      if (type === 'program') {
        type = 'prog';
      }
      var elData = courseData;
      var oppData = progData;
      var groupData = catData;
      if (type === 'prog') {
        elData = progData;
        oppData = courseData;
        groupData = colData;
      }
      var key = parseInt($(this).parent().attr('data-todelete'));
      $('div[data-key="' + key + '"]').detach();
      $('div#areUSure').fadeOut(300);
      removeElement('areUSure', zStack);
      unfreeze();
      for (var i = 0; i < elData[key]['appr'].length; i++) {
        oppData[elData[key]['appr'][i]]['appr'].splice($.inArray(key, oppData[elData[key]['appr'][i]]['appr']), 1);
      }
      groupPop(key, type);
      delete elData[key];
      showSuccess();
    });
  }
  
  // Build editor popups and define handlers
  function buildEdHandlers(editor, type) {
    editor.find('button.nameSave').click(function() {
      var elData = courseData;
      var oppData = progData;
      var groupData = catData;
      if (type === "prog") {
        elData = progData;
        oppData = courseData;
        groupData = colData;
      }
      var key = parseInt(editor.attr('data-infocus'));
      var header = editor.find('h3#' + type + 'EdTitle');
      var listEl = $('div#' + type + 'List').find('div[data-key="' + key + '"]');
      var listEdEl = $('div#' + opp[type] + 'EditorList').find('div[data-key="' + key + '"]');
      var newName = $(this).parent().find('input.nameInp').val();
      $(this).next().next().css('display', 'none');
      if (!(newName === elData[key]['name'])) {
        if (validName(editor, elData)){
          elData[key]['name'] = newName;
          header.text(newName);
          listEl.attr('data-name', newName).find('span.nameTag').text(newName);
          listEdEl.attr('data-name', newName).text(newName);
          sortedAppend(listEl, $('div#' + type + 'List'), compareName);
          sortedAppend(listEdEl, $('div#' + opp[type] + 'EditorList'), compareName);
          showSuccess();
        }
      }
    });
    editor.find('button.catSave').click(function() {
      var elData = courseData;
      var oppData = progData;
      var groupData = catData;
      if (type === "prog") {
        elData = progData;
        oppData = courseData;
        groupData = colData;
      }
      var key = parseInt(editor.attr('data-infocus'));
      var newCat = $(this).parent().find('select.catInp').val();
      $(this).next().next().css('display', 'none');
      if (!(newCat === elData[key]['cat'])) {
        if (validCat($(this).parent())) {
          groupSwitch(key, type, newCat);
          showSuccess();
        }
      }
    });
    editor.find('button.siteSave').click(function() {
      var elData = courseData;
      var oppData = progData;
      var groupData = catData;
      if (type === "prog") {
        elData = progData;
        oppData = courseData;
        groupData = colData;
      }
      var key = parseInt(editor.attr('data-infocus'));
      var newSite = $(this).parent().find('input.siteInp').val();
      if (!(newSite === elData[key]['site'])) {
        elData[key]['site'] = newSite;
        showSuccess();
      }
    });
  }
  
  // Build manager popups
  function buildManager(type) {
    $('button[data-type="' + type + '"]').click(function() {
      revealManager(type);
    });
    $('div#' + type + 'Manage')
          .find('button#' + type + 'CreateConf')
          .click(function() {
            manConf(type);
          });
    $('button#' + type + 'ManClose').click(function() {
      manClose(type);
    });
  }
  
  // Append child div to parent sorted by sortOrder param
  function sortedAppend(div, parent, sortOrder) {
    var inserted = false;
    parent.children().each(function() {
      if (sortOrder) {
        var compare = sortOrder(div, $(this));
      } else {
        var compare = $(div).text().localCompare($(this).text());
      }
      if (compare < 0) {
        $(this).before(div);
        inserted = true;
        return false;
      }
    });
    if (!inserted) {
      parent.append(div);
    }
  }

  



  ///////////////////////////////////////
  //
  // DB-contingent DOM manipulation
  //
  ///////////////////////////////////////

  // Create BG div from URL string
  function createBG(url) {
    var newManagerItem = $('<div data-key="' + url + '" data-name="'
        + url + '" class="manEl"><span class="edInp"><button><a href="' + url
        + '" target="_blank" class="block">' + url + '</a></button></span></div>');
    var buttonContainer = $('<div class="edSave"></div>');
    var newItemDel = $('<div class="subSave"><i class="fa fa-trash delete save"></i></div>');
    var newUp = $('<div class="up move subSave"><i class="fa fa-caret-up"></i></div>');
    var newDown = $('<div class="down move subSave"><i class="fa fa-caret-down"></i></div>');
    buttonContainer.append(newUp).append(newDown).append(newItemDel);
    newUp.click(function() {
      if (newManagerItem.prev().length > 0) {
        newManagerItem.prev().before(newManagerItem);
        var idx = $.inArray(url, metaData['bg']);
        metaData['bg'].splice(idx, 1);
        metaData['bg'].splice(idx - 1, 0, url);
      }
    });
    newDown.click(function() {
      if (newManagerItem.next().length > 0){
        newManagerItem.next().after(newManagerItem);
        var idx = $.inArray(url, metaData['bg']);
        metaData['bg'].splice(idx, 1);
        metaData['bg'].splice(idx + 1, 0, url);
      }
    });
    
    $('div#bgList').append(newManagerItem);
    newManagerItem.prepend(buttonContainer)
    newItemDel.click(function() {
      $(this).parent().parent().find('div.warn').css('display', 'none');
      metaData['bg'].splice($.inArray(url, metaData['bg']), 1);
      newManagerItem.detach();
    });
  }
  
  // Create DB element and all associated UI elements from key
  function createElement(key, type) {
    var parent = $('div#' + type + 'List');
    var editor = $('div#' + type + 'Editor');
    var oppEditor = $('div#' + opp[type] + 'Editor');
    var oppEditorList = oppEditor.find('div#' + opp[type] + 'EditorList');
    var elData = courseData;
    var oppData = progData;
    var groupData = catData;
    if (type === 'prog') {
      elData = progData;
      oppData = courseData;
      groupData = colData;
    }
    
    // Create new element in editor
    var newEditorHTML = $('<div class="editorEl"><div class="edSave"><i class="fa fa-unlink link"></i></div> '
            + elData[key]['name'] + '</div>');
    newEditorHTML.attr('data-key', key).attr('data-name', elData[key]['name']);
    newEditorHTML.click(function() {
      var target = parseInt($('div#' + opp[type] + 'Editor').attr('data-inFocus'));
      if ($(this).hasClass('selected')) {
        $(this).removeClass('selected');
        $(this).find('i.link').removeClass('fa-link').addClass('fa-unlink');
        if (type === 'course') {
          removeEdge(key, target);
        } else {
          removeEdge(target, key);
        }
      } else {
        $(this).addClass('selected');
        $(this).find('i.link').removeClass('fa-unlink').addClass('fa-link');
        if (type === 'course') {
          addEdge(key, target);
        } else {
          addEdge(target, key);
        }
      }
    });
    sortedAppend(newEditorHTML, oppEditorList, compareName);
    
    // Create new element in main list
    createElementDIV(parent, key, type);
  }
  
  // Create new element DIV in parent from key
  function createElementDIV(parent, key, type) {
    var elData = courseData;
    var editor = $('div#courseEditor');
    if (type === 'prog') {
      elData = progData;
      editor = $('div#progEditor');
    }
    var newHTML = $('<div class="' + type + 'El"><div class="icons"><i class="fa fa-pencil edit">'
            + '</i> <i class="fa fa-trash delete save"></i></div><span class="nameTag">'
            + elData[key]['name'] + '</span></div>');
    newHTML.attr('data-key', key).attr('data-name', elData[key]['name']);
    newHTML.find('i.edit').click(function() {
      var name = newHTML.attr('data-name');
      var els = editor.find('div#' + type + 'EditorList').children();
      $('div#freezeViewport').fadeIn(300);
      editor.attr('data-inFocus', key);
      editor.find('h3#' + type + 'EdTitle').text(name);
      editor.find('span#' + type + 'EdLabel').text(name);
      editor.find('input#' + type + 'NameEd').val(name);
      editor.find('select#' + type + 'CatEd').val(elData[key]['cat']);
      editor.find('input#' + type + 'SiteEd').val(elData[key]['site']);
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if ($.inArray(parseInt($(el).attr('data-key')), elData[key]['appr']) > -1) {
          if (!$(el).hasClass('selected')) {
            $(el).addClass('selected').find('i.link').removeClass('fa-unlink').addClass('fa-link');
          }
        } else {
          if ($(el).hasClass('selected')) {
            $(el).removeClass('selected').find('i.link').removeClass('fa-link').addClass('fa-unlink');
          }
        }
      }
      addElement(editor.attr('id'), zStack);
      shuffleZ();
      editor.fadeIn(300);
      setEdSize(type);
    });
    newHTML.find('i.delete').click(function() {
      var deleter = $('div#areUSure');
      var typeName = type;
      if (typeName === 'prog') {
        typeName = 'program';
      }
      $('div#freezeViewport').fadeIn(300);
      addElement(deleter.attr('id'), zStack);
      shuffleZ();
      deleter
          .attr('data-todelete', key)
          .fadeIn(300)
          .find('span#toDelete')
          .text(elData[key]['name']);
      deleter.find('span#toDeleteType').text(typeName);
    });
    sortedAppend(newHTML, parent, compareName);
  }

  // Create group and all associated UI elements from key
  function createGroup(groupKey, type) {
    var elData = courseData;
    var groupData = catData;
    var groupType = 'cat';
    var groupLabel = 'Category';
    if (type === 'prog') {
      elData = progData;
      groupData = colData;
      groupType = 'col';
      groupLabel = 'College/School';
    }
    var newOption = $('<option value="' + groupKey + '" data-name="'
          + groupData[groupKey]['name'] + '">'
          + groupData[groupKey]['name'] + '</option>');
    sortedAppend(newOption, $('select#' + type + 'Cat'), compareName);
    sortedAppend(newOption.clone(), $('select#' + type + 'CatEd'), compareName);
    
    var newManagerItem = $('<div data-key="' + groupKey + '" data-name="'
          + groupData[groupKey]['name'] + '" class="manEl"></div>');
    var newInputSpan = $('<span class="edInp"></span>');
    var newItemInput = $('<input type="text" id="' + groupKey + '" class="catInp">');
    newInputSpan.append(newItemInput);
    newItemInput.val(groupData[groupKey]['name']);
    var newButtonContainer = $('<div class="edSave save"></div>');
    var newItemSave = $('<div class="subSave"><i class="fa fa-floppy-o"></i></div>');
    var newItemDel = $('<div class="subSave"><i class="fa fa-trash delete save"></i></div>');
    var addWarn1 = '<div id="' + groupType
          + 'AddWarn1" class="warn">Name cannot be blank.</div>';
    var addWarn2 = '<div id="' + groupType + 'AddWarn2" class="warn">'
          + groupLabel + ' with that name already exists.</div>'
    
    sortedAppend(newManagerItem, $('div#' + groupType + 'List'), compareName);
    newManagerItem
          .append(newButtonContainer)
          .append(newInputSpan)
          .append($(addWarn1))
          .append($(addWarn2));
    newButtonContainer.append(newItemSave).append(newItemDel);
    newItemSave.click(function() {
      updateGroupName(groupKey, groupType);
    });
    newItemDel.click(function() {
      $('div#deleteList').text('');
      $(this).parent().parent().find('div.warn').css('display', 'none');
      if (groupData[groupKey]['list'].length == 0) {
        delete groupData[groupKey];
        $(this).parent().parent().detach();
        $('option[value="' + groupKey + '"]').detach();
      } else {
        for (var i = 0; i < groupData[groupKey]['list'].length; i++) {
          createElementDIV($('div#deleteList'), groupData[groupKey]['list'][i], type);
        }
        var deleteAlert = groupData[groupKey]['name']
              + ' cannot be deleted since it has the following items assigned to it:';
        $('div#deleteMessage').empty()
              .append(deleteAlert);
        addElement('deleteAlert', zStack);
        shuffleZ();
        $('div#deleteAlert').fadeIn(300);
        setDeleteAlertSize();
      }
    });
  }
 
  
  
  
  
  ///////////////////////////////////////
  //
  // UI Interaction
  //
  ///////////////////////////////////////
    
  // Expand/collapse main display lists by type
  function expandCollapse(type) {
    var header = $('h2#courseListHeader');
    if (type === 'prog') {
      header = $('h2#progListHeader');
    }
    if (header.hasClass('collapsed')) {
      $('div#' + type + 'List').fadeIn(300);
      header.find('span.collapser').animateRotate(90, 0, 200);
      header.find('i.plus').fadeOut(300);
      header.removeClass('collapsed');
    } else {
      $('div#' + type + 'List').fadeOut(300);
      header.find('span.collapser').animateRotate(0, 90, 200);
      header.find('i.plus').fadeIn(300);
      header.addClass('collapsed');
    }
  }
    
  // Reveal manager popup
  function revealManager(type) {
    addElement(type + 'Manage', zStack);
    shuffleZ();
    $('div#' + type + 'Manage').fadeIn(300);
    setManSize(type);
    $('div#freezeViewport').fadeIn(300);
  }
  
  // Close manager popup
  function manClose(type) {
    $('div#' + type + 'Manage').fadeOut(300);
    removeElement(type + 'Manage', zStack);
    unfreeze();
  }
  
  // Briefly reveal save confirmation div
  function showSuccess() {
    $('div#success').fadeIn(200, function() {
      setTimeout(function() {$('div#success').fadeOut(200)}, 2000);
    });
  }
  
  // Assign z-indices to popups in correct order
  function shuffleZ() {
    var top = 2000;
    for (var i = zStack.length - 1; i >= 0; i--) {
      $('#' + zStack[i]).css('z-index', top);
      top--;
    }
  }
  
  // Expand/collapse top menue
  function toggleMenu() {
    var menuToggler = $('div#menuToggle');
    var topBar = $('div#topBarInner');
    var topBarBuffer = $('div#topBarBuffer');
    if (menuToggler.hasClass('collapsed')) {
      topBar.slideDown(300);
      topBarBuffer.slideDown(300);
      menuToggler
        .removeClass('collapsed')
    } else {
      topBarBuffer.slideUp(300);
      topBar.slideUp(300);
      menuToggler
        .addClass('collapsed')
    }
  }
  
  // Process call to unfreeze viewport (no effect if popup(s) still active)
  function unfreeze(callback) {
    if (zStack.length === 0) {
      $('div#freezeViewport').fadeOut(300, callback);
    }
  }
  
  // Preview VIZ in browser with current changes applied
  function preview() {
    $.ajax({
      url: 'viz.html',
      type: 'get',
      dataType: 'text',
      async: true,
      success: function(string) {
        var preview = window.open();
        preview.allData = allData;
        preview.document.write(string);
      }
    });
  }
  
    //Define global click event handlers
  function setGlobClicks() {
    $('button#switch2props').click(function() {
      $('div#items').slideUp(300);
      $('div#props').slideDown(300);
    });
    $('button#switch2items').click(function() {
      $('div#props').slideUp(300);
      $('div#items').slideDown(300);
    });
    $('button#courseEditClose').click(function() {
      $('div#courseEditor').fadeOut(300);
      removeElement('courseEditor', zStack);
      unfreeze();
    });
    $('button#progEditClose').click(function() {
      $('div#progEditor').fadeOut(300);
      removeElement('progEditor', zStack);
      unfreeze();
    });
    $('button#courseSave').click(function() {
      save('course', courseData, catData);
    });
    $('button#progSave').click(function() {
      save('prog', progData, colData);
    });
    $('button#propSave').click(function() {
      var parent = $(this).parent().parent();
      parent.find('div.warn').css('display', 'none');
      if (validColor(parent)) { 
        metaData['col1'] = parent.find('input#primCol').val();
        metaData['col2'] = parent.find('input#secCol').val();
        metaData['favicon'] = $('input#favURL').val();          
        metaData['email'] = $('input#email').val();          
        metaData['logo'] = parent.find('textarea#logoHTML').val();
        if (validSite(parent)) {
          metaData['website'] = parent.find('input#defSite').val();
        }
        if ($('input#helpURL').val() !== '') {
          metaData['help'] = $('input#helpURL').val();
        } else {
          metaData['help'] = '#'
        }
        showSuccess();
      }
    });
    
    // Define event handlers for manager popup dialogs
    buildManager('cat');
    buildManager('col');
    buildManager('bg');
    
    // Define event handlers for New DB popup dialg
    $('button#confirmUpload').click(function () {
      $('div#loading').css('display', 'block');
      $(this).parent().find('div.warn').css('display', 'none');
      openFile();
    });
    $('button#import').click(function () {
      $('div#loading').css('display', 'block');
      $(this).parent().find('div.warn').css('display', 'none');
      loadVIZ();
    });
    $('button#startBlank').click(function () {
      $(this).parent().find('div.warn').css('display', 'none');
      $(this).parent().fadeOut(300);
      removeElement('uploadDB', zStack);
      unfreeze(startBlankDB);
    });
    
    // Define behavior of viewport freezer
    $('div#freezeViewport').click(function() {
      $(this).fadeOut(300);
      $('div.popUp').fadeOut(300);
      zStack = [];
    });
    
    // Define Delete Alert close
    $('button#closeDelAlert').click(function() {
      $(this).parent().fadeOut(300);
      removeElement('deleteAlert', zStack);
    });
    
    // Define top menu button behaviors
    $('button#uploadNew').click(function() {
      addElement('uploadDB', zStack);
      shuffleZ();
      $('div#uploadDB').fadeIn(300);
      $('div#freezeViewport').fadeIn(300);
    });
    $('button#noSure').click(function (){
      $('div#areUSure').fadeOut(300);
      removeElement('areUSure', zStack);
      unfreeze();
    });
    $('button#view').click(function() {
      window.open('data:text/plain;charset=utf-8,' + escape(JSON.stringify(allData, null, 2)));
    });
    $('button#download').click(function() {
      addElement('downloadConf', zStack);
      shuffleZ();
      $('div#freezeViewport').fadeIn(300);
      $('div#downloadConf').fadeIn(300);
    });
    $('button#downloadYes').click(function() {
      var dataBlob = new Blob([JSON.stringify(allData)], {type: "application/json;charset=utf-8"});
      saveAs(dataBlob, "vizDB.txt");
      $('div#downloadConf').fadeOut(300);
      unfreeze();
      removeElement('downloadConf', zStack);
    });
    $('button#preview').click(preview);
    $('div#menuToggle').click(toggleMenu);
    
    // Define expand/collapse handlers for main display lists
    $('h2#courseListHeader').click(function() {
      expandCollapse('course');
    });
    $('h2#progListHeader').click(function() {
      expandCollapse('prog');
    });
    $('div#saveAlert').click(function() {
      $(this).fadeOut(300);
      removeElement('saveAlert', zStack);
    });
  }
  
  
  
  
  
  ///////////////////////////////////////
  //
  // Dynamic resizing
  //
  ///////////////////////////////////////
  
  // Set max-height of lists in category delete popup
  function setDeleteAlertSize() {
    $('div#deleteList').css('max-height', '');
    $('div#deleteList').css('max-height', $('div#deleteAlert').innerHeight()
            - ($('div#deleteMessage').outerHeight() + $('button#closeDelAlert').outerHeight() + 48));
  }

  // Set max-height of editor popup viewport
  function setEdSize(type) {
    $('div#' + type + 'EdContainer').css('max-height', '');
    $('div#' + type + 'EdContainer').css('max-height', $('div#' + type + 'Editor').innerHeight()
          - ($('h3#' + type + 'EdTitle').height() + $('button#' + type + 'EditClose').outerHeight() + 68));
  }
  
  // Set max-height of lists in manager popups
  function setManSize(type) {
    $('div#' + type + 'List').css('max-height', '');
    $('div#' + type + 'List').css('max-height', $('div#' + type + 'Manage').innerHeight()
          - ($('div#' + type + 'CreateContainer').height() + $('button#' + type + 'ManClose').outerHeight() + 48));
  }
  
  // Resize everything (called on window.resize)
  function setSizes() {
    $('div#topBarBuffer').css('height', $('div#topBarInner').outerHeight());
    $('div#menuToggleBuffer').css('height', $('div#menuToggle').outerHeight());
    setEdSize('course');
    setEdSize('prog');
    setManSize('cat');
    setManSize('col');
    setManSize('bg');
    setDeleteAlertSize();
  }
  
  

  
  
  ///////////////////////////////////////
  //
  // Input validation
  //
  ///////////////////////////////////////

  // Validate structure of DB
  function validDB(db) {
    if ('courseData' in db &&
        'catData' in db &&
        'progData' in db &&
        'colData' in db&&
        'metaData' in db &&
        'col1' in db['metaData'] &&
        'col2' in db['metaData'] &&
        'curKey' in db['metaData'] &&
        'divide' in db['metaData'] &&
        'searchByCourse' in db['metaData'] &&
        'website' in db['metaData'] &&
        'logo' in db['metaData'] &&
        'bg' in db['metaData'] &&
        'help' in db['metaData'] &&
        'favicon' in db['metaData'] &&
        'email' in db['metaData']) {
          return true;
    }
    return false;
  }
  
  // Validate group creation input
  function validCatAdd(cat, type, parent) {
    if (cat.length === 0) {
      parent.find('div#' + type + 'AddWarn1').css('display', 'block');
      return false;
    }
    groupData = catData;
    if (type === 'col') {
      groupData = colData;
    }
    for (group in groupData) {
      if (groupData[group]['name'] === cat) {
        parent.find('div#' + type + 'AddWarn2').css('display', 'block');
        return false;
      }
    }
    return true;
  }

  // Validate group selection input
  function validCat(parent) {
    var cat = parent.find('select.catInp').val();
    if (!cat) {
      parent.find('div.cat').css('display', 'block');
      return false;
    }
    return true;
  }

  // Validate element name input
  function validName(parent, elData) {
    var name = parent.find('input.nameInp').val();
    if (name.length == 0) {
      parent.find('div.name1').css('display', 'block');
      return false;
    }
    for (key in elData) {
      if (elData[key]['name'] === name) {
        parent.find('div.name2').css('display', 'block');
        return false;
      }
    }
    return true;
  }
  
  // Validate website input
  function validSite(parent) {
    var input = parent.find('input#defSite');
    var newDefSite = input.val();
    if (newDefSite.length === 0) {
      parent.find('div.siteWarn1').css('display', 'block');
      return false;
    }
    return true;
  }
  
  // Validate all input needed for element creation
  function validInput(parent, elData) {
    if (!validName(parent, elData)) {
      return false;
    }
    if (!validCat(parent)) {
      return false;
    }
    return true;
  }
  
  // Validate color input (6-digit hex only, used to edit VIZ properties)
  function validColor(parent) {
    var oldCol1 = metaData['col1'];
    var c1Inp = parent.find('input#primCol');
    var col1 = c1Inp.val();
    if (col1.length === 0) {
      parent.find('div.pcol1').css('display', 'block');
      c1Inp.val(oldCol1);
      return false;
    }
    if (!(col1[0] === '#')) {
      parent.find('div.pcol2').css('display', 'block');
      c1Inp.val(oldCol1);
      return false;
    }
    if (!(col1.length === 4 || col1.length === 7)) {
      parent.find('div.pcol3').css('display', 'block');
      c1Inp.val(oldCol1);
      return false;
    }
    var oldCol2 = metaData['col2'];
    var c2Inp = parent.find('input#secCol');
    var col2 = c2Inp.val();
    if (col2.length === 0) {
      parent.find('div.scol1').css('display', 'block');
      c2Inp.val(oldCol2);
      return false;
    }
    if (!(col2[0] === '#')) {
      parent.find('div.scol2').css('display', 'block');
      c2Inp.val(oldCol2);
      return false;
    }
    if (!(col2.length === 4 || col2.length === 7)) {
      parent.find('div.scol3').css('display', 'block');
      c2Inp.val(oldCol2);
      return false;
    }
    return true;
  }
    
    
    
    
    
    
    
  ///////////////////////////////////////
  //
  // Main program
  //
  ///////////////////////////////////////    
    
  // Initialize a blank database
  startBlankDB();
  
  // Initialize global click-event handlers
  setGlobClicks();
  
  // Build delete confirmation popup
  buildDelete();
  
  // Define window resize handler
  $(window).on('resize', setSizes);

  
  //Show initial database dialog
  addElement('uploadDB', zStack);
  shuffleZ();
  $('div#uploadDB').fadeIn(300);
  $('div#freezeViewport').fadeIn(300);

  // Dynamically set display sizes
  setSizes();
  
  // Hide type menu on small displays
  if ($(window).width() <= 400) {
    $('div#menuToggle').addClass('collapsed');
    $('div#topBarInner').css('display', 'none');
    $('div#topBarBuffer').css('display', 'none');
  }
  
  // Open for business
  $('div#loading').fadeOut(200, function() {
    $('div#saveAlert').fadeIn(300);
  });
    
}());