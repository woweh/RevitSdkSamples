// adsk.common.js - JavaScript functions for ACAD Help Files

// v.1.0: 25Feb09 - Removed unneccessary code. moved common code from acmap.js
//                  Contains all JavaScript functions used by CMS-genereated HTML files 
//                  for the CHM output.


//TODO: Add Browser Detection code and global variable (if neccessary)
var isIE = false;
var isNS = false;
if (navigator.appName == "Microsoft Internet Explorer") {
    isIE = true;
}
else if (navigator.appName == "Netscape") {
    isNS = true;
}

//Global Method for attaching methods to the OnLoad event
// All other JS files should call AddOnLoadFunction
function AddOnLoadFunction(fn) {
    try {
        if (window.attachEvent) {
            window.attachEvent('onload', fn);
        } else if (window.addEventListener) {
            window.addEventListener('load', fn, false);
        } else {
            var __onload = window.onload;
            window.onload = function() {
                fn();
                __onload();
            };
        }
    } catch (e) {

    }
}

//Display the comments page
function doComments(path) {
  
  var stitle = document.title;
  stitle = stitle.replace( /[\?]/g, "_" );  // remove question marks from title (others?)
  
  var surl   = unescape(location.href);
  surl = surl.replace( /#.*$/, "" );  // strip hash and all that follows

  var chmpath;
  var i = surl.indexOf("::");
  if( i == -1 ) {
    i = surl.lastIndexOf("/"); 
    chmpath = surl.substring(0,i+1);
  } else {
    chmpath = surl.substring(0,i+3);
  }
  //Display a fixed height window with none of the browser chrome
  window.open(chmpath + path + "#" + stitle + " [" + surl + "]", null,
              "height=450,width=450,resizable=yes,directories=no,location=no,menubar=no,status=no,toolbar=no" );
}

// Display/Hide nav button info text
function hideInfo() {
    var info = document.getElementById('infoline');
    info.innerHTML = ' ';
    info.style.visibility = 'hidden';
}

function showInfo(title) {
    var info = document.getElementById('infoline');
    info.innerHTML = title;
    info.style.visibility = 'visible';
}

//-------------------------------------------
// Added by IntelliArts
//-------------------------------------------
function trimRelativePath(path) {
    if (path.indexOf('./') === 0) {
        return trimRelativePath(path.substring(2));
    } else if (path.indexOf('../') === 0) {
        return trimRelativePath(path.substring(3));
    } else if (path.indexOf('../') > 0) {
        if (path.indexOf('/') < path.indexOf('../')) {
            return trimRelativePath(path.substring(0, path.indexOf('/')) + path.substring(path.indexOf('../') + 3));
        } else {
            return path;
        }
    } else {
        return path;
    }
}

function swapImage(theImgObj, theImage1, theImage2) {
    if (theImgObj.src.search(trimRelativePath(theImage1)) > 0 || theImage1 == theImgObj.src) {
        theImgObj.src = theImage2;
    } else {
        theImgObj.src = theImage1;
    }
}

function showExpandedImage(theImgObj, theImage) {
    if (theImgObj.src != theImage) {
        theImgObj.src = theImage;
    }
}

function hideElement(theEl) {
    theEl.style.display = 'none';
}
function showElement(theEl) {
    theEl.style.display = '';
}

function showHide(theId) {
    if (document.getElementById) { // DOM3 = IE5, NS6
        var el = document.getElementById(theId);
        if (el === null) {
            return;
        }
        if (el.style.display == 'none') {
            showElement(el);
        }
        else {
            hideElement(el);
        }
    }
}

function showBlock(theId) {
    if (document.getElementById) { // DOM3 = IE5, NS6
        var el = document.getElementById(theId);
        if (el === null) {
            return ;
        }
        if (el.style.display == 'none') {
            showElement(el);
        }
    }
}

// Used for External Links
function linkParser(fn) {
    var X, Y, sl, a, ra;
    ra = /:/;
    a = location.href.search(ra);
    if (a == 2) {
        X = 14;
    } else {
        X = 7;
    }
    sl = "\\";
    Y = location.href.lastIndexOf(sl) + 1;
    var tmpRes = location.href.substring(X, Y) + fn;
    if (!(location.href.search('file:///') >= 0)) {
        tmpRes = 'file:///' + tmpRes;
    }
    return tmpRes;
}

//Used for External Links
function linkHelpFile(fn, tn) {
    var fileUrl = linkParser(fn);
    var tmpRes = 'mk:@MSITStore:' + fileUrl;
    if (tn !== null) {
        tmpRes += '::/' + tn;
    }
    return tmpRes;
}

//-------------------------------------------
//ExpandAll CollapseAll scripts
/* essential global variables */
var divPattern;
var els;
var elsLen;
var collapseExists = false;
var collapseSection;
var expandSection;
var collapsedImagePath;
var expandedImagePath;

function CheckForCollapsible() {

    divPattern = new RegExp(/collapsible\w+/);
    els = document.getElementsByTagName('div');
    elsLen = els.length;
    collapseSection = document.getElementById("collapseAllSection");
    expandSection = document.getElementById("expandAllSection");

    var i = 0;
    while (i < elsLen && !collapseExists) {
        if (divPattern.test(els[i].getAttribute("id"))) {
            collapseExists = true;
        }
        i++;
    }

    if (collapseExists && expandSection !== null) {
        expandSection.style.display = "block";
        try {
            collapsedImagePath = document.getElementById("collapse_img").src;
            expandedImagePath = document.getElementById("expand_img").src;
        } catch (e) {
        }
    }

}   // function CheckForCollapsible()

// Add CheckForCollapsible to OnLoad
AddOnLoadFunction(CheckForCollapsible);


function swapLabel() {
    if (collapseSection.style.display == "block") {
        collapseSection.style.display = "none";
        expandSection.style.display = "block";
    } else {
        collapseSection.style.display = "block";
        expandSection.style.display = "none";
    }
}

function ExpandOrCollapse() {

    var imgPattern = new RegExp(/d\w+/);
    var imgID = document.getElementsByTagName('img');
    var imgIDLen = imgID.length;
        
    for (var i = 0; i < elsLen; i++) {
        var elsId = els[i].getAttribute("id")
        if (divPattern.test(elsId)) {
            showHide(elsId);
        }
    }

    for (var j = 0; j < imgIDLen; j++) {
        if (imgPattern.test(imgID[j].getAttribute("id"))) {
            swapImage(imgID[j], expandedImagePath, collapsedImagePath);
        }
    }

    swapLabel();
}

function ExpandAll() {

    var imgPattern = new RegExp(/d\w+/);
    var imgID = document.getElementsByTagName('img');
    var imgIDLen = imgID.length;
    var elID;

    for (var i = 0; i < elsLen; i++) {
        if (divPattern.test(els[i].getAttribute("id"))) {
            elID = els[i].getAttribute("id");
            showBlock(elID);
        }
    }

    for (var j = 0; j < imgIDLen; j++) {
        if (imgPattern.test(imgID[j].getAttribute("id"))) {
            showExpandedImage(imgID[j], expandedImagePath);
        }
    }

    swapLabel();
}

function CollapseAll() {

    window.location.reload();

}

// SIG // Begin signature block
// SIG // MIIZNgYJKoZIhvcNAQcCoIIZJzCCGSMCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFO38j7RjM594
// SIG // UjRvUzgupVd1nvEhoIIUMDCCA+4wggNXoAMCAQICEH6T
// SIG // 6/t8xk5Z6kuad9QG/DswDQYJKoZIhvcNAQEFBQAwgYsx
// SIG // CzAJBgNVBAYTAlpBMRUwEwYDVQQIEwxXZXN0ZXJuIENh
// SIG // cGUxFDASBgNVBAcTC0R1cmJhbnZpbGxlMQ8wDQYDVQQK
// SIG // EwZUaGF3dGUxHTAbBgNVBAsTFFRoYXd0ZSBDZXJ0aWZp
// SIG // Y2F0aW9uMR8wHQYDVQQDExZUaGF3dGUgVGltZXN0YW1w
// SIG // aW5nIENBMB4XDTEyMTIyMTAwMDAwMFoXDTIwMTIzMDIz
// SIG // NTk1OVowXjELMAkGA1UEBhMCVVMxHTAbBgNVBAoTFFN5
// SIG // bWFudGVjIENvcnBvcmF0aW9uMTAwLgYDVQQDEydTeW1h
// SIG // bnRlYyBUaW1lIFN0YW1waW5nIFNlcnZpY2VzIENBIC0g
// SIG // RzIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
// SIG // AQCxrLNJVEuXHBIK2CV5kSJXKm/cuCbEQ3Nrwr8uUFr7
// SIG // FMJ2jkMBJUO0oeJF9Oi3e8N0zCLXtJQAAvdN7b+0t0Qk
// SIG // a81fRTvRRM5DEnMXgotptCvLmR6schsmTXEfsTHd+1Fh
// SIG // AlOmqvVJLAV4RaUvic7nmef+jOJXPz3GktxK+Hsz5HkK
// SIG // +/B1iEGc/8UDUZmq12yfk2mHZSmDhcJgFMTIyTsU2sCB
// SIG // 8B8NdN6SIqvK9/t0fCfm90obf6fDni2uiuqm5qonFn1h
// SIG // 95hxEbziUKFL5V365Q6nLJ+qZSDT2JboyHylTkhE/xni
// SIG // RAeSC9dohIBdanhkRc1gRn5UwRN8xXnxycFxAgMBAAGj
// SIG // gfowgfcwHQYDVR0OBBYEFF+a9W5czMx0mtTdfe8/2+xM
// SIG // gC7dMDIGCCsGAQUFBwEBBCYwJDAiBggrBgEFBQcwAYYW
// SIG // aHR0cDovL29jc3AudGhhd3RlLmNvbTASBgNVHRMBAf8E
// SIG // CDAGAQH/AgEAMD8GA1UdHwQ4MDYwNKAyoDCGLmh0dHA6
// SIG // Ly9jcmwudGhhd3RlLmNvbS9UaGF3dGVUaW1lc3RhbXBp
// SIG // bmdDQS5jcmwwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDgYD
// SIG // VR0PAQH/BAQDAgEGMCgGA1UdEQQhMB+kHTAbMRkwFwYD
// SIG // VQQDExBUaW1lU3RhbXAtMjA0OC0xMA0GCSqGSIb3DQEB
// SIG // BQUAA4GBAAMJm495739ZMKrvaLX64wkdu0+CBl03X6ZS
// SIG // nxaN6hySCURu9W3rWHww6PlpjSNzCxJvR6muORH4KrGb
// SIG // sBrDjutZlgCtzgxNstAxpghcKnr84nodV0yoZRjpeUBi
// SIG // JZZux8c3aoMhCI5B6t3ZVz8dd0mHKhYGXqY4aiISo1EZ
// SIG // g362MIIEozCCA4ugAwIBAgIQDs/0OMj+vzVuBNhqmBsa
// SIG // UDANBgkqhkiG9w0BAQUFADBeMQswCQYDVQQGEwJVUzEd
// SIG // MBsGA1UEChMUU3ltYW50ZWMgQ29ycG9yYXRpb24xMDAu
// SIG // BgNVBAMTJ1N5bWFudGVjIFRpbWUgU3RhbXBpbmcgU2Vy
// SIG // dmljZXMgQ0EgLSBHMjAeFw0xMjEwMTgwMDAwMDBaFw0y
// SIG // MDEyMjkyMzU5NTlaMGIxCzAJBgNVBAYTAlVTMR0wGwYD
// SIG // VQQKExRTeW1hbnRlYyBDb3Jwb3JhdGlvbjE0MDIGA1UE
// SIG // AxMrU3ltYW50ZWMgVGltZSBTdGFtcGluZyBTZXJ2aWNl
// SIG // cyBTaWduZXIgLSBHNDCCASIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggEPADCCAQoCggEBAKJjCzlEuLsjp0RJuw7/ofBhClOT
// SIG // sJjbrSwPSsVu/4Y8U1UPFc4EPyv9qZaW2b5heQtbyUyG
// SIG // duXgQ0sile7CK0PBn9hotI5AT+6FOLkRxSPyZFjwFTJv
// SIG // TlehroikAtcqHs1L4d1j1ReJMluwXplaqJ0oUA4X7pbb
// SIG // YTtFUR3PElYLkkf8q672Zj1HrHBy55LnX80QucSDZJQZ
// SIG // vSWA4ejSIqXQugJ6oXeTW2XD7hd0vEGGKtwITIySjJEt
// SIG // nndEH2jWqHR32w5bMotWizO92WPISZ06xcXqMwvS8aMb
// SIG // 9Iu+2bNXizveBKd6IrIkri7HcMW+ToMmCPsLvalPmQjh
// SIG // EChyqs0CAwEAAaOCAVcwggFTMAwGA1UdEwEB/wQCMAAw
// SIG // FgYDVR0lAQH/BAwwCgYIKwYBBQUHAwgwDgYDVR0PAQH/
// SIG // BAQDAgeAMHMGCCsGAQUFBwEBBGcwZTAqBggrBgEFBQcw
// SIG // AYYeaHR0cDovL3RzLW9jc3Aud3Muc3ltYW50ZWMuY29t
// SIG // MDcGCCsGAQUFBzAChitodHRwOi8vdHMtYWlhLndzLnN5
// SIG // bWFudGVjLmNvbS90c3MtY2EtZzIuY2VyMDwGA1UdHwQ1
// SIG // MDMwMaAvoC2GK2h0dHA6Ly90cy1jcmwud3Muc3ltYW50
// SIG // ZWMuY29tL3Rzcy1jYS1nMi5jcmwwKAYDVR0RBCEwH6Qd
// SIG // MBsxGTAXBgNVBAMTEFRpbWVTdGFtcC0yMDQ4LTIwHQYD
// SIG // VR0OBBYEFEbGaaMOShQe1UzaUmMXP142vA3mMB8GA1Ud
// SIG // IwQYMBaAFF+a9W5czMx0mtTdfe8/2+xMgC7dMA0GCSqG
// SIG // SIb3DQEBBQUAA4IBAQB4O7SRKgBM8I9iMDd4o4QnB28Y
// SIG // st4l3KDUlAOqhk4ln5pAAxzdzuN5yyFoBtq2MrRtv/Qs
// SIG // JmMz5ElkbQ3mw2cO9wWkNWx8iRbG6bLfsundIMZxD82V
// SIG // dNy2XN69Nx9DeOZ4tc0oBCCjqvFLxIgpkQ6A0RH83Vx2
// SIG // bk9eDkVGQW4NsOo4mrE62glxEPwcebSAe6xp9P2ctgwW
// SIG // K/F/Wwk9m1viFsoTgW0ALjgNqCmPLOGy9FqpAa8VnCwv
// SIG // SRvbIrvD/niUUcOGsYKIXfA9tFGheTMrLnu53CAJE3Hr
// SIG // ahlbz+ilMFcsiUk/uc9/yb8+ImhjU5q9aXSsxR08f5Lg
// SIG // w7wc2AR1MIIFhTCCBG2gAwIBAgIQKcFbP6rNUmpOZ708
// SIG // Tn4/8jANBgkqhkiG9w0BAQUFADCBtDELMAkGA1UEBhMC
// SIG // VVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8wHQYD
// SIG // VQQLExZWZXJpU2lnbiBUcnVzdCBOZXR3b3JrMTswOQYD
// SIG // VQQLEzJUZXJtcyBvZiB1c2UgYXQgaHR0cHM6Ly93d3cu
// SIG // dmVyaXNpZ24uY29tL3JwYSAoYykxMDEuMCwGA1UEAxMl
// SIG // VmVyaVNpZ24gQ2xhc3MgMyBDb2RlIFNpZ25pbmcgMjAx
// SIG // MCBDQTAeFw0xMjA3MjUwMDAwMDBaFw0xNTA5MjAyMzU5
// SIG // NTlaMIHIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2Fs
// SIG // aWZvcm5pYTETMBEGA1UEBxMKU2FuIFJhZmFlbDEWMBQG
// SIG // A1UEChQNQXV0b2Rlc2ssIEluYzE+MDwGA1UECxM1RGln
// SIG // aXRhbCBJRCBDbGFzcyAzIC0gTWljcm9zb2Z0IFNvZnR3
// SIG // YXJlIFZhbGlkYXRpb24gdjIxHzAdBgNVBAsUFkRlc2ln
// SIG // biBTb2x1dGlvbnMgR3JvdXAxFjAUBgNVBAMUDUF1dG9k
// SIG // ZXNrLCBJbmMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQCoYmDrmd0Gq8ezSsDlfgaJFEFplNPNhWzM
// SIG // 2uFQaYAB/ggpQ11+N4B6ao+TqrNIWDIqt3JKhaU889nx
// SIG // l/7teWGwuOurstI2Z0bEDhXiXam/bicK2HVLyntliQ+6
// SIG // tT+nlgfN8tgB2NzM0BpE1YCnU2b6DwQw4V7BV+/F//83
// SIG // yGFOpePlumzXxNw9EKWkaq81slmmTxf7UxZgP9PGbLw8
// SIG // gLAPk4PTJI97+5BBqhkLb1YqSfWn3PNMfsNKhw/VwAN0
// SIG // dRKeM6H8SkOdz+osr+NyH86lsKQuics4fwK5uFSHQHsI
// SIG // t6Z0tqWvminRqceUi9ugRlGryh9X1ZqCqfL/ggdzYa3Z
// SIG // AgMBAAGjggF7MIIBdzAJBgNVHRMEAjAAMA4GA1UdDwEB
// SIG // /wQEAwIHgDBABgNVHR8EOTA3MDWgM6Axhi9odHRwOi8v
// SIG // Y3NjMy0yMDEwLWNybC52ZXJpc2lnbi5jb20vQ1NDMy0y
// SIG // MDEwLmNybDBEBgNVHSAEPTA7MDkGC2CGSAGG+EUBBxcD
// SIG // MCowKAYIKwYBBQUHAgEWHGh0dHBzOi8vd3d3LnZlcmlz
// SIG // aWduLmNvbS9ycGEwEwYDVR0lBAwwCgYIKwYBBQUHAwMw
// SIG // cQYIKwYBBQUHAQEEZTBjMCQGCCsGAQUFBzABhhhodHRw
// SIG // Oi8vb2NzcC52ZXJpc2lnbi5jb20wOwYIKwYBBQUHMAKG
// SIG // L2h0dHA6Ly9jc2MzLTIwMTAtYWlhLnZlcmlzaWduLmNv
// SIG // bS9DU0MzLTIwMTAuY2VyMB8GA1UdIwQYMBaAFM+Zqep7
// SIG // JvRLyY6P1/AFJu/j0qedMBEGCWCGSAGG+EIBAQQEAwIE
// SIG // EDAWBgorBgEEAYI3AgEbBAgwBgEBAAEB/zANBgkqhkiG
// SIG // 9w0BAQUFAAOCAQEA2OkGvuiY7TyI6yVTQAYmTO+MpOFG
// SIG // C8MflHSbofJiuLxrS1KXbkzsAPFPPsU1ouftFhsXFtDQ
// SIG // 8rMTq/jwugTpbJUREV0buEkLl8AKRhYQTKBKg1I/puBv
// SIG // bkJocDE0pRwtBz3xSlXXEwyYPcbCOnrM3OZ5bKx1Qiii
// SIG // vixlcGWhO3ws904ssutPFf4mV5PDi3U2Yp1HgbBK/Um/
// SIG // FLr6YAYeZaA8KY1CfQEisF3UKTwm72d7S+fJf++SOGea
// SIG // K0kumehVcbavQJTOVebuZ9V+qU0nk1lMrqve9BnQK69B
// SIG // QqNZu77vCO0wm81cfynAxkOYKZG3idY47qPJOgXKkwmI
// SIG // 2+92ozCCBgowggTyoAMCAQICEFIA5aolVvwahu2WydRL
// SIG // M8cwDQYJKoZIhvcNAQEFBQAwgcoxCzAJBgNVBAYTAlVT
// SIG // MRcwFQYDVQQKEw5WZXJpU2lnbiwgSW5jLjEfMB0GA1UE
// SIG // CxMWVmVyaVNpZ24gVHJ1c3QgTmV0d29yazE6MDgGA1UE
// SIG // CxMxKGMpIDIwMDYgVmVyaVNpZ24sIEluYy4gLSBGb3Ig
// SIG // YXV0aG9yaXplZCB1c2Ugb25seTFFMEMGA1UEAxM8VmVy
// SIG // aVNpZ24gQ2xhc3MgMyBQdWJsaWMgUHJpbWFyeSBDZXJ0
// SIG // aWZpY2F0aW9uIEF1dGhvcml0eSAtIEc1MB4XDTEwMDIw
// SIG // ODAwMDAwMFoXDTIwMDIwNzIzNTk1OVowgbQxCzAJBgNV
// SIG // BAYTAlVTMRcwFQYDVQQKEw5WZXJpU2lnbiwgSW5jLjEf
// SIG // MB0GA1UECxMWVmVyaVNpZ24gVHJ1c3QgTmV0d29yazE7
// SIG // MDkGA1UECxMyVGVybXMgb2YgdXNlIGF0IGh0dHBzOi8v
// SIG // d3d3LnZlcmlzaWduLmNvbS9ycGEgKGMpMTAxLjAsBgNV
// SIG // BAMTJVZlcmlTaWduIENsYXNzIDMgQ29kZSBTaWduaW5n
// SIG // IDIwMTAgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQD1I0tepdeKuzLp1Ff37+THJn6tGZj+qJ19
// SIG // lPY2axDXdYEwfwRof8srdR7NHQiM32mUpzejnHuA4Jnh
// SIG // 7jdNX847FO6G1ND1JzW8JQs4p4xjnRejCKWrsPvNamKC
// SIG // TNUh2hvZ8eOEO4oqT4VbkAFPyad2EH8nA3y+rn59wd35
// SIG // BbwbSJxp58CkPDxBAD7fluXF5JRx1lUBxwAmSkA8taEm
// SIG // qQynbYCOkCV7z78/HOsvlvrlh3fGtVayejtUMFMb32I0
// SIG // /x7R9FqTKIXlTBdOflv9pJOZf9/N76R17+8V9kfn+Bly
// SIG // 2C40Gqa0p0x+vbtPDD1X8TDWpjaO1oB21xkupc1+NC2J
// SIG // AgMBAAGjggH+MIIB+jASBgNVHRMBAf8ECDAGAQH/AgEA
// SIG // MHAGA1UdIARpMGcwZQYLYIZIAYb4RQEHFwMwVjAoBggr
// SIG // BgEFBQcCARYcaHR0cHM6Ly93d3cudmVyaXNpZ24uY29t
// SIG // L2NwczAqBggrBgEFBQcCAjAeGhxodHRwczovL3d3dy52
// SIG // ZXJpc2lnbi5jb20vcnBhMA4GA1UdDwEB/wQEAwIBBjBt
// SIG // BggrBgEFBQcBDARhMF+hXaBbMFkwVzBVFglpbWFnZS9n
// SIG // aWYwITAfMAcGBSsOAwIaBBSP5dMahqyNjmvDz4Bq1EgY
// SIG // LHsZLjAlFiNodHRwOi8vbG9nby52ZXJpc2lnbi5jb20v
// SIG // dnNsb2dvLmdpZjA0BgNVHR8ELTArMCmgJ6AlhiNodHRw
// SIG // Oi8vY3JsLnZlcmlzaWduLmNvbS9wY2EzLWc1LmNybDA0
// SIG // BggrBgEFBQcBAQQoMCYwJAYIKwYBBQUHMAGGGGh0dHA6
// SIG // Ly9vY3NwLnZlcmlzaWduLmNvbTAdBgNVHSUEFjAUBggr
// SIG // BgEFBQcDAgYIKwYBBQUHAwMwKAYDVR0RBCEwH6QdMBsx
// SIG // GTAXBgNVBAMTEFZlcmlTaWduTVBLSS0yLTgwHQYDVR0O
// SIG // BBYEFM+Zqep7JvRLyY6P1/AFJu/j0qedMB8GA1UdIwQY
// SIG // MBaAFH/TZafC3ey78DAJ80M5+gKvMzEzMA0GCSqGSIb3
// SIG // DQEBBQUAA4IBAQBWIuY0pMRhy0i5Aa1WqGQP2YyRxLvM
// SIG // DOWteqAif99HOEotbNF/cRp87HCpsfBP5A8MU/oVXv50
// SIG // mEkkhYEmHJEUR7BMY4y7oTTUxkXoDYUmcwPQqYxkbdxx
// SIG // kuZFBWAVWVE5/FgUa/7UpO15awgMQXLnNyIGCb4j6T9E
// SIG // mh7pYZ3MsZBc/D3SjaxCPWU21LQ9QCiPmxDPIybMSyDL
// SIG // kB9djEw0yjzY5TfWb6UgvTTrJtmuDefFmvehtCGRM2+G
// SIG // 6Fi7JXx0Dlj+dRtjP84xfJuPG5aexVN2hFucrZH6rO2T
// SIG // ul3IIVPCglNjrxINUIcRGz1UUpaKLJw9khoImgUux5Ol
// SIG // SJHTMYIEcjCCBG4CAQEwgckwgbQxCzAJBgNVBAYTAlVT
// SIG // MRcwFQYDVQQKEw5WZXJpU2lnbiwgSW5jLjEfMB0GA1UE
// SIG // CxMWVmVyaVNpZ24gVHJ1c3QgTmV0d29yazE7MDkGA1UE
// SIG // CxMyVGVybXMgb2YgdXNlIGF0IGh0dHBzOi8vd3d3LnZl
// SIG // cmlzaWduLmNvbS9ycGEgKGMpMTAxLjAsBgNVBAMTJVZl
// SIG // cmlTaWduIENsYXNzIDMgQ29kZSBTaWduaW5nIDIwMTAg
// SIG // Q0ECECnBWz+qzVJqTme9PE5+P/IwCQYFKw4DAhoFAKBw
// SIG // MBAGCisGAQQBgjcCAQwxAjAAMBkGCSqGSIb3DQEJAzEM
// SIG // BgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgor
// SIG // BgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBS3wO5roU69
// SIG // tZ8mbptxphDThxVyGjANBgkqhkiG9w0BAQEFAASCAQAY
// SIG // eMYL3wvKArihQdZzZGRujQxfpEpsNsdYi69w81oH/FIK
// SIG // nqPUQGeXuJQHxbvpNtdiuFVWFXm3sOcCUQdPnFthLxBL
// SIG // JTO2bMZzt1paPuutMST0ZR/gTPRoA5ZWx4JbXT4KBECO
// SIG // XVA6RXk1ShPt5IDVUwu/Q4j2VtoRatnvbLz9jmbQVSm/
// SIG // RdHxMMqOgomBkc2DqG6L2O2gXYN+hLLeKkacavH3SGhL
// SIG // zzWsTFITUPrjo+TZb1Vf+wstokpb+yiwsGnOmZjrr7e3
// SIG // aWt6gnEL5iTtPnj+LoV5V2kIojrqIxf3nT6JrL2P6fVM
// SIG // AGIVOJL34iqCqW7J18pkCdEnqO1xBX3FoYICCzCCAgcG
// SIG // CSqGSIb3DQEJBjGCAfgwggH0AgEBMHIwXjELMAkGA1UE
// SIG // BhMCVVMxHTAbBgNVBAoTFFN5bWFudGVjIENvcnBvcmF0
// SIG // aW9uMTAwLgYDVQQDEydTeW1hbnRlYyBUaW1lIFN0YW1w
// SIG // aW5nIFNlcnZpY2VzIENBIC0gRzICEA7P9DjI/r81bgTY
// SIG // apgbGlAwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzEL
// SIG // BgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTE1MDMw
// SIG // NTE1MDIzNFowIwYJKoZIhvcNAQkEMRYEFC/Xce5L4Nef
// SIG // V5HpsNm+x4ABF7PRMA0GCSqGSIb3DQEBAQUABIIBAI1Q
// SIG // Osyim1BWDaGnGp8ptrIxSlCxexf0VZNKUxy9vrlBkzqK
// SIG // nTf2u+VPIUb+OEeTuMKMGd4g5SmNS7lbl0jmeuQiodEh
// SIG // 0V04rFajlFEM3CVYf2/BuOeHTxeiEYf5EIMw8pjDzWOv
// SIG // KAhsbGTL9BxgHB6bXxnfhMhSHE4B3zV3QCV7rkOm+JBC
// SIG // alf51HpLmZQbGPs7/FvDhN9r+NUJyyU35FPoLo/vTXbg
// SIG // DSCDH/rrdwuDhmyBZ8/SgE2fMPVF2/CcsZkXjdyqpNrn
// SIG // IH0VVHtWSGgFZiZDHEuhnEW/2FWCTYKzAGg6yw02JGZI
// SIG // nRu5RYKs1g7vbPT1AZPXG6/OlbW6/7Y=
// SIG // End signature block
