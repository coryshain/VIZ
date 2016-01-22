///////////////////////////////////////
//
// Core methods for VIZ and VIZ Builder
//
///////////////////////////////////////





///////////////////////////////////////
//
// Borrowed methods
//
///////////////////////////////////////

// Taken directly from a Stack Overflow post by Pimp Trizkit. Thank you!
function shadeBlendConvert(p, from, to) {
    if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(typeof(to)!="string"&&typeof(to)!="undefined"))return null; //ErrorCheck
    if(!this.sbcRip)this.sbcRip=function(d){
        var l=d.length,RGB=new Object();
        if(l>9){
            d=d.split(",");
            if(d.length<3||d.length>4)return null;//ErrorCheck
            RGB[0]=i(d[0].slice(4)),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
        }else{
            switch(l){case 8:case 6:case 3:case 2:case 1:return null;} //ErrorCheck
            if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 digit
            d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=l==9||l==5?r(((d>>24&255)/255)*10000)/10000:-1;
        }
        return RGB;}
    var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=sbcRip(from),t=sbcRip(to);
    if(!f||!t)return null; //ErrorCheck
    if(h)return "rgb("+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
    else return "#"+(0x100000000+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)*0x1000000+r((t[0]-f[0])*p+f[0])*0x10000+r((t[1]-f[1])*p+f[1])*0x100+r((t[2]-f[2])*p+f[2])).toString(16).slice(f[3]>-1||t[3]>-1?1:3);
}

// Taken directly from a Stack Overflow post by yckart. Thank you!
$.fn.animateRotate = function(startAngle, endAngle, duration){
    return this.each(function(){
        var elem = $(this);

        $({deg: startAngle}).animate({deg: endAngle}, {
            duration: duration,
            step: function(now){
                elem.css({
                  '-moz-transform':'rotate('+now+'deg)',
                  '-webkit-transform':'rotate('+now+'deg)',
                  '-o-transform':'rotate('+now+'deg)',
                  '-ms-transform':'rotate('+now+'deg)',
                  'transform':'rotate('+now+'deg)'
                });
            },
        });
    });
};

// Taken from Mozilla article on browser detection
function isMobile() {
  return /Mobi/i.test(navigator.userAgent);
}





///////////////////////////////////////
//
// Array manipulation
//
///////////////////////////////////////

// Check equality of two arrays
function arrEq(A, B) {
  var diff = firstDiff(A, B);
  if (diff > -1) {
    console.log('Arrays are not equal.');
    console.log('At index ' + diff + ', first array contains '
          + A[diff] + ', while second array contains ' + B[diff] + '.');
    return false;
  }
  if (A.length !== B.length) {
    console.log('Arrays not equal. Lengths differ.');
    return false;
  }
  return true;
}

// Returns index of first different element in two sorted arrays
function firstDiff(A, B) {
  for (var i = 0; i < Math.min(A.length, B.length); i++) {
    if (A[i] !== B[i]) {
      return i;
    }
  }
  return -1;
}

// Add an element to an array.
function addElement(element, array) {
  if ($.inArray(element, array) === -1) {
    array.push(element);
  }
}

// Add an element to an array.
// If already in array, move to last position.
function addElementLast(element, array) {
  var idx = $.inArray(element, array);
  if (idx > -1) {
    array.splice(idx, 1);
  }
  array.push(element);
}

// Remove an element from an array
function removeElement(element, array) {
  array.splice($.inArray(element, array), 1);
}

// Return the intersection of two arrays
function intersect(A, B){
  var result = [];
  for (i = 0; i < A.length; i++) {
    for (j = 0; j < B.length; j++) {
      if (A[i] === B[j] && $.inArray(A[i], result) === -1) {
        result.push(A[i]);
        break;
      }
    }
  }
  return result;
}

// Return the union of two arrays
function union(A, B){
  var result = A.slice();
  for (i = 0; i < B.length; i++) {
      if ($.inArray(B[i], result) === -1) {
        result.push(B[i]);
    }
  }
  return result;
}





///////////////////////////////////////
//
// String manipulation
//
///////////////////////////////////////

// Strip certain words from string start for sorting
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





///////////////////////////////////////
//
// Comparators
//
///////////////////////////////////////

// Compare divs by data-name attribute
function compareName(A, B) {
  return $(A).attr('data-name').localeCompare($(B).attr('data-name'));
}





///////////////////////////////////////
//
// Data validation
//
///////////////////////////////////////

// Checks if variable is a valid integer
function validInt(n) {
    return typeof n === 'number' && n % 1 === 0;
}

// Checks if variable is a valid string
function validString(str) {
  return typeof str === 'string';
}

// Checks if variable is a valid array
function validArray(A) {
  if (A) {
    return A.constructor === Array;
  }
  return false;
}

// Checks if variable is a valid object
function validObject(A) {
  return A === Object(A);
}

// Checks if string is a valid hex color code
function validHex(col) {
  if (col) {
    if (typeof col === 'string') {
      if (col[0] === '#') {
        if (col.length === 4 || col.length === 7) {
          for (var i = 1; i < col.length; i++) {
            var num = parseInt(col[i], 16);
            if (isNaN(num)) {
              return false;
            }
          }
          return true;
        }
      }
    }
  }
  return false;
}