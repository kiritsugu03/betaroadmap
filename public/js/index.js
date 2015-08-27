var sitemap;
var map;
var siteCount;
var from = 0;
var limit = 10;

$(document).ready(function(){
    $('#table-data').click(function(){
        if(event.target == $('#table-data')[0]) {
            if($('#table-data').height() == 100) {
                $('#table-data').height(400);
            }
            else {
                $('#table-data').height(100);
            }
        }
    });
});

function CenterControl(controlDiv, map, center) {
  // We set up a variable for this since we're adding event listeners later.
  var control = this;

  // Set the center property upon construction
  control.center_ = center;
  controlDiv.style.clear = 'both';

  // Set CSS for the control border
  var goCenterUI = document.createElement('div');
  goCenterUI.id = 'goCenterUI';
  goCenterUI.title = 'Click to recenter the map';
  controlDiv.appendChild(goCenterUI);

  // Set CSS for the control interior
  var goCenterText = document.createElement('div');
  goCenterText.id = 'goCenterText';
  goCenterText.innerHTML = 'Home';
  goCenterUI.appendChild(goCenterText);

  // Set up the click event listener for 'Center Map': Set the center of the map
  // to the current center of the control.
  goCenterUI.addEventListener('click', function() {
    var currentCenter = control.getCenter();
    map.setCenter(currentCenter);
  });
}
CenterControl.prototype.getCenter = function() {
  return this.center_;
};
function initMap() {
    $.ajax({
        type: "GET",
        url: 'http://localhost:8080/api/sites',
        dataType: 'json',
        success: function(data) {
            sitemap = data;
            siteCount = sitemap.length;
            setPoints();
            requestData(0);
            loadPages();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
    var myLatLng = {lat: 14.655663, lng: 121.0607978};
    var bounds = new google.maps.LatLngBounds();

    map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.TOP_RIGHT,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.TOP_LEFT
            },
        panControl: true,
        panControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.TOP_LEFT
            },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        streetViewControl:false
    });
      var input = /** @type {!HTMLInputElement} */(
      document.getElementById('pac-input'));

      var types = document.getElementById('type-selector');
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);
      // Create the DIV to hold the control and call the CenterControl() constructor
      // passing in this DIV.
      var centerControlDiv = document.createElement('div');
      var centerControl = new CenterControl(centerControlDiv, map, myLatLng);

      centerControlDiv.index = 1;
      centerControlDiv.style['padding-top'] = '10px';
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);

      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo('bounds', map);

      var infowindow = new google.maps.InfoWindow();
      var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
      });

      autocomplete.addListener('place_changed', function() {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          window.alert("Autocomplete's returned place contains no geometry");
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);
      });

      // Sets a listener on a radio button to change the filter type on Places
      // Autocomplete.
      function setupClickListener(id, types) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
          autocomplete.setTypes(types);
        });
      }

      setupClickListener('changetype-all', []);
      setupClickListener('changetype-address', ['address']);
      setupClickListener('changetype-establishment', ['establishment']);
      setupClickListener('changetype-geocode', ['geocode']);
    }
function setPoints() {
    var markers = [];
    for (var site in sitemap) {

        var marker = new google.maps.Marker({
            position: {
                lat: sitemap[site].position.latitude,
                lng: sitemap[site].position.longitude
            },
            title: 'Site Name: '+ sitemap[site].site_name,
            content: 'Site Operator: ' + sitemap[site].operator + '<br/>' + 'Site Type: ' +
            sitemap[site].site_type + '<br/>' + 'Technology: ' + sitemap[site].technology,
            icon: "https://www.google.com/support/enterprise/static/geo/cdate/art/dots/blue_dot.png"
        });

        var bounds = new google.maps.LatLngBounds();
        bounds.extend(marker.position);

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                map.setZoom(18);
                map.setCenter(marker.getPosition());

                var contentString = marker.title + '<br/>' + marker.content;
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                infowindow.open(map, marker);
            }
        })(marker, site));
        markers.push(marker);
    } 
    var mcOptions = {gridSize: 50, maxZoom: 15};
    var markerCluster = new MarkerClusterer(map, markers, mcOptions);
}

function requestData(from_)
{
    from = from_;

    $.ajax({
        type: "GET",
        url: 'http://localhost:8080/api/sites/' + from_ + '/' + limit,
        dataType: 'json',
        success: function(data) {
            sitemap = data;
            loadTable();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}


function loadTable() {
    var tableBody = document.getElementById("tableBody");
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    
    for (var siteData in sitemap) {
        var tr = document.createElement("tr");
        var a = document.createElement("a");
        a.setAttribute('onclick', 'updateMapCenter(' + sitemap[siteData].position.latitude  + ', ' + sitemap[siteData].position.longitude +')');
        a.setAttribute('href', '#');
        var td2 = document.createElement("td");
        td2.appendChild(document.createTextNode(sitemap[siteData].site_name));
        a.appendChild(td2);
        tr.appendChild(a);
        var td3 = document.createElement("td");
        td3.appendChild(document.createTextNode(sitemap[siteData].site_id));
        tr.appendChild(td3);
        var td4 = document.createElement("td");
        td4.appendChild(document.createTextNode(sitemap[siteData].operator));
        tr.appendChild(td4);
        var td5 = document.createElement("td");
        td5.appendChild(document.createTextNode(sitemap[siteData].software_release));
        tr.appendChild(td5);
        var td6 = document.createElement("td");
        td6.appendChild(document.createTextNode(sitemap[siteData].technology));
        tr.appendChild(td6);
        var td7 = document.createElement("td");
        td7.appendChild(document.createTextNode(sitemap[siteData].site_type));
        tr.appendChild(td7);
        var td8 = document.createElement("td");
        td8.appendChild(document.createTextNode(sitemap[siteData].controller_id));
        tr.appendChild(td8);
        var td9 = document.createElement("td");
        td9.appendChild(document.createTextNode(sitemap[siteData].operating_bands));
        tr.appendChild(td9);
        var td10 = document.createElement("td");
        td10.appendChild(document.createTextNode(sitemap[siteData].site_layouts));
        tr.appendChild(td10);
        tableBody.appendChild(tr);
    }
}

function loadPages()
{
    var numPages = Math.ceil(siteCount/limit);
    var options = {
        currentPage: 1,
        totalPages: numPages,
        numberOfPages: 10,
        alignment:'center',
        onPageClicked: function(e,originalEvent,type,page){
            requestData((page-1)*10);
        }
    }

    $('#div-page').bootstrapPaginator(options);
}

function updateMapCenter (latitude, longitude) {
    map.setCenter({lat:latitude, lng:longitude});
    map.setZoom(18);
}

function searchSiteName()
{
    $.ajax({
        type: "GET",
        url: 'http://localhost:8080/api/sites/' + $('#searchSite').val(),
        dataType: 'json',
        success: function(data) {
          updateMapCenter(data[0].position.latitude, data[0].position.longitude);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
        }
    });
}